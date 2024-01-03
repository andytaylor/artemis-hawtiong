import React from 'react'
import { CubesIcon } from '@patternfly/react-icons'
import Split from 'react-split'
import { ArtemisContext, useArtemisTree } from './context';
import { ArtemisTreeView } from './ArtemisTreeView';
import { PageSection, TextContent, Text, PageSectionVariants, EmptyState, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { Grid } from '@patternfly/react-core';
import { GridItem } from '@patternfly/react-core';
import { ArtemisJMXTabs } from './views/ArtemisJMXTabView';
import './artemisJMX.css'



export const ArtemisJMX: React.FunctionComponent = () => {

  const { tree, selectedNode, brokerNode, setSelectedNode, findAndSelectNode } = useArtemisTree();


  return ( 
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Grid >
          <GridItem span={2}>
          <TextContent>
            <Text component="h1">Broker</Text>
            </TextContent>
          </GridItem>

      </Grid>
    </PageSection>
      <ArtemisContext.Provider value={{ tree, selectedNode,brokerNode, setSelectedNode, findAndSelectNode }}>
    
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
    </React.Fragment>
  )
}

