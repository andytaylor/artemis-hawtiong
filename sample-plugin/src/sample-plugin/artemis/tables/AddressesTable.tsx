import React, { useEffect, useState } from 'react'
import { Broker } from '../ArtemisTabs.js';
import { ActiveSort, ArtemisTable, Column, Filter } from './ArtemisTable';
import { artemisService } from '../artemis-service';
import { IAction } from '@patternfly/react-table';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { CreateQueue } from '../components/CreateQueue';
import { log } from '../globals';

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

      const [ showCreateDialog, setShowCreateDialog ] = useState(false);
      const [ address, setAddress ] = useState("");

      useEffect(() => {
        log.info("rendering Address Table ");
      }, [address, showCreateDialog]);

      const getRowActions = (row: any, rowIndex: number): IAction[] => {
        return [
        {
          title: 'create queue',
          onClick: () => { 
            console.log(`clicked on Some action, on row delete ` + JSON.stringify(row));
            setAddress(row.name);
            setShowCreateDialog(true);
          }
        }
      ]};
      
    return (
      <>
      <ArtemisTable brokerMBeanName={broker.brokerMBeanName} jolokia={broker.jolokia} getRowActions={getRowActions} allColumns={allColumns} getData={listAddresses} />
      <Modal
        variant={ModalVariant.medium}
        isOpen={showCreateDialog}
        actions={[
          <Button key="close" variant="primary" onClick={() => setShowCreateDialog(false)}>
            Close
          </Button>
        ]}>
          <CreateQueue address={address} broker={{
            brokerMBeanName: broker.brokerMBeanName,
            loaded: true,
            jolokia: broker.jolokia
          }}/>
      </Modal>
      </>
    )
      
}