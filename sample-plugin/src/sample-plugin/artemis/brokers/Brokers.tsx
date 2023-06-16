import React, { useEffect, useState } from 'react'
import { log } from '../globals'
import { Connections, connectService } from '@hawtio/react'
import { BrokerConnection, BrokerConnections, brokerService } from './brokers-service';
import { TableComposable, TableText, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, Button, Text } from '@patternfly/react-core';
import { ArtemisTabs } from '../ArtemisTabs';
import { Artemis } from '../Artemis';
import { Broker } from './Broker';

export type State = {
  selectedDataListItemId: string
  drawerExpanded: boolean
}

export const Brokers: React.FunctionComponent = () => {

  const  connections: Connections = connectService.loadConnections();
  const brokerConnections = brokerService.createBrokers(connections);
  const [currentBroker, setCurrentBroker] = useState<BrokerConnection | null>()

  const columnNames = {
    name: 'Name',
    version: 'Version',
    uptime: 'Uptime',
    addressMemoryUsage: 'Address Memory Usage',
    connectAction: "Connect"
  };

  useEffect(() => {
    log.info("rendered status")  
  }, [ currentBroker ]);
  
  function handleSetBroker(name: string) {
    //connectService.setCurrentConnection(brokerConnections[name].connection.name);
    setCurrentBroker(brokerConnections[name]);
  }

  function unSetBroker() {
    setCurrentBroker(null);
  }

  if(currentBroker) 
    return (
      <>
        <Breadcrumb>
          <BreadcrumbItem to="" onClick={() => unSetBroker()}>Home</BreadcrumbItem>
          <BreadcrumbItem>{currentBroker.brokerDetails.name}</BreadcrumbItem>
        </Breadcrumb>
        <Broker connection={currentBroker.connection} brokerDetails={currentBroker.brokerDetails} brokerStatus={currentBroker.brokerStatus} getJolokiaService={currentBroker.getJolokiaService} />
      </>
    )

  return (

    <React.Fragment>
      <TableComposable aria-label="Broker Table">
        <Thead>
          <Tr>
            <Th>{columnNames.name}</Th>
            <Th>{columnNames.version}</Th>
            <Th>{columnNames.uptime}</Th>
            <Th>{columnNames.addressMemoryUsage}</Th>
            <Td></Td>
          </Tr>
        </Thead>
        <Tbody>
        {Object.entries(brokerConnections).map(([name, connection]) => (
          <Tr key={name}>
            <Td dataLabel={columnNames.name}><Link onClick={() => {handleSetBroker(name)}} to="#">{name}</Link></Td>
            <Td dataLabel={columnNames.version}>{connection.brokerDetails.version}</Td>
            <Td dataLabel={columnNames.uptime}>{connection.brokerStatus.uptime}</Td>
            <Td dataLabel={columnNames.addressMemoryUsage}>{connection.brokerStatus.addressMemoryUsage + 'MB(' + connection.brokerStatus.used + '%)'}</Td>
            <Td dataLabel={columnNames.connectAction} modifier="fitContent">
              <TableText>
                  <Button variant="secondary" onClick={() => connectService.connect(connection.connection)}>Connect</Button>
              </TableText>
            </Td>
          </Tr>
        ))}
          
        </Tbody>
      </TableComposable>     
    </React.Fragment>
  )
}
