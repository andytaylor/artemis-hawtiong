import React, { useEffect, useState } from 'react'
import { Broker } from '../ArtemisTabs.js';
import { ActiveSort, ArtemisTable, Column, Filter } from './ArtemisTable';
import { artemisService } from '../artemis-service';
import { IAction } from '@patternfly/react-table';
import { log } from '../globals';
import { Breadcrumb, BreadcrumbItem, Button, Modal, ModalVariant } from '@patternfly/react-core';
import { SendMessage } from '../components/SendMessage';
import { MessagesTable } from './MessagesTable';

export const QueuesTable: React.FunctionComponent<Broker> = broker => {
  const allColumns: Column[] = [
    { id: 'id', name: 'ID', visible: true, sortable: true, filterable: true },
    { id: 'name', name: 'Name', visible: true, sortable: true, filterable: true },
    { id: 'address', name: 'Address', visible: true, sortable: true, filterable: true },
    { id: 'routingType', name: 'Routing Type', visible: true, sortable: true, filterable: true },
    { id: 'filter', name: 'Filter', visible: true, sortable: true, filterable: true },
    { id: 'durable', name: 'Durable', visible: true, sortable: true, filterable: true },
    { id: 'maxConsumers', name: 'Max Consumers', visible: true, sortable: true, filterable: true },
    { id: 'purgeOnNoConsumers', name: 'Purge On No Consumers', visible: true, sortable: true, filterable: true },
    { id: 'consumerCount', name: 'Consumer Count', visible: true, sortable: true, filterable: true },
    { id: 'messageCount', name: 'Message Count', visible: false, sortable: true, filterable: true },
    { id: 'paused', name: 'Paused', visible: false, sortable: true, filterable: true },
    { id: 'temporary', name: 'Temporary', visible: false, sortable: true, filterable: true },
    { id: 'autoCreated', name: 'Auto Created', visible: false, sortable: true, filterable: true },
    { id: 'user', name: 'User', visible: false, sortable: true, filterable: true },
    { id: 'messagesAdded', name: 'Total Messages Added', visible: false, sortable: true, filterable: true },
    { id: 'messagesAcked', name: 'Total Messages Acked', visible: false, sortable: true, filterable: true },
    { id: 'deliveringCount', name: 'Delivering Count', visible: false, sortable: true, filterable: true },
    { id: 'messagesKilled', name: 'Messages Killed', visible: false, sortable: true, filterable: true },
    { id: 'directDeliver', name: 'Direct Deliver', visible: false, sortable: true, filterable: true },
    { id: 'exclusive', name: 'Exclusive', visible: false, sortable: true, filterable: true },
    { id: 'lastValue', name: 'Last Value', visible: false, sortable: true, filterable: true },
    { id: 'lastValueKey', name: 'Last Value Key', visible: false, sortable: true, filterable: true },
    { id: 'scheduledCount', name: 'Scheduled Count', visible: false, sortable: true, filterable: true },
    { id: 'groupRebalance', name: 'Group Rebalance', visible: false, sortable: true, filterable: true },
    { id: 'groupRebalancePauseDispatch', name: 'Group Rebalance Pause Dispatch', visible: false, sortable: true, filterable: true },
    { id: 'groupBuckets', name: 'Group Buckets', visible: false, sortable: true, filterable: true },
    { id: 'groupFirstKey', name: 'Group First Key', visible: false, sortable: true, filterable: true },
    { id: 'enabled', name: 'Queue Enabled', visible: false, sortable: true, filterable: true },
    { id: 'ringSize', name: 'Ring Size', visible: false, sortable: true, filterable: true },
    { id: 'consumersBeforeDispatch', name: 'Consumers Before Dispatch', visible: false, sortable: true, filterable: true },
    { id: 'delayBeforeDispatch', name: 'Delay Before Dispatch', visible: false, sortable: true, filterable: true },
    { id: 'autoDelete', name: 'Auto Delete', visible: false, sortable: true, filterable: true }
  ];

  const listQueues = async (page: number, perPage: number, activeSort: ActiveSort, filter: Filter): Promise<any> => {
    const response = await artemisService.getQueues(broker.jolokia, broker.brokerMBeanName, page, perPage, activeSort, filter);
    const data = JSON.parse(response);
    return data;
  }

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const [queue, setQueue] = useState("");
  const [address, setAddress] = useState("");
  const [routingType, setRoutingType] = useState("");
  const [queueToPurgeAddress, setQueueToPurgeAddress] = useState("");
  const [queueToPurgeRoutingType, setQueueToPurgeRoutingType] = useState("");
  const [loadData, setLoadData] = useState(0);
  const [queueView, setQueueView] = useState(true)

  useEffect(() => {
    log.info("rendering Queuestable " + showDeleteDialog);
  }, [showDeleteDialog, showPurgeDialog]);

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
  };

  const closePurgeDialog = () => {
    setShowPurgeDialog(false);
  };

  const closeSendDialog = () => {
    setShowSendDialog(false);
  };

  const deleteQueue = (name: string) => {
    artemisService.deleteQueue(broker.jolokia, broker.brokerMBeanName, name);
    setShowDeleteDialog(false);
    setLoadData(loadData + 1);
  };

  const purgeQueue = (name: string, address: string, routingType: string) => {
    artemisService.purgeQueue(broker.jolokia, broker.brokerMBeanName, name, address, routingType);
    setShowPurgeDialog(false);
    //refresh();
    setLoadData(loadData + 1);
  };

  const getRowActions = (row: any, rowIndex: number): IAction[] => {
    return [
      {
        title: 'delete',
        onClick: () => {
          console.log(`clicked on Some action, on row delete ` + row.name);
          setQueue(row.name);
          setShowDeleteDialog(true);
        }
      },
      {
        title: 'purge',
        onClick: () => {
          console.log(`clicked on Another action, on row purge ` + JSON.stringify(row))
          setQueue(row.name);
          setQueueToPurgeAddress(row.address);
          setQueueToPurgeRoutingType(row.routingType);
          setShowPurgeDialog(true);
        }
      },
      {
        title: 'send message',
        onClick: () => {
          console.log(`clicked on Another action, on row browse ` + row.name);
          setQueue(row.name);
          setAddress(row.address);
          setRoutingType(row.routingType)
          setShowSendDialog(true);
        }

      },
      {
        title: 'browse messages',
        onClick: () => {
          console.log(`clicked on Another action, on row browse ` + row.name);
          setQueue(row.name);
          setAddress(row.address);
          setRoutingType(row.routingType)
          setQueueView(false);
        }

      }
    ]
  };

   const QueuesView: React.FunctionComponent = () => {
    return (
    <>
      <ArtemisTable brokerMBeanName={broker.brokerMBeanName} jolokia={broker.jolokia} allColumns={allColumns} getData={listQueues} getRowActions={getRowActions} loadData={loadData} />
      <Modal
        variant={ModalVariant.medium}
        title="Delete Queue?"
        isOpen={showDeleteDialog}
        actions={[
          <Button key="confirm" variant="primary" onClick={() => deleteQueue(queue)}>
            Confirm
          </Button>,
          <Button key="cancel" variant="secondary" onClick={closeDeleteDialog}>
            Cancel
          </Button>
        ]}><p>You are about to delete queue <b>{queue}</b>.</p>
        <p>This operation cannot be undone so please be careful.</p>
      </Modal>

      <Modal
        variant={ModalVariant.medium}
        title="Purge Queue?"
        isOpen={showPurgeDialog}
        actions={[
          <Button key="confirm" variant="primary" onClick={() => purgeQueue(queue, queueToPurgeAddress, queueToPurgeRoutingType)}>
            Confirm
          </Button>,
          <Button key="cancel" variant="secondary" onClick={closePurgeDialog}>
            Cancel
          </Button>
        ]}><p>You are about to remove all messages from queue <b>{queue}</b>.</p>
        <p>This operation cannot be undone so please be careful.</p>
      </Modal>

      <Modal
        variant={ModalVariant.medium}
        isOpen={showSendDialog}
        actions={[
          <Button key="close" variant="secondary" onClick={closeSendDialog}>
            Cancel
          </Button>
        ]}>
        <SendMessage address={address} queue={queue} routingType={routingType} isAddress={false} broker={{
          brokerMBeanName: broker.brokerMBeanName,
          jolokia: broker.jolokia
        }} />
      </Modal>
    </>
    )
  }

  const MessagesView: React.FunctionComponent = () => {
    return (
      <MessagesTable queue={queue} routingType={routingType} address={address} broker={{
        brokerMBeanName: broker.brokerMBeanName,
        jolokia: broker.jolokia
      }} />
    )
  }

  return (
    <>
      {queueView &&
        <QueuesView/>
      }
      {!queueView &&
        <>
          <MessagesView/>
          <Button onClick={() => setQueueView(true)}>Back</Button>
        </>
      }
    </>
  )
}