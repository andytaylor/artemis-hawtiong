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

  const { tree, selectedNode, setSelectedNode, findAndSelectNode } = useArtemisTree();
  const navigate = useNavigate();

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
        <PageSection isFilled>
          <ArtemisTabs/>
        </PageSection>
    </React.Fragment>
  )
}

