import { AttributeValues, Connection, Connections, IJolokiaService, JolokiaListMethod, JolokiaService, jolokiaService, JolokiaStoredOptions } from '@hawtio/react'
import Jolokia, { IJolokia, IRequest, IResponse, IResponseFn, ISimpleOptions, IErrorResponse, ISimpleResponseFn, IErrorResponseFn, IOptionsBase } from 'jolokia.js'

//import { joinPaths } from '@hawtio/react'
import { log } from '../globals'

export interface BrokerDetails {
  name: string
  version: string
  brokerMBean: string
  updated: boolean
}

export interface BrokerStatus {
  globalMaxSize: number
  addressMemoryUsage: number
  used: number
  uptime: string
}

export interface BrokerConnection {
  connection: Connection
  brokerDetails: BrokerDetails
  brokerStatus: BrokerStatus
  getJolokiaService(): IJolokiaService
}

export interface BrokerConnections {
  [key: string]: BrokerConnection
}

class BrokerService {

  loadStatus = (globalMaxSize: number, addressMemoryUsage: number, uptime: string) => {
    var used = 0;
    var addressMemoryUsageMB = 0;
    var globalMaxSizeMB = globalMaxSize / 1048576;
    if (addressMemoryUsage > 0) {
      addressMemoryUsageMB = addressMemoryUsage / 1048576;
      used = addressMemoryUsageMB/globalMaxSizeMB * 100
    }
    var status: BrokerStatus = {
      globalMaxSize: globalMaxSizeMB,
      addressMemoryUsage: addressMemoryUsageMB,
      used: used,
      uptime: uptime
    }
    return status;
  }

  /**
   * Create a Jolokia instance with the given connection.
   */
  createJolokia(connection: Connection, checkCredentials = false): IJolokia {
      if (checkCredentials) {
        return new Jolokia({
          url: this.getJolokiaUrl(connection),
          method: 'post',
          mimeType: 'application/json',
          username: connection.username,
          password: connection.password
        })
      }
  
      return new Jolokia({
        url: this.getJolokiaUrl(connection),
        method: 'post',
        mimeType: 'application/json'
      })
    }

    /**
   * Get the Jolokia URL for the given connection.
   */
  getJolokiaUrl(connection: Connection): string {
    if (connection.jolokiaUrl) {
      log.debug("Using provided URL:", connection.jolokiaUrl)
      return connection.jolokiaUrl
    }

    // TODO: Better handling of doc base and proxy URL construction
    const url = joinPaths(
      '/proxy',
      connection.scheme || 'http',
      connection.host || 'localhost',
      String(connection.port || 80),
      connection.path)
    log.debug("Using URL:", url)
    return url
  }

  createJolokiaService(connection: Connection): IJolokiaService {
    return new BrokerJolokiaService(connection);
  }

  createBrokers(connections: Connections): BrokerConnections {
    var brokerConnections: BrokerConnections = ({});
    for (const [key, connection] of Object.entries(connections)) {
      var jolokia = this.createJolokia(connection);
        var response = jolokia.request({ type: "read",  mbean: "org.apache.activemq.artemis:broker=*",  attribute: "Name"}, {}) as AttributeValues;
        log.debug("resp=" + JSON.stringify(response))
        var brokerDetails: BrokerDetails;
        var brokerStatus: BrokerStatus = {addressMemoryUsage: 0, uptime: 'unknown', globalMaxSize: 0, used: 0};
        if(response) {
          var responses = response.value
          var brokerMBeanName = Object.keys(responses as Object)[0];
          var name = Object.values(responses as Object)[0].Name
          var version = jolokia.getAttribute(brokerMBeanName, "Version") as string;
          brokerDetails = {name: name, brokerMBean: brokerMBeanName, version: version, updated: true}
          var globalMaxSize = jolokia.getAttribute(brokerMBeanName, "GlobalMaxSize"); 
          var addressMemoryUsage = jolokia.getAttribute(brokerMBeanName, "AddressMemoryUsage");
          var uptime = jolokia.getAttribute(brokerMBeanName, "Uptime");
          brokerStatus = brokerService.loadStatus(globalMaxSize as number, addressMemoryUsage as number, uptime as string);
          log.info(JSON.stringify(brokerStatus));

        } else {
          brokerDetails =  {name: 'unknown', brokerMBean: '', version: 'unknown', updated: false};
        }
      brokerConnections[key] = {connection: connection, brokerDetails: brokerDetails, brokerStatus: brokerStatus, getJolokiaService: () => this.createJolokiaService(connection)} 
    }
    return brokerConnections
  }

