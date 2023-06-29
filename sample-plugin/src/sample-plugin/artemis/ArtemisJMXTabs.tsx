import React, { useEffect, useState } from 'react'
import { Text, PageSection, TextContent, PageSectionVariants, Tabs, Tab, TabTitleText, EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import DisconnectedIcon from '@patternfly/react-icons/dist/esm/icons/disconnected-icon';
import { BrokerConnection } from './brokers/brokers-service';
import { ProducerTable } from './tables/ProducerTable';
import { ConsumerTable } from './tables/ConsumerTable';
import { ConnectionsTable } from './tables/ConnectionsTable';
import { SessionsTable } from './tables/SessionsTable';
import { AddressesTable } from './tables/AddressesTable';
import { QueuesTable } from './tables/QueuesTable';
import { log } from './globals';
import { Attributes, Chart, IJolokiaService, MBeanNode, Operations } from '@hawtio/react';
import { artemisService } from './artemis-service';
import { CreateQueue } from './components/CreateQueue';
import { Broker } from './ArtemisTabs';


export type JMXData = {
  node: MBeanNode
  brokerConnection: BrokerConnection
}

export const ArtemisJMXTabs: React.FunctionComponent<JMXData> = (data: JMXData) => {

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const isAddress = artemisService.isAddress(data.node)
  log.debug("type=" + isAddress)

  useEffect(() => {
    log.info("rendered Artemis");
  }, [activeTabKey])

  const handleTabClick = ( event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent, tabIndex: string | number
  ) => {
    log.info("setActiveTabKey Artemis:" + tabIndex);
    setActiveTabKey(tabIndex);
  };
  
  return (
    <div>
      <Tabs activeKey={activeTabKey}
            onSelect={handleTabClick} 
            aria-label="artemistabs" >
        <Tab eventKey={0} title={<TabTitleText>Attributes</TabTitleText>} aria-label="Attributes">
        {activeTabKey === 0 &&
          <Attributes/>
        }
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Operations</TabTitleText>} aria-label="Operations">
        {activeTabKey === 1 &&
          <Operations/>
        }
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Chart</TabTitleText>} aria-label="Chart">
        {activeTabKey === 2 &&
          <Chart/>
        }
        </Tab>
        { isAddress && 
          <Tab eventKey={3} title={<TabTitleText>Create Queue</TabTitleText>} aria-label="Create Queue">
              {activeTabKey === 3 &&
                <CreateQueue address={data.node.name} broker={{
                brokerMBeanName: data.brokerConnection.brokerDetails.brokerMBean,
                loaded: true,
                jolokia: data.brokerConnection.getJolokiaService()
              }}  />
            }
          </Tab> 
        }
      </Tabs> 
    </div>
  )

}
