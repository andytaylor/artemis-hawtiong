import React, { useEffect, useState } from 'react'
import { Tabs, Tab, TabTitleText, EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import { ProducerTable } from '../producers/ProducerTable';
import { ConsumerTable } from '../consumers/ConsumerTable';
import { ConnectionsTable } from '../connections/ConnectionsTable';
import { SessionsTable } from '../sessions/SessionsTable';
import { AddressesTable } from '../addresses/AddressesTable';
import { QueuesTable } from '../queues/QueuesTable';
import { ArtemisContext, useArtemisTree } from '../context';
import { Status } from '../status/Status';
import { log } from '../globals';
import { Filter } from '../table/ArtemisTable';


export type Broker = {
  columnStorageLocation?: string
}

export type Navigate = {
  search: Function
  filter?: Filter
}

export const ArtemisTabs: React.FunctionComponent = () => {

  const { tree, selectedNode, setSelectedNode, findAndSelectNode } = useArtemisTree();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const[searchFilter, setSearchFilter] = useState<Filter | undefined>();


  const handleTabClick = (event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent, tabIndex: string | number
  ) => {
    setSearchFilter(undefined);
    setActiveTabKey(tabIndex);
  };

  const handleSearch = (tab: number, filter: Filter) => {
      log.info(filter);
      setSearchFilter(filter);
      setActiveTabKey(tab);
  };

  useEffect(() => {

  }, [searchFilter, activeTabKey])
  
  log.info("searching with 2" + searchFilter?.input);

  return (
    <ArtemisContext.Provider value={{ tree, selectedNode, setSelectedNode, findAndSelectNode }}>
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
              <ConnectionsTable search={handleSearch} filter={searchFilter}/>
            }
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Sessions</TabTitleText>} aria-label="sessions">
            {activeTabKey === 2 &&
              <SessionsTable search={handleSearch} filter={searchFilter}/>
            }
          </Tab>
          <Tab eventKey={3} title={<TabTitleText>Producers</TabTitleText>} aria-label="producers">
            {activeTabKey === 3 &&
              <ProducerTable search={handleSearch} filter={searchFilter}/>
            }
          </Tab>
          <Tab eventKey={4} title={<TabTitleText>Consumers</TabTitleText>} aria-label="consumers">
            {activeTabKey === 4 &&
              <ConsumerTable search={handleSearch} filter={searchFilter}/>
            }
          </Tab>
          <Tab eventKey={5} title={<TabTitleText>Addresses</TabTitleText>} aria-label="addresses">
            {activeTabKey === 5 &&
              <AddressesTable search={handleSearch} filter={searchFilter}/>
            }
          </Tab>
          <Tab eventKey={6} title={<TabTitleText>Queues</TabTitleText>} aria-label="consumers">
            {activeTabKey === 6 &&
              <QueuesTable search={handleSearch} filter={searchFilter}/>
            }
          </Tab>
        </Tabs>
      </div>
    </ArtemisContext.Provider>
  )

}