  async createBroker(jolokiaService: IJolokiaService): Promise<BrokerConnection> {  
    var search = await jolokiaService.search("org.apache.activemq.artemis:broker=*");
    var brokerMBeanName = search[0];
    log.debug("resp=" + JSON.stringify(search[0]))
    var response = await jolokiaService.readAttributes(brokerMBeanName);
    log.debug("resp=" + JSON.stringify(response.Name))
    if(response) {
      var name = response.Name as string;
      var version = response.Version as string;
      var brokerDetails: BrokerDetails = {name: name, brokerMBean: brokerMBeanName, version: version, updated: true}
      var globalMaxSize = response.GlobalMaxSize as number; 
      var addressMemoryUsage = response.AddressMemoryUsage as number;
      var uptime = response.Uptime as string;
      var brokerStatus = brokerService.loadStatus(globalMaxSize as number, addressMemoryUsage, uptime as string);
      return {connection: {host: "", path: "", port: 0, scheme: "", name: name}, brokerDetails: brokerDetails, brokerStatus: brokerStatus, getJolokiaService: () => {return jolokiaService}}
    }
    throw new Error("foo");
  }


  updateBrokerStatus(brokerConnection: BrokerConnection): BrokerStatus {  
    var jolokia = brokerService.createJolokia(brokerConnection.connection);
    var globalMaxSize = jolokia.getAttribute(brokerConnection.brokerDetails.brokerMBean, "GlobalMaxSize"); 
    var addressMemoryUsage = jolokia.getAttribute(brokerConnection.brokerDetails.brokerMBean, "AddressMemoryUsage");
    var uptime = jolokia.getAttribute(brokerConnection.brokerDetails.brokerMBean, "Uptime");
    var status = brokerService.loadStatus(globalMaxSize as number, addressMemoryUsage as number, uptime as string);
    log.info(JSON.stringify(status));
    return status;
    } 
}

export const brokerService = new BrokerService()
function joinPaths(...paths: string[]) {
  const tmp: string[] = []
  paths.forEach((path, index) => {
    if (isBlank(path)) {
      return
    }
    if (path === '/') {
      tmp.push('')
      return
    }
    if (index !== 0 && path.match(/^\//)) {
      path = path.slice(1)
    }
    if (index < paths.length - 1 && path.match(/\/$/)) {
      path = path.slice(0, path.length - 1)
    }
    if (!isBlank(path)) {
      tmp.push(path)
    }
  })
  return tmp.join('/')
}

function isBlank(str: string) {
  if (str === undefined || str === null) {
    return true
  }
  if (typeof str !== 'string') {
    // not null but also not a string...
    return false
  }

  return str.trim().length === 0
}

class BrokerJolokiaService implements IJolokiaService {

  private jolokia: IJolokia;
  private jolokiaUrl: Promise<string>;
  constructor(connection: Connection) {
    this.jolokia = brokerService.createJolokia(connection, false);
    this.jolokiaUrl = new Promise<string> ((resolve, reject) => resolve("foo"));
  }
  getJolokiaUrl(): Promise<string | null> {
    return this.jolokiaUrl;
  }
  getListMethod(): Promise<JolokiaListMethod> {
    throw new Error('Method not implemented.')
  }
  list(options: ISimpleOptions): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  readAttributes(mbean: string): Promise<AttributeValues> {
    throw new Error('Method not implemented.')
  }
  readAttribute(mbean: string, attribute: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async execute(mbean: string, operation: string, args: unknown[] = []): Promise<unknown> {
    const jolokia = await this.jolokia
    return new Promise((resolve, reject) => {
      jolokia.execute(
        mbean,
        operation,
        ...args,
        onSimpleSuccessAndError(
          (response: unknown) => resolve(response),
          // TODO: move to OperationService
          (response: IErrorResponse) => reject(response.stacktrace || response.error),
        ),
      )
    })
  }
  search(mbeanPattern: string): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  bulkRequest(requests: IRequest[]): Promise<IResponse[]> {
    throw new Error('Method not implemented.')
  }
  register(request: IRequest, callback: IResponseFn): Promise<number> {
    throw new Error('Method not implemented.')
  }
  unregister(handle: number): void {
    throw new Error('Method not implemented.')
  }
  loadUpdateRate(): number {
    throw new Error('Method not implemented.')
  }
  saveUpdateRate(value: number): void {
    throw new Error('Method not implemented.')
  }
  loadAutoRefresh(): boolean {
    throw new Error('Method not implemented.')
  }
  saveAutoRefresh(value: boolean): void {
    throw new Error('Method not implemented.')
  }
  loadJolokiaStoredOptions(): JolokiaStoredOptions {
    throw new Error('Method not implemented.')
  }
  saveJolokiaStoredOptions(options: JolokiaStoredOptions): void {
    throw new Error('Method not implemented.')
  }
}

export function onSimpleSuccessAndError(
  successFn: ISimpleResponseFn,
  errorFn: IErrorResponseFn,
  options: ISimpleOptions = {},
): ISimpleOptions {
  return onGenericSuccessAndError(successFn, errorFn, options)
}

export function onGenericSuccessAndError<R, O extends IOptionsBase>(
  successFn: R,
  errorFn: IErrorResponseFn,
  options?: O,
): O {
  const defaultOptions: IOptionsBase = {
    method: 'POST',
    mimeType: 'application/json',
    // the default (unsorted) order is important for Karaf runtime
    canonicalNaming: false,
    canonicalProperties: false,
  }
  return Object.assign({}, defaultOptions, options, {
    success: successFn,
    error: errorFn,
  })
}


