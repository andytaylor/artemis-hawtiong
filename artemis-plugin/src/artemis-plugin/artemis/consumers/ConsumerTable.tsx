import React from 'react'
import { Navigate } from '../views/ArtemisTabView.js';
import { ActiveSort, ArtemisTable, Column, Filter } from '../table/ArtemisTable';
import { artemisService } from '../artemis-service';

export const ConsumerTable: React.FunctionComponent<Navigate> = navigate => {
  const getSessionFilter = (row: any) => {
    var filter: Filter = {
      column: 'id',
      operation: 'EQUALS',
      input: row.session
    }
    return filter;
  }

  const getQueueFilter = (row: any) => {
    var filter: Filter = {
      column: 'name',
      operation: 'EQUALS',
      input: row.queue
    }
    return filter;
  }

  const getAddressFilter = (row: any) => {
    var filter: Filter = {
      column: 'name',
      operation: 'EQUALS',
      input: row.address
    }
    return filter;
  }

    const allColumns: Column[] = [
      {id: 'id', name: 'ID', visible: true, sortable: true, filterable: true},
      {id: 'session', name: 'Session', visible: true, sortable: true, filterable: true, filter: getSessionFilter, filterTab: 2},
      {id: 'clientID', name: 'Client ID', visible: true, sortable: true, filterable: true},
      {id: 'validatedUser', name: 'Validated User', visible: true, sortable: true, filterable: true},
      {id: 'protocol', name: 'Protocol', visible: true, sortable: true, filterable: false},
      {id: 'queue', name: 'Queue', visible: true, sortable: true, filterable: true, filter: getQueueFilter, filterTab: 6},
      {id: 'queueType', name: 'Queue Type', visible: true, sortable: true, filterable: false},
      {id: 'filter', name: 'Filter', visible: true, sortable: true, filterable: false},
      {id: 'address', name: 'Address', visible: true, sortable: true, filterable: true, filter: getAddressFilter, filterTab: 5},
      {id: 'remoteAddress', name: 'Remote Address', visible: true, sortable: true, filterable: true},
      {id: 'localAddress', name: 'Local Address', visible: true, sortable: true, filterable: true},
      {id: 'creationTime', name: 'Creation Time', visible: true, sortable: true, filterable: false},
      {id: 'messagesInTransit', name: 'Messages in Transit', visible: false, sortable: true, filterable: true},
      {id: 'messagesInTransitSize', name: 'Messages in Transit Size', visible: false, sortable: true, filterable: true},
      {id: 'messagesDelivered', name: 'Messages Delivered', visible: false, sortable: true, filterable: true},
      {id: 'messagesDeliveredSize', name: 'Messages Delivered Size', visible: false, sortable: true, filterable: true},
      {id: 'messagesAcknowledged', name: 'Messages Acknowledged', visible: false, sortable: true, filterable: true},
      {id: 'messagesAcknowledgedAwaitingCommit', name: 'Messages Acknowledged awaiting Commit', visible: false, sortable: true, filterable: true},
      {id: 'lastDeliveredTime', name: 'Last Delivered Time', visible: false, sortable: true, filterable: false},
      {id: 'lastAcknowledgedTime', name: 'Last Acknowledged Time', visible: false, sortable: true, filterable: false},
      ];

      const listConsumers = async ( page: number, perPage: number, activeSort: ActiveSort, filter: Filter):Promise<any> => {
        const response = await artemisService.getConsumers(page, perPage, activeSort, filter);
        const data = JSON.parse(response);
        return data;
      }
      
    return <ArtemisTable allColumns={allColumns} getData={listConsumers} storageColumnLocation="consumerColumnDefs"  navigate={navigate.search} filter={navigate.filter}/>
}