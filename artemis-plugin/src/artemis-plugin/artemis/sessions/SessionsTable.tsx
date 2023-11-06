import { eventService } from '@hawtio/react';
import { Modal, ModalVariant, Button } from '@patternfly/react-core';
import { IAction } from '@patternfly/react-table';
import React, { useState } from 'react'
import { artemisService } from '../artemis-service';
import { Navigate } from '../views/ArtemisTabView.js';
import { ActiveSort, ArtemisTable, Column, Filter } from '../table/ArtemisTable';
import { log } from '../globals';

export const SessionsTable: React.FunctionComponent<Navigate> = navigate => {  
  const getConnectionFilter = (row: any) => {
    var filter: Filter = {
      column: 'connectionID',
      operation: 'EQUALS',
      input: row.connectionID
    }
    return filter;
  }

  const getConsumerFilter = (row: any) => {
    var filter: Filter = {
      column: 'session',
      operation: 'EQUALS',
      input: row.id
    }
    return filter;
  }

  const getProducerFilter = (row: any) => {
    var filter: Filter = {
      column: 'session',
      operation: 'EQUALS',
      input: row.id
    }
    return filter;
  }


  const allColumns: Column[] = [
    { id: 'id', name: 'ID', visible: true, sortable: true, filterable: true },
    { id: 'connectionID', name: 'Connection ID', visible: true, sortable: true, filterable: true, filter: getConnectionFilter, filterTab: 1 },
    { id: 'consumerCount', name: 'Consumer Count', visible: true, sortable: true, filterable: true, filter: getConsumerFilter, filterTab: 4 },
    { id: 'producerCount', name: 'Producer Count', visible: true, sortable: true, filterable: true, filter: getProducerFilter, filterTab: 3 },
    { id: 'user', name: 'User', visible: true, sortable: true, filterable: true },
    { id: 'validatedUser', name: 'Validated User', visible: false, sortable: true, filterable: true },
    { id: 'creationTime', name: 'Creation Time', visible: true, sortable: true, filterable: false }
  ];


  const [showSessionCloseDialog, setShowSessionCloseDialog] = useState(false);
  const [sessionToClose, setSessionToClose] = useState("");
  const [sessionConnection, setSessionConnection] = useState("");
  const [loadData, setLoadData] = useState(0);
  const listSessions = async (page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<any> => {
    const response = await artemisService.getSessions(page, perPage, activeSort, filter);
    const data = JSON.parse(response);
    return data;
  }


  const closeSession = () => {
    artemisService.closeSession(sessionConnection, sessionToClose)
      .then((value: unknown) => {
        setShowSessionCloseDialog(false);
        setLoadData(loadData + 1);
        eventService.notify({
          type: 'success',
          message: 'Connection Closed',
          duration: 3000,
        })
      })
      .catch((error: string) => {
        setShowSessionCloseDialog(false);
        eventService.notify({
          type: 'danger',
          message: 'Session Not Closed: ' + error,
        })
      });
  };

  const getRowActions = (row: any, rowIndex: number): IAction[] => {
    return [
      {
        title: 'close',
        onClick: () => {
          console.log(`clicked on Some action, on row delete ` + row.id);
          setSessionToClose(row.id);
          setSessionConnection(row.connectionID);
          setShowSessionCloseDialog(true);
        }
      }
    ]
  };


  log.info("searching with 1 " + navigate.filter?.input);
  return (
    <><ArtemisTable allColumns={allColumns} getData={listSessions} storageColumnLocation="sessionsColumnDefs" getRowActions={getRowActions} loadData={loadData} navigate={navigate.search} filter={navigate.filter}/>
    <Modal
      aria-label='session-close-modal'
      variant={ModalVariant.medium}
      title="Close Session?"
      isOpen={showSessionCloseDialog}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => closeSession()}>
          Confirm
        </Button>,
        <Button key="cancel" variant="secondary" onClick={() => setShowSessionCloseDialog(false)}>
          Cancel
        </Button>
      ]}><p>You are about to close session with id:  <b>{sessionToClose}</b>.</p>
      <p>This operation cannot be undone so please be careful.</p>
    </Modal></>
  )
}