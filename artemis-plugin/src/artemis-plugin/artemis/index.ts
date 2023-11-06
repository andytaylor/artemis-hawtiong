import { HawtioPlugin, hawtio, helpRegistry, workspace, preferencesRegistry} from '@hawtio/react'
import { Artemis } from './Artemis'
import { ArtemisOptions, artemisPreferencesService } from './artemis-preferences-service'
import { ArtemisJMX } from './ArtemisJMX'
import { ArtemisNetwork } from './ArtemisNetwork'
import { ArtemisPreferences } from './ArtemisPreferences'
import { artemisNetworkPluginName, artemisNetworkPluginTitle, artemisNetworkPluginPath, log, artemisPluginName, artemisPluginTitle, artemisPluginPath, artemisJMXPluginName, artemisJMXPluginPath, artemisJMXPluginTitle,  } from './globals'
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

  const preferences: ArtemisOptions = artemisPreferencesService.loadArtemisPreferences();

  hawtio.addPlugin({
    id: artemisJMXPluginName,
    title: artemisJMXPluginTitle,
    path: artemisJMXPluginPath,
    component: ArtemisJMX,
    isActive:  async () => preferences.showJMXView,
  })

  helpRegistry.add(artemisPluginName, artemisPluginTitle, help, 1)
  preferencesRegistry.add(artemisPluginName, artemisPluginTitle, ArtemisPreferences, 1)
}
