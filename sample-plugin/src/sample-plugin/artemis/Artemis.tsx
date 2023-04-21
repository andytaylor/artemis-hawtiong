import React, { useEffect, useState } from 'react'
import { PageSection, TextContent, PageSectionVariants, Text, Divider } from '@patternfly/react-core';
import { log } from './globals'
import { ArtemisTabs } from './ArtemisTabs';
import { useLocation } from 'react-router-dom'
import { BrokerConnection, brokerService } from './brokers/brokers-service';
import { jolokiaService, workspace } from '@hawtio/react';


export const Artemis: React.FunctionComponent = () => {
  const location = useLocation();
  const [connection, setConnection] = useState<BrokerConnection>(location.state?location.state["connection"]:null)

  log.debug("Using broker Connection Configuration: " + JSON.stringify(connection))

  useEffect(() => {
    const getJolokia = async () => {
      if (connection) 
        return

      log.info("Creating connection as embedded");
      setConnection(await brokerService.createBroker(jolokiaService));
    }
    getJolokia();
  }, [connection])

  if (connection == null) return (<></>)

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Text component="h1">{connection.brokerDetails.name}</Text>
          </TextContent>
        </PageSection>

        <Divider component="div"/>
        
        <PageSection isFilled padding={{ default: 'noPadding' }}>
          <ArtemisTabs connection={connection.connection} brokerDetails={connection.brokerDetails} brokerStatus={connection.brokerStatus} />
      </PageSection>
     </React.Fragment>
  )
}

