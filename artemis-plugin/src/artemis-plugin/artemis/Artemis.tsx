import React, { useEffect, useState } from 'react'
import { log } from './globals'
import {useNavigate } from 'react-router-dom'
import { CubesIcon } from '@patternfly/react-icons'
import { ArtemisTabs } from './views/ArtemisTabView';
import { BrokerConnection, brokerService } from './brokers/brokers-service';
import { jolokiaService, MBeanNode } from '@hawtio/react';
import Split from 'react-split'
import { ArtemisContext, useArtemisTree } from './context';
import { ArtemisTreeView } from './ArtemisTreeView';
import './Artemis.css'
import { PageSection, TextContent, Text, PageSectionVariants, Button, EmptyState, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { Grid } from '@patternfly/react-core';
import { GridItem } from '@patternfly/react-core';
import { ArtemisJMXTabs } from './views/ArtemisJMXTabView';
import { isQueue as isAQueue } from './util/jmx'



export const Artemis: React.FunctionComponent<BrokerConnection> = () => {

  const [brokerConnection, setBrokerConnection] = useState<BrokerConnection>()
  const [jmxView, setJmxView] = React.useState(false);
  const { tree, selectedNode, setSelectedNode } = useArtemisTree();
  const navigate = useNavigate();
  const toggleJmxView = () => {
    setJmxView(!jmxView);
  };

  function connect() {
    navigate('/artemis-network');
    navigate(0);
  }

  useEffect(() => {
    const getJolokia = async () => { 
        var newBrokerConnection = await brokerService.createBroker(jolokiaService);
        log.info("Creating connection as ruunning embedded with JolokiaService, connection=" + newBrokerConnection.connection.host);
        setBrokerConnection(newBrokerConnection);
    }
    getJolokia();
  }, [])

  log.debug("using connection=="+JSON.stringify(brokerConnection))
  log.debug("using mbean=="+selectedNode?.objectName)
  const isQueue = isAQueue(selectedNode as MBeanNode)
  log.debug("type=" + isQueue)
  if (brokerConnection == null) return (<></>)

  return ( 
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Grid >
          <GridItem span={2}>
          <TextContent>
            <Text component="h1">{brokerConnection.connection.name}</Text>
            </TextContent>
          </GridItem>
          <GridItem span={1}>
            <TextContent>
              <Text>Version: {brokerConnection.brokerDetails.version}</Text>
            </TextContent>
          </GridItem>

          <GridItem span={1}>
            <TextContent>
              <Text>Uptime: {brokerConnection.brokerStatus.uptime}</Text>
            </TextContent>
          </GridItem>
          <GridItem span={1}>
            <Button onClick={toggleJmxView}>{jmxView ? 'Table View' : 'JMX View'}</Button>
          </GridItem>
          <GridItem span={1}>
            <Button onClick={connect}>Back</Button>
          </GridItem>
      </Grid>
    </PageSection>
    {jmxView &&
      <ArtemisContext.Provider value={{ tree, selectedNode, setSelectedNode }}>
    
        <Split className='artemis-split' sizes={[25, 75]} minSize={200} gutterSize={5}>
          <div>
            <ArtemisTreeView />
          </div>
          <div>
            {!selectedNode && 
            <PageSection variant={PageSectionVariants.light} isFilled>
            <EmptyState variant={EmptyStateVariant.full}>
              <EmptyStateIcon icon={CubesIcon} />
              <Title headingLevel='h1' size='lg'>
                Select Artemis Node
              </Title>
            </EmptyState>
          </PageSection>
          }
          {selectedNode && 
            
            <PageSection isFilled>
              <ArtemisJMXTabs node={selectedNode} brokerConnection={brokerConnection}  />
            </PageSection>
          }
          </div>
        </Split>
      </ArtemisContext.Provider>
      }
      {!jmxView &&
        <PageSection isFilled>
          <ArtemisTabs connection={brokerConnection.connection} brokerDetails={brokerConnection.brokerDetails} brokerStatus={brokerConnection.brokerStatus} getJolokiaService={brokerConnection.getJolokiaService} />
        </PageSection>
      }
    </React.Fragment>
  )
}
