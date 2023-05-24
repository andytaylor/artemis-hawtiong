import React, { useEffect, useState } from 'react'
import { PageSection, TextContent, PageSectionVariants, Text, Divider } from '@patternfly/react-core';
import { log } from './globals'
import { ArtemisTabs } from './ArtemisTabs';
import { useLocation } from 'react-router-dom'
import { BrokerConnection, brokerService } from './brokers/brokers-service';
import { IJolokiaService, jolokiaService, workspace } from '@hawtio/react';


export const Artemis: React.FunctionComponent<BrokerConnection> = () => {

  const [brokerConnection, setBrokerConnection] = useState<BrokerConnection>()

  useEffect(() => {
    const getJolokia = async () => { 
        var newBrokerConnection = await brokerService.createBroker(jolokiaService);
        log.info("Creating connection as ruunning embedded with JolokiaService, connection=" + newBrokerConnection.connection.host);
        setBrokerConnection(newBrokerConnection);
    }
    getJolokia();
  }, [])

  log.debug("using connection=="+JSON.stringify(brokerConnection))
  if (brokerConnection == null) return (<></>)

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

