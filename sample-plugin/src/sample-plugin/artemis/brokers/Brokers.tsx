import React, { useEffect, useState } from 'react'
import { log } from '../globals'
import { Connections, connectService } from '@hawtio/react'
import { BrokerConnections, brokerService } from './brokers-service';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom'

export type State = {
  selectedDataListItemId: string
  drawerExpanded: boolean
}

export const Brokers: React.FunctionComponent = () => {

  const  connections: Connections = connectService.loadConnections();
  const [ brokerConnections, setbrokerConnections ] = useState<BrokerConnections>({});
  const [ brokersLoaded, setBrokersLoaded ] = useState(false);

  const columnNames = {
    name: 'Name',
    version: 'Version',
    uptime: 'Uptime',
    addressMemoryUsage: 'Address Memory Usage'
  };

  useEffect(() => {
    log.info("rendered status")  
    if(!brokersLoaded) {
      setbrokerConnections(brokerService.createBrokers(connections));
      setBrokersLoaded(true);
    }
   
  }, [ brokerConnections, brokersLoaded, connections ]);


  if(!brokersLoaded) return <React.Fragment></React.Fragment>;
  
  return (

    <React.Fragment>
      <TableComposable aria-label="Broker Table">
        <Thead>
          <Tr>
            <Th>{columnNames.name}</Th>
            <Th>{columnNames.version}</Th>
            <Th>{columnNames.uptime}</Th>
            <Th>{columnNames.addressMemoryUsage}</Th>
          </Tr>
        </Thead>
        <Tbody>
        {Object.entries(brokerConnections).map(([name, connection]) => (
          <Tr key={name}>
            <Td dataLabel={columnNames.name}><Link to="/artemis" state={{name: name, connection: connection}}>{name}</Link></Td>
            <Td dataLabel={columnNames.version}>{connection.brokerDetails.version}</Td>
            <Td dataLabel={columnNames.uptime}>{connection.brokerStatus.uptime}</Td>
            <Td dataLabel={columnNames.addressMemoryUsage}>{connection.brokerStatus.addressMemoryUsage + 'MB(' + connection.brokerStatus.used + '%)'}</Td>
          </Tr>
        ))}
          
        </Tbody>
      </TableComposable>     
    </React.Fragment>
  )
}
