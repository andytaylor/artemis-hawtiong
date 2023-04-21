import { HawtioPlugin, hawtio, helpRegistry, workspace} from '@hawtio/react'
import { Artemis } from './Artemis'
import { ArtemisNetwork } from './ArtemisNetwork'
import { artemisNetworkPluginName, artemisNetworkPluginTitle, artemisNetworkPluginPath, log, artemisPluginName, artemisPluginTitle, artemisPluginPath,  } from './globals'
import help from './help.md'

export const artemis: HawtioPlugin = () => {

  //@Tadayoshi This loads 2 Plugins, 
  //the 1st ArtemisNetwork uses the set of connections to display a page (Status) showing basic status of each broker and then 
  //allow navigating to the page showing a set of tabs that list broker resources (ArtemisNetwork.tsx -> ArtemisTabs.tsx). There is no tree view or polling of JMX, just infro returned from the loading of different info
  //This would be the console running standalone and not embedded in a brokers VM
  //The 2nd is the conventional view as we have now which will have a JMX tree and again show the (Artemis.tsx -> (ArtemisJMXTree.tsx, ArtemisTabs.tsx)) but this time only that embedded brokers info and with extra tabs that make sens for this view, such as attributes and operations

  log.info('Loading', artemisNetworkPluginName);

  hawtio.addPlugin({
    id: artemisNetworkPluginName,
    title: artemisNetworkPluginTitle,
    path: artemisNetworkPluginPath,
    component: ArtemisNetwork,
    isActive: async () => true, //@Tadayoshi This will only be displayed if no workspace for artemis exists, i.e. no loaded JMX tree
  })

  log.info('Loading', artemisPluginName);

  hawtio.addPlugin({
    id: artemisPluginName,
    title: artemisPluginTitle,
    path: artemisPluginPath,
    component: Artemis,
    isActive: async () => true, //@Tadayoshi This will only be displayed if a workspace for artemis exists, i.e. loaded JMX tree when embedded with broker
  })

  helpRegistry.add(artemisPluginName, artemisPluginTitle, help, 101)
  //preferencesRegistry.add(pluginName, pluginTitle, SimplePreferences, 101)
}
