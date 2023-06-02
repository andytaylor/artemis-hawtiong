import React, { } from 'react'
import { artemisService } from '../artemis-service';
import { Broker } from '../ArtemisTabs.js';
import { ActiveSort, ArtemisTable, Column, Filter } from './ArtemisTable';

export const SessionsTable: React.FunctionComponent<Broker> = broker => {
    const allColumns: Column[] = [
        {id: 'id', name: 'ID', visible: true, sortable: true, filterable: true},
        {id: 'connectionID', name: 'Connection ID', visible: true, sortable: true, filterable: true},
        {id: 'consumerCount', name: 'Consumer Count', visible: true, sortable: true, filterable: true},
        {id: 'producerCount', name: 'Producer Count', visible: true, sortable: true, filterable: true},
        {id: 'user', name: 'User', visible: true, sortable: true, filterable: true},
        {id: 'validatedUser', name: 'Validated User', visible: false, sortable: true, filterable: true},
        {id: 'creationTime', name: 'Creation Time', visible: true, sortable: true, filterable: false}
      ];

      const listSessions = async ( page: number, perPage: number, activeSort: ActiveSort, filter: Filter):Promise<any> => {
        const response = await artemisService.getSessions(broker.jolokia, broker.brokerMBeanName, page, perPage, activeSort, filter);
        const data = JSON.parse(response);
        return data;
      }
      
    return <ArtemisTable brokerMBeanName={broker.brokerMBeanName} jolokia={broker.jolokia} allColumns={allColumns} getData={listSessions}/>
}