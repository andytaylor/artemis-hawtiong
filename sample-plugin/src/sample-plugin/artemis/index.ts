import { HawtioPlugin, hawtio, helpRegistry, workspace, preferencesRegistry} from '@hawtio/react'
import { Artemis } from './Artemis'
import { ArtemisNetwork } from './ArtemisNetwork'
import { ArtemisPreferences } from './ArtemisPreferences'
import { artemisNetworkPluginName, artemisNetworkPluginTitle, artemisNetworkPluginPath, log, artemisPluginName, artemisPluginTitle, artemisPluginPath,  } from './globals'
import help from './help.md'

export const artemis: HawtioPlugin = () => {

  log.info('Loading', artemisNetworkPluginName);

  hawtio.addPlugin({
    id: artemisNetworkPluginName,
    title: artemisNetworkPluginTitle,
    path: artemisNetworkPluginPath,
    component: ArtemisNetwork,
    isActive: async () => { 
      var networked = await workspace.treeContainsDomainAndProperties("org.apache.activemq.artemis");
      log.info("netwroekd" + networked)
      return !networked;
    },
  })

  log.info('Loading', artemisPluginName);

  hawtio.addPlugin({
    id: artemisPluginName,
    title: artemisPluginTitle,
    path: artemisPluginPath,
    component: Artemis,
    isActive:  async () => workspace.treeContainsDomainAndProperties("org.apache.activemq.artemis"),
  })

  helpRegistry.add(artemisPluginName, artemisPluginTitle, help, 101)
  preferencesRegistry.add(artemisPluginName, artemisPluginTitle, ArtemisPreferences, 101)
}
