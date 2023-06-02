import { jmxDomain, log } from './globals'
import { ActiveSort, Filter } from './tables/ArtemisTable'
import { IJolokia, IRequest, IResponse, IResponseFn, ISimpleOptions } from 'jolokia.js'
import { AttributeValues, eventService, IJolokiaService, JolokiaListMethod, JolokiaStoredOptions } from '@hawtio/react'

export interface IArtemisService {
    getBrokerMBean(jolokia: IJolokia): string
    getProducers(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<unknown>
  }

class ArtemisService implements IArtemisService {
  
    getBrokerMBean(jolokia: IJolokia): string {
        log.info("using domain " +jmxDomain + ":broker=* ")

        const attr = jolokia.getAttribute(jmxDomain + ":broker=*", "Name") ;
        log.info("*************" + attr);
        return attr as string;
    }

    async getProducers(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var producerFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        log.info("invoking with mbean " + mBean + " with " + JSON.stringify(producerFilter) + " page " + page + " per page " + perPage);
        const producers = await jolokia.execute(mBean, 'listProducers(java.lang.String, int, int)', [JSON.stringify(producerFilter), page, perPage] ) as string;
        return producers;
    }

    async getConsumers(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var consumerFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        log.info("invoking with mbean " + mBean + " with " + JSON.stringify(consumerFilter) + " page " + page + " per page " + perPage);
        const consumers = await jolokia.execute(mBean, 'listConsumers(java.lang.String, int, int)', [JSON.stringify(consumerFilter), page, perPage] ) as string;
        return consumers;
    }

    async getConnections(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var connectionsFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        log.info("invoking with mbean " + mBean + " with " + JSON.stringify(connectionsFilter) + " page " + page + " per page " + perPage);
        const connections = await jolokia.execute(mBean, 'listConnections(java.lang.String, int, int)', [JSON.stringify(connectionsFilter), page, perPage ]) as string;
        return connections;
    }

    async getConnections2(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var connectionsFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        log.info("invoking with mbean " + mBean + " with " + JSON.stringify(connectionsFilter) + " page " + page + " per page " + perPage);
        const connections = await jolokia.execute(mBean, 'listConnections(java.lang.String, int, int)', [JSON.stringify(connectionsFilter), page, perPage] ) as string;
        return connections;
    }

    async getSessions(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var sessionsFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        log.info("invoking with mbean " + mBean + " with " + JSON.stringify(sessionsFilter) + " page " + page + " per page " + perPage);
        const sessions = await jolokia.execute(mBean, 'listSessions(java.lang.String, int, int)', [JSON.stringify(sessionsFilter), page, perPage] ) as string;
        return sessions;
    }

    async geAddresses(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var addressesFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        log.info("invoking with mbean " + mBean + " with " + JSON.stringify(addressesFilter) + " page " + page + " per page " + perPage);
        const addresses = await jolokia.execute(mBean, 'listAddresses(java.lang.String, int, int)', [JSON.stringify(addressesFilter), page, perPage] ) as string;
        return addresses;
    }

    async getQueues(jolokia: IJolokiaService, mBean: string, page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<string> {
        var queuesFilter = {
            field: filter.input !== '' ? filter.column : '',
            operation: filter.input !== '' ? filter.operation : '',
            value: filter.input,
            sortOrder: activeSort.order,
            sortColumn: activeSort.id
        };
        log.info("invoking with mbean " + mBean + " with " + JSON.stringify(queuesFilter) + " page " + page + " per page " + perPage);
        const queues = await jolokia.execute(mBean, 'listQueues(java.lang.String, int, int)', [JSON.stringify(queuesFilter), page, perPage] ) as string;
        return queues;
    }

    async deleteQueue(jolokia: IJolokiaService, brokerMBean: string, name: string) {
        log.info("deleting queue " + name + " " + brokerMBean)
        jolokia.execute(brokerMBean, 'destroyQueue(java.lang.String)', [name])
        .then((value: unknown) => {
            eventService.notify({
            type: 'success',
            message: 'Queue Deleted',
            duration: 3000,
            })
            })
            .catch((error: string) => {
            eventService.notify({
                type: 'danger',
                message: 'Queue Not Deleted: '+ error,
            })
        });
    }

    async purgeQueue(jolokia: IJolokiaService, brokerMBean: string, name: string, address: string, routingType: string) {
        // get mbean name like org.apache.activemq.artemis:broker="127.0.0.1",component=addresses,address="q1",subcomponent=queues,routing-type="anycast",queue="q1"
        var  queueMBean: string = brokerMBean + ",component=addresses,address=\"" + address + "\",subcomponent=queues,routing-type=\"" + routingType.toLowerCase() + "\".queue=\"" + name + "\"";
        log.info("purging queue " + name + " " + queueMBean)
        jolokia.execute(queueMBean, 'removeAllMessages()')
        .then(() => {
            eventService.notify({
            type: 'success',
            message: 'Queue Purged',
            duration: 3000,
            })
            })
            .catch((error: string) => {
            eventService.notify({
                type: 'danger',
                message: 'Queue Not Purged: '+ error,
            })
        });
    }
    
}

export const artemisService = new ArtemisService()