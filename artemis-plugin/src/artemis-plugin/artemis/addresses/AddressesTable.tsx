import React, { useContext, useEffect, useState } from 'react'
import { Broker } from '../views/ArtemisTabView.js';
import { ActiveSort, ArtemisTable, Column, Filter, ToolbarAction } from '../table/ArtemisTable';
import { artemisService } from '../artemis-service';
import { IAction } from '@patternfly/react-table';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { CreateQueue } from '../queues/CreateQueue';
import { log } from '../globals';
import { DeleteAddressModal } from './DeleteAddressModal';
import { Attributes, MBeanNode, Operations } from '@hawtio/react';
import { ArtemisContext } from '../context';
import { CreateAddress } from './CreateAddress';
import { SendMessage } from '../messages/SendMessage';

export const AddressesTable: React.FunctionComponent<Broker> = broker => {
  const allColumns: Column[] = [
    { id: 'id', name: 'ID', visible: true, sortable: true, filterable: true },
    { id: 'name', name: 'Name', visible: true, sortable: true, filterable: true },
    { id: 'routingTypes', name: 'Routing Types', visible: true, sortable: true, filterable: true },
    { id: 'queueCount', name: 'Queue Count', visible: true, sortable: true, filterable: true }
  ];

  const listAddresses = async (page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<any> => {
    const response = await artemisService.geAddresses(broker.jolokia, broker.brokerMBeanName, page, perPage, activeSort, filter);
    const data = JSON.parse(response);
    return data;
  }

  const { tree, selectedNode, setSelectedNode } = useContext(ArtemisContext)

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAttributesDialog, setShowAttributesDialog] = useState(false);
  const [showOperationsDialog, setShowOperationsDialog] = useState(false);
  const [showCreateAddressDialog, setShowCreateAddressDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    log.info("rendering Address Table ");
  }, [address, showCreateDialog]);


  const createAction: ToolbarAction = {
    name: "Create Address",
    action: () => {
      setShowCreateAddressDialog(true);
    }
  }

  const getRowActions = (row: any, rowIndex: number): IAction[] => {
    return [
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
        title: 'attributes',
        onClick: () => {
          setAddress(row.name);
          var addressObjectName = broker.brokerMBeanName + ",component=addresses,address=\"" + row.name + "\"";
          var addressNode: MBeanNode | null = tree.findDescendant(node => { return node.objectName === addressObjectName });
          if (!addressNode) {
            const addressesNode = tree.findDescendant(node => node.name === "addresses");
            addressNode = new MBeanNode(addressesNode, row.name, false);
            addressNode.objectName = addressObjectName;
            addressesNode?.children?.push(addressNode);
          }
          setSelectedNode(addressNode);
          setShowAttributesDialog(true);
        }
      },
      {
        title: 'operations',
        onClick: () => {
          setAddress(row.name);
          var addressObjectName = broker.brokerMBeanName + ",component=addresses,address=\"" + row.name + "\"";
          var addressNode: MBeanNode | null = tree.findDescendant(node => { return node.objectName === addressObjectName });
          setSelectedNode(addressNode);
          setShowOperationsDialog(true);
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
    <ArtemisContext.Provider value={{ tree, selectedNode, setSelectedNode }}>
      <ArtemisTable brokerMBeanName={broker.brokerMBeanName} jolokia={broker.jolokia} getRowActions={getRowActions} allColumns={allColumns} getData={listAddresses} toolbarActions={[createAction]} />
      <Modal
        aria-label='create-queue-modal'
        variant={ModalVariant.medium}
        isOpen={showCreateDialog}
        actions={[
          <Button key="close" variant="primary" onClick={() => setShowCreateDialog(false)}>
            Close
          </Button>
        ]}>
        <CreateQueue address={address} broker={{
          brokerMBeanName: broker.brokerMBeanName,
          jolokia: broker.jolokia
        }} />
      </Modal>
      <DeleteAddressModal address={address} broker={{
        brokerMBeanName: broker.brokerMBeanName,
        jolokia: broker.jolokia
      }} show={showDeleteDialog} onClick={() => setShowDeleteDialog(false)} />
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
        <CreateAddress brokerMBeanName={broker.brokerMBeanName} jolokia={broker.jolokia} columnStorageLocation="addressColumnDefs" />
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
        <SendMessage address={address} queue={''} routingType={''} isAddress={true} broker={{
          brokerMBeanName: broker.brokerMBeanName,
          jolokia: broker.jolokia
        }} />
      </Modal>
    </ArtemisContext.Provider>
  )

}