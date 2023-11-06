import React, { } from 'react'
import { Navigate } from '../views/ArtemisTabView.js';
import { ActiveSort, ArtemisTable, Column, Filter } from '../table/ArtemisTable';
import { artemisService } from '../artemis-service';

export const ProducerTable: React.FunctionComponent<Navigate> = navigate => {
    const allColumns: Column[] = [
        {id: 'id', name: 'ID', visible: true, sortable: true, filterable: true},
        {id: 'name', name: 'Name', visible: true, sortable: true, filterable: true},
        {id: 'session', name: 'Session', visible: true, sortable: true, filterable: true},
        {id: 'clientID', name: 'Client ID', visible: true, sortable: true, filterable: true},
        {id: 'user', name: 'User', visible: true, sortable: true, filterable: true},
        {id: 'validatedUser', name: 'Validated User', visible: true, sortable: true, filterable: true},
        {id: 'protocol', name: 'Protocol', visible: true, sortable: true, filterable: true},
        {id: 'localAddress', name: 'Local Address', visible: true, sortable: true, filterable: true},
        {id: 'remoteAddress', name: 'Remote Address', visible: true, sortable: true, filterable: true},
        {id: 'msgSent', name: 'Messages Sent', visible: false, sortable: true, filterable: false},
        {id: 'msgSizeSent', name: 'Messages Sent Size', visible: false, sortable: true, filterable: false},
        {id: 'lastProducedMessageID', name: 'Last Produced Message ID', visible: false, sortable: true, filterable: false},
      ];

      const listProducers = async ( page: number, perPage: number, activeSort: ActiveSort, filter: Filter):Promise<any> => {
        const response = await artemisService.getProducers(page, perPage, activeSort, filter);
        const data = JSON.parse(response);
        return data;
      }
      
    return <ArtemisTable allColumns={allColumns} getData={listProducers} storageColumnLocation="producerColumnDefs" navigate={navigate.search} filter={navigate.filter}/>
}