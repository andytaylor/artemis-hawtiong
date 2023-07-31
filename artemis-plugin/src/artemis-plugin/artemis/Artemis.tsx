import React from 'react'
import {useNavigate } from 'react-router-dom'
import { CubesIcon } from '@patternfly/react-icons'
import { ArtemisTabs } from './views/ArtemisTabView';
import Split from 'react-split'
import { ArtemisContext, useArtemisTree } from './context';
import { ArtemisTreeView } from './ArtemisTreeView';
import './Artemis.css'
import { PageSection, TextContent, Text, PageSectionVariants, Button, EmptyState, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { Grid } from '@patternfly/react-core';
import { GridItem } from '@patternfly/react-core';
import { ArtemisJMXTabs } from './views/ArtemisJMXTabView';



export const Artemis: React.FunctionComponent = () => {

  const [jmxView, setJmxView] = React.useState(false);
  const { tree, selectedNode, setSelectedNode, findAndSelectNode } = useArtemisTree();
  const navigate = useNavigate();
  const toggleJmxView = () => {
    setJmxView(!jmxView);
  };

  function connect() {
    navigate('/artemis-network');
    navigate(0);
  }

  return ( 
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Grid >
          <GridItem span={2}>
          <TextContent>
            <Text component="h1">Broker</Text>
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
      <ArtemisContext.Provider value={{ tree, selectedNode, setSelectedNode, findAndSelectNode }}>
    
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
              <ArtemisJMXTabs node={selectedNode}/>
            </PageSection>
          }
          </div>
        </Split>
      </ArtemisContext.Provider>
      }
      {!jmxView &&
        <PageSection isFilled>
          <ArtemisTabs/>
        </PageSection>
      }
    </React.Fragment>
  )
}

