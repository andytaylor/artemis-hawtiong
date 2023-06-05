import React, { useEffect, useState } from 'react'
import { PageSection, TextContent, PageSectionVariants, Text, Divider } from '@patternfly/react-core';
import { log } from './globals'
import { ArtemisTabs } from './ArtemisTabs';
import { BrokerConnection, brokerService } from './brokers/brokers-service';
import { IJolokiaService, jolokiaService, workspace } from '@hawtio/react';
import Split from 'react-split'
import { ArtemisContext, useArtemisTree } from './context';
import { ArtemisTreeView } from './ArtemisTreeView';
import './Artemis.css'



export const Artemis: React.FunctionComponent<BrokerConnection> = () => {

  const [brokerConnection, setBrokerConnection] = useState<BrokerConnection>()
  const { tree, loaded, selectedNode, setSelectedNode, logit } = useArtemisTree()

  useEffect(() => {
    const getJolokia = async () => { 
        var newBrokerConnection = await brokerService.createBroker(jolokiaService);
        log.info("Creating connection as ruunning embedded with JolokiaService, connection=" + newBrokerConnection.connection.host);
        setBrokerConnection(newBrokerConnection);
        logit();
    }
    getJolokia();
  }, [])

  log.debug("using connection=="+JSON.stringify(brokerConnection))
  if (brokerConnection == null) return (<></>)

  return (
    <ArtemisContext.Provider value={{ tree, selectedNode, setSelectedNode}}>
      <Split className='artemis-split' sizes={[25, 75]} minSize={200} gutterSize={5}>
        <div>
          <ArtemisTreeView />
        </div>
        <div>
          <PageSection isFilled>
            <ArtemisTabs connection={brokerConnection.connection} brokerDetails={brokerConnection.brokerDetails} brokerStatus={brokerConnection.brokerStatus} getJolokiaService={brokerConnection.getJolokiaService} />
          </PageSection>
          </div>
      </Split>
    </ArtemisContext.Provider>
  )
}

