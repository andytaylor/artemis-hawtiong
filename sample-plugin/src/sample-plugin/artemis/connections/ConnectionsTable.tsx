import React, { useState } from 'react'
import { Broker } from '../views/ArtemisTabView.js';
import { ActiveSort, ArtemisTable, Column, Filter } from '../table/ArtemisTable';
import { artemisService } from '../artemis-service';
import { Modal, ModalVariant, Button } from '@patternfly/react-core';
import { IAction } from '@patternfly/react-table';
import { eventService } from '@hawtio/react';

export const ConnectionsTable: React.FunctionComponent<Broker> = broker => {
  const defaultColumns: Column[] = [
    { id: 'connectionID', name: 'ID', visible: true, sortable: true, filterable: true },
    { id: 'clientID', name: 'Client ID', visible: true, sortable: true, filterable: true },
    { id: 'users', name: 'Users', visible: true, sortable: true, filterable: true },
    { id: 'protocol', name: 'Protocol', visible: true, sortable: true, filterable: true },
    { id: 'sessionCount', name: 'Session Count', visible: true, sortable: true, filterable: true },
    { id: 'remoteAddress', name: 'Remote Address', visible: true, sortable: true, filterable: true },
    { id: 'localAddress', name: 'Local Address"', visible: true, sortable: true, filterable: true },
    { id: 'session', name: 'Session ID', visible: true, sortable: true, filterable: false },
    { id: 'creationTime', name: 'Creation Time', visible: true, sortable: true, filterable: false }
  ];

  const [showConnectionCloseDialog, setShowConnectionCloseDialog] = useState(false);
  const [connectionToClose, setConnectionToClose] = useState("");
  const [loadData, setLoadData] = useState(0);

  const listConnections = async (page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<any> => {
    const response = await artemisService.getConnections(broker.jolokia, broker.brokerMBeanName, page, perPage, activeSort, filter);
    const data = JSON.parse(response);
    return data;
  }

  const closeConnection = (name: string) => {
    artemisService.closeConnection(broker.jolokia, broker.brokerMBeanName, connectionToClose)
      .then((value: unknown) => {
        setShowConnectionCloseDialog(false);
        setLoadData(loadData + 1);
        eventService.notify({
          type: 'success',
          message: 'Connection Closed',
          duration: 3000,
        })
      })
      .catch((error: string) => {
        setShowConnectionCloseDialog(false);
        eventService.notify({
          type: 'danger',
          message: 'Connection Not Closed: ' + error,
        })
      });
  };

  const getRowActions = (row: any, rowIndex: number): IAction[] => {
    return [
      {
        title: 'close',
        onClick: () => {
          console.log(`clicked on Some action, on row delete ` + row.connectionID);
          setConnectionToClose(row.connectionID);
          setShowConnectionCloseDialog(true);
        }
      }
    ]
  };

  return (
    <>
      <ArtemisTable brokerMBeanName={broker.brokerMBeanName} jolokia={broker.jolokia} allColumns={defaultColumns} getData={listConnections} storageColumnLocation="connectionsColumnDefs" getRowActions={getRowActions} loadData={loadData} />
      <Modal
        aria-label='connection-close-modal'
        variant={ModalVariant.medium}
        title="Close Connection?"
        isOpen={showConnectionCloseDialog}
        actions={[
          <Button key="confirm" variant="primary" onClick={() => closeConnection(connectionToClose)}>
            Confirm
          </Button>,
          <Button key="cancel" variant="secondary" onClick={() => setShowConnectionCloseDialog(false)}>
            Cancel
          </Button>
        ]}><p>You are about to close connection with id:  <b>{connectionToClose}</b>.</p>
        <p>This operation cannot be undone so please be careful.</p>
      </Modal>
    </>)
}
