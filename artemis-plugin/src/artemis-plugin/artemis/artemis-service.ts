import { ActiveSort, Filter } from './table/ArtemisTable'
import { jolokiaService, MBeanNode } from '@hawtio/react'
import { createAddressObjectName, createQueueObjectName } from './util/jmx'
import { log } from './globals'

export type BrokerInfo = {
    name: string
    nodeID: string
    objectName: string
    version: string
    started: string
    uptime: string
    globalMaxSizeMB: number
    addressMemoryUsage: number
    addressMemoryUsed: number
    haPolicy: string
    networkTopology: BrokerNetworkTopology
}

export class BrokerNetworkTopology {
    brokers: BrokerElement[];

    constructor(brokers: BrokerElement[]) {
        this.brokers = brokers;
    }

    getLiveCount(): number {
        return this.brokers.length;
    }

    getBackupCount(): number {
        var backups: number = 0;
        this.brokers.forEach( (broker) => {
            if(broker.backup) {
                backups = backups + 1;
            }
        })
        return backups;
    }
}

export type BrokerElement = {
    nodeID: string
    live: string
    backup?: string
}

export type Acceptor = {
    Name:string
    FactoryClassName: string
    Started: boolean
    Parameters: any
}

export type Acceptors = {
    acceptors: Acceptor[]
}

const BROKER_SEARCH_PATTERN = "org.apache.activemq.artemis:broker=*";
const LIST_NETWORK_TOPOLOGY_SIG="listNetworkTopology";
const SEND_MESSAGE_SIG = "sendMessage(java.util.Map, int, java.lang.String, boolean, java.lang.String, java.lang.String, boolean)";
const DELETE_ADDRESS_SIG = "deleteAddress(java.lang.String)";
const CREATE_QUEUE_SIG = "createQueue(java.lang.String, boolean)"
const CREATE_ADDRESS_SIG = "createAddress(java.lang.String, java.lang.String)"
const COUNT_MESSAGES_SIG = "countMessages()";
const COUNT_MESSAGES_SIG2 = "countMessages(java.lang.String)";
const BROWSE_SIG = "browse(int, int, java.lang.String)";
const LIST_PRODUCERS_SIG = "listProducers(java.lang.String, int, int)";
const LIST_CONNECTIONS_SIG = "listConnections(java.lang.String, int, int)";
const LIST_SESSIONS_SIG = "listSessions(java.lang.String, int, int)";
const LIST_CONSUMERS_SIG = "listConsumers(java.lang.String, int, int)";
const LIST_ADDRESSES_SIG = "listAddresses(java.lang.String, int, int)";
const LIST_QUEUES_SIG = "listQueues(java.lang.String, int, int)";
const DESTROY_QUEUE_SIG = "destroyQueue(java.lang.String)";
const REMOVE_ALL_MESSAGES_SIG = "removeAllMessages()";
const CLOSE_CONNECTION_SIG = "closeConnectionWithID(java.lang.String)";
const CLOSE_SESSION_SIG = "closeSessionWithID(java.lang.String,java.lang.String)";

class ArtemisService {

    private brokerObjectName: Promise<string>

    constructor() {
        this.brokerObjectName = this.initBrokerObjectName();    
    }

    private async initBrokerObjectName(): Promise<string> {
        var search = await jolokiaService.search(BROKER_SEARCH_PATTERN);
        return search[0]?search[0]:"";
    }

    async createBrokerInfo(): Promise<BrokerInfo> {       
        return new Promise<BrokerInfo>(async (resolve, reject) => { 
            var brokerObjectName = await this.brokerObjectName;
            var response = await jolokiaService.readAttributes(brokerObjectName);
            if (response) {
                var name = response.Name as string;
                var nodeID = response.NodeID as string;
                var version = response.Version as string;
                var started = "" + response.Started as string;
                var globalMaxSize = response.GlobalMaxSize as number;
                var addressMemoryUsage = response.AddressMemoryUsage as number;
                var uptime = response.Uptime as string;
                var used = 0;
                var haPolicy = response.HAPolicy as string;
                var addressMemoryUsageMB = 0;
                var globalMaxSizeMB = globalMaxSize / 1048576;
                if (addressMemoryUsage > 0) {
                    addressMemoryUsageMB = addressMemoryUsage / 1048576;
                    used = addressMemoryUsageMB / globalMaxSizeMB * 100
                }
                const topology = await jolokiaService.execute(brokerObjectName, LIST_NETWORK_TOPOLOGY_SIG) as string;
                var brokerInfo: BrokerInfo = {
                    name: name, objectName: brokerObjectName, 
                    nodeID: nodeID,
                    version: version,
                    started: started,
                    uptime: uptime,
                    globalMaxSizeMB: globalMaxSizeMB,
                    addressMemoryUsage: addressMemoryUsageMB,
                    addressMemoryUsed: used,
                    haPolicy: haPolicy,
                    networkTopology: new BrokerNetworkTopology(JSON.parse(topology))
                };
                resolve(brokerInfo);               
            }
            reject("invalid response:" + response);
        });
    }

