import React, { useEffect, useState } from 'react'
import { PageSection, TextContent, PageSectionVariants, Text, Divider } from '@patternfly/react-core';
import { log } from '../globals'
import { ArtemisTabs } from '../ArtemisTabs';
import { BrokerConnection } from '../brokers/brokers-service';


export const Broker: React.FunctionComponent<BrokerConnection> = (brokerConnection: BrokerConnection) => {

  log.debug("Using broker Connection Configuration: " + JSON.stringify(brokerConnection))

  useEffect(() => {
    
  }, [brokerConnection])

  log.info("connection=="+JSON.stringify(brokerConnection))
  if (brokerConnection.connection == null) return (<></>)

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Text component="h1">{brokerConnection.brokerDetails.name}</Text>
          </TextContent>
        </PageSection>

        <Divider component="div"/>
        
        <PageSection isFilled padding={{ default: 'noPadding' }}>
          <ArtemisTabs connection={brokerConnection.connection} brokerDetails={brokerConnection.brokerDetails} brokerStatus={brokerConnection.brokerStatus} getJolokiaService={brokerConnection.getJolokiaService} />
      </PageSection>
     </React.Fragment>
  )
}

