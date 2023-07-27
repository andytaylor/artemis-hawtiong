import React, { useEffect, useState } from 'react'
import { Tabs, Tab, TabTitleText, EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import DisconnectedIcon from '@patternfly/react-icons/dist/esm/icons/disconnected-icon';
import { BrokerConnection } from '../brokers/brokers-service';
import { ProducerTable } from '../producers/ProducerTable';
import { ConsumerTable } from '../consumers/ConsumerTable';
import { ConnectionsTable } from '../connections/ConnectionsTable';
import { SessionsTable } from '../sessions/SessionsTable';
import { AddressesTable } from '../addresses/AddressesTable';
import { QueuesTable } from '../queues/QueuesTable';
import { log } from '../globals';
import { IJolokiaService } from '@hawtio/react';
import { ArtemisContext, useArtemisTree } from '../context';
import { Status } from '../status/Status';


export type Broker = {
  brokerMBeanName: string,
  jolokia: IJolokiaService,
  columnStorageLocation?: string
}

export const ArtemisTabs: React.FunctionComponent<BrokerConnection> = (connection: BrokerConnection) => {

  const { tree, selectedNode, setSelectedNode } = useArtemisTree();

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  useEffect(() => {
    log.info("rendered Artemis");
  }, [activeTabKey])

  const handleTabClick = (event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent, tabIndex: string | number
  ) => {
    log.info("setActiveTabKey Artemis:" + tabIndex);
    setActiveTabKey(tabIndex);
  };


  if (!connection.brokerDetails.updated)
    return (
      <React.Fragment>
        <EmptyState>
          <EmptyStateIcon icon={DisconnectedIcon} />
          <Title headingLevel="h4" size="lg">Not Connected</Title>
          <EmptyStateBody>Please check the connection configuration and the Jolokia endpoint configuration</EmptyStateBody>
        </EmptyState>
      </React.Fragment>
    )

  return (
    <ArtemisContext.Provider value={{ tree, selectedNode, setSelectedNode }}>
      <div>
        <Tabs activeKey={activeTabKey}
          onSelect={handleTabClick}
          aria-label="artemistabs" >
          <Tab eventKey={0} title={<TabTitleText>Status</TabTitleText>} aria-label="connections">
            {activeTabKey === 0 &&
              <Status/>
            }
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>Connections</TabTitleText>} aria-label="connections">
            {activeTabKey === 1 &&
              <ConnectionsTable brokerMBeanName={connection.brokerDetails.brokerMBean} jolokia={connection.getJolokiaService()} />
            }
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Sessions</TabTitleText>} aria-label="sessions">
            {activeTabKey === 2 &&
              <SessionsTable brokerMBeanName={connection.brokerDetails.brokerMBean} jolokia={connection.getJolokiaService()} />
            }
          </Tab>
          <Tab eventKey={3} title={<TabTitleText>Producers</TabTitleText>} aria-label="producers">
            {activeTabKey === 3 &&
              <ProducerTable brokerMBeanName={connection.brokerDetails.brokerMBean} jolokia={connection.getJolokiaService()} />
            }
          </Tab>
          <Tab eventKey={4} title={<TabTitleText>Consumers</TabTitleText>} aria-label="consumers">
            {activeTabKey === 4 &&
              <ConsumerTable brokerMBeanName={connection.brokerDetails.brokerMBean} jolokia={connection.getJolokiaService()} />
            }
          </Tab>
          <Tab eventKey={5} title={<TabTitleText>Addresses</TabTitleText>} aria-label="addresses">
            {activeTabKey === 5 &&
              <AddressesTable brokerMBeanName={connection.brokerDetails.brokerMBean} jolokia={connection.getJolokiaService()} />
            }
          </Tab>
          <Tab eventKey={6} title={<TabTitleText>Queues</TabTitleText>} aria-label="consumers">
            {activeTabKey === 6 &&
              <QueuesTable brokerMBeanName={connection.brokerDetails.brokerMBean} jolokia={connection.getJolokiaService()} />
            }
          </Tab>
        </Tabs>
      </div>
    </ArtemisContext.Provider>
  )

}