    async createAcceptors(): Promise<Acceptors> {
        return new Promise<Acceptors>(async (resolve, reject) => { 
            var brokerObjectName = await this.brokerObjectName;
            const acceptorSearch = brokerObjectName + ",component=acceptors,name=*";

            var search = await jolokiaService.search(acceptorSearch);
            if (search) {
                const acceptors: Acceptors = {
                    acceptors: []
                };
                for (var key in search) {
                    const acceptor: Acceptor = await jolokiaService.readAttributes(search[key]) as Acceptor;
                    acceptors.acceptors.push(acceptor);
                }
                resolve(acceptors);               
            }
            reject("invalid response:");
        });
    }

    async doSendMessageToQueue(body: string, theHeaders: { name: string; value: string }[], durable: boolean, createMessageId: boolean, useCurrentlogon: boolean, username: string, password: string, routingType: string, queue: string, address: string) {
        const mbean = createQueueObjectName(await this.getBrokerObjectName(), address, routingType, queue);
        return await this.doSendMessage(mbean, body, theHeaders, durable, createMessageId, useCurrentlogon, username, password);
    }

    async doSendMessageToAddress(body: string, theHeaders: { name: string; value: string }[], durable: boolean, createMessageId: boolean, useCurrentlogon: boolean, username: string, password: string, address: string) {
        const mbean = createAddressObjectName(await this.getBrokerObjectName(), address);
        return await this.doSendMessage(mbean, body, theHeaders, durable, createMessageId, useCurrentlogon, username, password);
    }

    async doSendMessage(mbean: string, body: string, theHeaders: { name: string; value: string }[], durable: boolean, createMessageId: boolean, useCurrentlogon: boolean, username: string, password: string) {
        var type = 3;
        var user = useCurrentlogon ? null : username;
        var pwd = useCurrentlogon ? null : password;
        var headers: { [id: string]: string; } = {};
        theHeaders.forEach(function (object) {
            var key = object.name;
            if (key) {
                headers[key] = object.value;
            }
        });
        log.debug("About to send headers: " + JSON.stringify(headers));
        return await jolokiaService.execute(mbean, SEND_MESSAGE_SIG, [headers, type, body, durable, user, pwd, createMessageId]);
    }


    async deleteAddress(address: string) {
        return await jolokiaService.execute(await this.getBrokerObjectName(), DELETE_ADDRESS_SIG, [address])
    }

    async createQueue(queueConfiguration: string) {
        return await jolokiaService.execute(await this.getBrokerObjectName() , CREATE_QUEUE_SIG, [queueConfiguration, false]).then().catch() as string;
    }

    async createAddress(address: string, routingType: string) {
        return await jolokiaService.execute(await this.getBrokerObjectName(), CREATE_ADDRESS_SIG, [address, routingType])
    }

    async getMessages(mBean: string, page: number, perPage: number, filter: string) {
        var count: number;
        if (filter && filter.length > 0) {
            count = await jolokiaService.execute(mBean, COUNT_MESSAGES_SIG2, [filter]) as number;
        } else {
            count = await jolokiaService.execute(mBean, COUNT_MESSAGES_SIG) as number;
        }
        const messages = await jolokiaService.execute(mBean, BROWSE_SIG, [page, perPage, filter]) as string;
        return {
            data: messages,
            count: count
        };
    }

    async getProducers(page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var producerFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        return await jolokiaService.execute(await this.getBrokerObjectName(), LIST_PRODUCERS_SIG, [JSON.stringify(producerFilter), page, perPage]) as string;
    }

    async getConsumers(page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var consumerFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        return await jolokiaService.execute(await this.getBrokerObjectName(), LIST_CONSUMERS_SIG, [JSON.stringify(consumerFilter), page, perPage]) as string;
    }

    async getConnections(page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var connectionsFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        return await jolokiaService.execute(await this.getBrokerObjectName(), LIST_CONNECTIONS_SIG, [JSON.stringify(connectionsFilter), page, perPage]) as string;
    }

    async getSessions(page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var sessionsFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        return await jolokiaService.execute(await this.getBrokerObjectName(), LIST_SESSIONS_SIG, [JSON.stringify(sessionsFilter), page, perPage]) as string;
    }

    async getAddresses(page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var addressesFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        return await jolokiaService.execute(await this.getBrokerObjectName(), LIST_ADDRESSES_SIG, [JSON.stringify(addressesFilter), page, perPage]) as string;
    }

    async getQueues(page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var queuesFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        return await jolokiaService.execute(await this.getBrokerObjectName(), LIST_QUEUES_SIG, [JSON.stringify(queuesFilter), page, perPage]) as string;
    }

    async deleteQueue(name: string) {
        return jolokiaService.execute(await this.getBrokerObjectName(), DESTROY_QUEUE_SIG, [name]);
    }

    async purgeQueue(name: string, address: string, routingType: string) {
        var queueMBean: string = createQueueObjectName(await this.getBrokerObjectName(), address, routingType, name);
        return jolokiaService.execute(queueMBean, REMOVE_ALL_MESSAGES_SIG);
    }

    async closeConnection(name: string) {
        return jolokiaService.execute(await this.getBrokerObjectName(), CLOSE_CONNECTION_SIG, [name]);
    }

    async closeSession(connection: string, name: string) {
        return jolokiaService.execute(await this.getBrokerObjectName(), CLOSE_SESSION_SIG, [connection, name]);
    }

    async getBrokerObjectName() {
        return await this.brokerObjectName;
    }

}

export const artemisService = new ArtemisService()