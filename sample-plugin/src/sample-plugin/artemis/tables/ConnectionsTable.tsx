import React, { } from 'react'
import { Broker } from '../ArtemisTabs.js';
import { ActiveSort, ArtemisTable, Column, Filter } from './ArtemisTable';
import { artemisService } from '../artemis-service';
import { artemisPreferencesService } from '../artemis-preferences-service';

export const ConnectionsTable: React.FunctionComponent<Broker> = broker => {
    const defaultColumns: Column[] = [
        {id: 'connectionID', name: 'ID', visible: true, sortable: true, filterable: true},
        {id: 'clientID', name: 'Client ID', visible: true, sortable: true, filterable: true},
        {id: 'users', name: 'Users', visible: true, sortable: true, filterable: true},
        {id: 'protocol', name: 'Protocol', visible: true, sortable: true, filterable: true},
        {id: 'sessionCount', name: 'Session Count', visible: true, sortable: true, filterable: true},
        {id: 'remoteAddress', name: 'Remote Address', visible: true, sortable: true, filterable: true},
        {id: 'localAddress', name: 'Local Address"', visible: true, sortable: true, filterable: true},
        {id: 'session', name: 'Session ID', visible: true, sortable: true, filterable: false},
        {id: 'creationTime', name: 'Creation Time', visible: true, sortable: true, filterable: false}
      ];

      const listConnections = async ( page: number, perPage: number, activeSort: ActiveSort, filter: Filter):Promise<any> => {
        const response = await artemisService.getConnections(broker.jolokia, broker.brokerMBeanName, page, perPage, activeSort, filter);
        const data = JSON.parse(response);
        return data;
      }

      
    return <ArtemisTable brokerMBeanName={broker.brokerMBeanName} jolokia={broker.jolokia} allColumns={defaultColumns} getData={listConnections} storageColumnLocation="connectionsColumnDefs"/>
}