import React from 'react'
import { PageSection, TextContent, PageSectionVariants, Text, Divider } from '@patternfly/react-core';
import { Brokers } from './brokers/Brokers'
import { log } from './globals';

export const ArtemisNetwork: React.FunctionComponent = () => {
  log.info("***********an")
  
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Text component="h1">Broker Network</Text>
          </TextContent>
        </PageSection>

        <Divider component="div" />
        
        <PageSection isFilled padding={{ default: 'noPadding' }}>
          <Brokers/>
      </PageSection>
     </React.Fragment>
  )
}
