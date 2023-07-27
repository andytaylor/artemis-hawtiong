import React, { useState } from 'react'
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { BrokerConnection } from '../brokers/brokers-service';
import { Attributes, Chart, MBeanNode, Operations } from '@hawtio/react';
import { CreateQueue } from '../queues/CreateQueue';
import { DeleteAddress } from '../addresses/DeleteAddress';
import { isAddress as isAnAddress } from '../util/jmx'


export type JMXData = {
  node: MBeanNode
  brokerConnection: BrokerConnection
}

export const ArtemisJMXTabs: React.FunctionComponent<JMXData> = (data: JMXData) => {

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const isAddress = isAnAddress(data.node)

  const handleTabClick = ( event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent, tabIndex: string | number
  ) => {
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
                <CreateQueue address={data.node.name}/>
            }
          </Tab> 
        }
        { isAddress && 
          <Tab eventKey={4} title={<TabTitleText>Delete Address</TabTitleText>} aria-label="">
              {activeTabKey === 4 &&
                <DeleteAddress address={data.node.name}/>
            }
          </Tab> 
        }
      </Tabs> 
    </div>
  )

}
