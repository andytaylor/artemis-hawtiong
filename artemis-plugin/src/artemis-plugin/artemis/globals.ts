import { Logger } from '@hawtio/react'

export const artemisPluginName = 'artemis'
export const artemisPluginTitle = 'Artemis'
export const artemisPluginPath = '/artemis'
export const artemisNetworkPluginName = 'artemis-network'
export const artemisNetworkPluginTitle = 'Artemis Network'
export const artemisNetworkPluginPath = '/artemis-network'
export const artemisJMXPluginName = 'artemisJMX'
export const artemisJMXPluginTitle = 'Artemis JMX'
export const artemisJMXPluginPath = '/artemisJMX'

export const log = Logger.get(artemisPluginName) 
export const jmxDomain = 'org.apache.activemq.artemis'
export const domainNodeType = 'Camel Domain'
export const contextsType = 'contexts'
export const contextNodeType = 'context'

export const endpointNodeType = 'endpointNode'

