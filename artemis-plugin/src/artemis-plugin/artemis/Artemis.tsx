import React from 'react'
import { ArtemisTabs } from './views/ArtemisTabView';
import './Artemis.css'
import { PageSection, TextContent, Text, PageSectionVariants } from '@patternfly/react-core';
import { Grid } from '@patternfly/react-core';
import { GridItem } from '@patternfly/react-core';



export const Artemis: React.FunctionComponent = () => {

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

