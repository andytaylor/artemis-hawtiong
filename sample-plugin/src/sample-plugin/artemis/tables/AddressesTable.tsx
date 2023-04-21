import React, { } from 'react'
import { Broker } from '../ArtemisTabs.js';
import { ActiveSort, ArtemisTable, Column, Filter } from './ArtemisTable';
import { artemisService } from '../artemis-service';

export const AddressesTable: React.FunctionComponent<Broker> = broker => {
    const allColumns: Column[] = [
        {id: 'id', name: 'ID', visible: true, sortable: true, filterable: true},
        {id: 'name', name: 'Name', visible: true, sortable: true, filterable: true},
        {id: 'routingTypes', name: 'Routing Types', visible: true, sortable: true, filterable: true},
        {id: 'queueCount', name: 'Queue Count', visible: true, sortable: true, filterable: true}
      ];

      const listAddresses = async ( page: number, perPage: number, activeSort: ActiveSort, filter: Filter):Promise<any> => {
        const response = await artemisService.geAddresses(broker.jolokia, broker.brokerMBeanName, page, perPage, activeSort, filter);
        const data = JSON.parse(response);
        return data;
      }
      
    return <ArtemisTable brokerMBeanName={broker.brokerMBeanName} loaded={true} jolokia={broker.jolokia} allColumns={allColumns} getData={listAddresses}/>
}