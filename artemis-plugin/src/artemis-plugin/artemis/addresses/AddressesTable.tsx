import React, { useContext, useEffect, useState } from 'react'
import { ActiveSort, ArtemisTable, Column, Filter, ToolbarAction } from '../table/ArtemisTable';
import { Navigate } from '../views/ArtemisTabView.js';
import { artemisService } from '../artemis-service';
import { IAction } from '@patternfly/react-table';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { CreateQueue } from '../queues/CreateQueue';
import { log } from '../globals';
import { DeleteAddressModal } from './DeleteAddressModal';
import { Attributes, Operations } from '@hawtio/react';
import { ArtemisContext } from '../context';
import { CreateAddress } from './CreateAddress';
import { SendMessage } from '../messages/SendMessage';
import { createAddressObjectName } from '../util/jmx';

export const AddressesTable: React.FunctionComponent<Navigate> = (navigate) => {
  const getQueueFilter = (row: any) => {
    var filter: Filter = {
      column: 'address',
      operation: 'EQUALS',
      input: row.name
    }
    return filter;
  }
  const allColumns: Column[] = [
    { id: 'id', name: 'ID', visible: true, sortable: true, filterable: true },
    { id: 'name', name: 'Name', visible: true, sortable: true, filterable: true },
    { id: 'routingTypes', name: 'Routing Types', visible: true, sortable: true, filterable: true },
    { id: 'queueCount', name: 'Queue Count', visible: true, sortable: true, filterable: true, filter: getQueueFilter, filterTab: 6 }
  ];

  const listAddresses = async (page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<any> => {
    const response = await artemisService.getAddresses(page, perPage, activeSort, filter);
    const data = JSON.parse(response);
    return data;
  }

  const { tree, selectedNode, setSelectedNode, findAndSelectNode } = useContext(ArtemisContext)

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAttributesDialog, setShowAttributesDialog] = useState(false);
  const [showOperationsDialog, setShowOperationsDialog] = useState(false);
  const [showCreateAddressDialog, setShowCreateAddressDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    log.info("rendering Address Table ");
  }, [address]);


  const createAction: ToolbarAction = {
    name: "Create Address",
    action: () => {
      setShowCreateAddressDialog(true);
    }
  }

  const getRowActions = (row: any, rowIndex: number): IAction[] => {
    return [
      {
        title: 'attributes',
        onClick: async () => {
          setAddress(row.name);
          const brokerObjectName = await artemisService.getBrokerObjectName();
          const addressObjectName = createAddressObjectName(brokerObjectName, row.name);
          findAndSelectNode(addressObjectName, row.name);
          setShowAttributesDialog(true);
        }
      },
      {
        title: 'operations',
        onClick: async () => {
          setAddress(row.name);
          const brokerObjectName = await artemisService.getBrokerObjectName();
          const addressObjectName = createAddressObjectName(brokerObjectName, row.name);
          findAndSelectNode(addressObjectName, row.name);
          setShowOperationsDialog(true);
        }
      },
      {
        title: 'create queue',
        onClick: () => {
          setAddress(row.name);
          setShowCreateDialog(true);
        }
      },
      {
        title: 'delete address',
        onClick: () => {
          setAddress(row.name);
          setShowDeleteDialog(true);
        }
      },
      {
        title: 'send message',
        onClick: () => {
          setAddress(row.name);
          setShowSendDialog(true);
        }

      }
    ]
  };

  return (
    <ArtemisContext.Provider value={{ tree, selectedNode, setSelectedNode, findAndSelectNode }}>
      <ArtemisTable getRowActions={getRowActions} allColumns={allColumns} getData={listAddresses} toolbarActions={[createAction]} navigate={navigate.search} filter={navigate.filter}/>
      <Modal
        aria-label='create-queue-modal'
        variant={ModalVariant.medium}
        isOpen={showCreateDialog}
        actions={[
          <Button key="close" variant="primary" onClick={() => setShowCreateDialog(false)}>
            Close
          </Button>
        ]}>
        <CreateQueue address={address}/>
      </Modal>
      <DeleteAddressModal address={address} show={showDeleteDialog} onClick={setShowDeleteDialog} />
      <Modal
        aria-label='attributes-modal'
        variant={ModalVariant.medium}
        isOpen={showAttributesDialog}
        actions={[
          <Button key="close" variant="primary" onClick={() => setShowAttributesDialog(false)}>
            Close
          </Button>
        ]}>
        <Attributes />
      </Modal>
      <Modal
        aria-label='operations-modal'
        variant={ModalVariant.medium}
        isOpen={showOperationsDialog}
        actions={[
          <Button key="close" variant="primary" onClick={() => setShowOperationsDialog(false)}>
            Close
          </Button>
        ]}>
        <Operations />
      </Modal>
      <Modal
        aria-label='create=address-modal'
        variant={ModalVariant.medium}
        isOpen={showCreateAddressDialog}
        actions={[
          <Button key="close" variant="primary" onClick={() => setShowCreateAddressDialog(false)}>
            Close
          </Button>
        ]}>
        <CreateAddress/>
      </Modal>
      <Modal
        aria-label='send-modal'
        variant={ModalVariant.medium}
        isOpen={showSendDialog}
        actions={[
          <Button key="close" variant="secondary" onClick={() => setShowSendDialog(false)}>
            Cancel
          </Button>
        ]}>
        <SendMessage address={address} queue={''} routingType={''} isAddress={true} />
      </Modal>
    </ArtemisContext.Provider>
  )

}