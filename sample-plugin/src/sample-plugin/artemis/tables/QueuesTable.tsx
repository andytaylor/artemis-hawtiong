import React, { useEffect, useRef, useState } from 'react'
import { Broker } from '../ArtemisTabs.js';
import { ActiveSort, ArtemisTable, Column, Filter } from './ArtemisTable';
import { artemisService } from '../artemis-service';
import { IAction } from '@patternfly/react-table';
import { log } from '../globals';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

export const QueuesTable: React.FunctionComponent<Broker> = broker => {
    const allColumns: Column[] = [
        {id: 'id', name: 'ID', visible: true, sortable: true, filterable: true},
        {id: 'name', name: 'Name', visible: true, sortable: true, filterable: true},
        {id: 'address', name: 'Address', visible: true, sortable: true, filterable: true},
        {id: 'routingType', name: 'Routing Type', visible: true, sortable: true, filterable: true},
        {id: 'filter', name: 'Filter', visible: true, sortable: true, filterable: true},
        {id: 'durable', name: 'Durable', visible: true, sortable: true, filterable: true},
        {id: 'maxConsumers', name: 'Max Consumers', visible: true, sortable: true, filterable: true},
        {id: 'purgeOnNoConsumers', name: 'Purge On No Consumers', visible: true, sortable: true, filterable: true},
        {id: 'consumerCount', name: 'Consumer Count', visible: true, sortable: true, filterable: true},
        {id: 'messageCount', name: 'Message Count', visible: false, sortable: true, filterable: true},
        {id: 'paused', name: 'Paused', visible: false, sortable: true, filterable: true},
        {id: 'temporary', name: 'Temporary', visible: false, sortable: true, filterable: true},
        {id: 'autoCreated', name: 'Auto Created', visible: false, sortable: true, filterable: true},
        {id: 'user', name: 'User', visible: false, sortable: true, filterable: true},
        {id: 'messagesAdded', name: 'Total Messages Added', visible: false, sortable: true, filterable: true},
        {id: 'messagesAcked', name: 'Total Messages Acked', visible: false, sortable: true, filterable: true},
        {id: 'deliveringCount', name: 'Delivering Count', visible: false, sortable: true, filterable: true},
        {id: 'messagesKilled', name: 'Messages Killed', visible: false, sortable: true, filterable: true},
        {id: 'directDeliver', name: 'Direct Deliver', visible: false, sortable: true, filterable: true},
        {id: 'exclusive', name: 'Exclusive', visible: false, sortable: true, filterable: true},
        {id: 'lastValue', name: 'Last Value', visible: false, sortable: true, filterable: true},
        {id: 'lastValueKey', name: 'Last Value Key', visible: false, sortable: true, filterable: true},
        {id: 'scheduledCount', name: 'Scheduled Count', visible: false, sortable: true, filterable: true},
        {id: 'groupRebalance', name: 'Group Rebalance', visible: false, sortable: true, filterable: true},
        {id: 'groupRebalancePauseDispatch', name: 'Group Rebalance Pause Dispatch', visible: false, sortable: true, filterable: true},
        {id: 'groupBuckets', name: 'Group Buckets', visible: false, sortable: true, filterable: true},
        {id: 'groupFirstKey', name: 'Group First Key', visible: false, sortable: true, filterable: true},
        {id: 'enabled', name: 'Queue Enabled', visible: false, sortable: true, filterable: true},
        {id: 'ringSize', name: 'Ring Size', visible: false, sortable: true, filterable: true},
        {id: 'consumersBeforeDispatch', name: 'Consumers Before Dispatch', visible: false, sortable: true, filterable: true},
        {id: 'delayBeforeDispatch', name: 'Delay Before Dispatch', visible: false, sortable: true, filterable: true},
        {id: 'autoDelete', name: 'Auto Delete', visible: false, sortable: true, filterable: true}
      ];

      const listQueues = async ( page: number, perPage: number, activeSort: ActiveSort, filter: Filter):Promise<any> => {
        const response = await artemisService.getQueues(broker.jolokia, broker.brokerMBeanName, page, perPage, activeSort, filter);
        const data = JSON.parse(response);
        return data;
      }

      const [showDialog, setShowDialog] = useState(false);
      const [ queueToDelete, setQueueToDelete ] = useState("");
      useEffect(() => {
        log.info("rendering Queuestable " + showDialog);
      }, [showDialog]);
      
      const closeDialog = () => {
        setShowDialog(false);
      };

      const getRowActions = (row: any, rowIndex: number): IAction[] => {
        log.info("row=" + row.name);
        log.info("row=" + rowIndex);
        return [
        {
          title: 'delete',
          onClick: () => { 
            console.log(`clicked on Some action, on row delete ` + row.name);
            setQueueToDelete(row.name);
            setShowDialog(true);
          }
        },
        {
          title: 'purge',
          onClick: () => console.log(`clicked on Another action, on row purge ` + row.name)
        },
        {
          title: 'browse',
          onClick: () => console.log(`clicked on Another action, on row browse ` + row.name)
        }
      ]};
      
    return (
      <>
        <ArtemisTable brokerMBeanName={broker.brokerMBeanName} loaded={true} jolokia={broker.jolokia} allColumns={allColumns} getData={listQueues} getRowActions={getRowActions} />
        <Modal
          variant={ModalVariant.medium}
          title="Delete Queue?"
          isOpen={showDialog}
          actions={[
            <Button key="confirm" variant="primary" onClick={closeDialog}>
              Confirm
            </Button>,
            <Button key="cancel" variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
          ]}>Are you sure you would like to delete queue {queueToDelete}</Modal></>
    )
}