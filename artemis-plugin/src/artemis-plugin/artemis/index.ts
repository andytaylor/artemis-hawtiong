import { HawtioPlugin, hawtio, helpRegistry, workspace, preferencesRegistry} from '@hawtio/react'
import { Artemis } from './Artemis'
import { ArtemisJMX } from './ArtemisJMX'
import { ArtemisPreferences } from './ArtemisPreferences'
import { log, artemisPluginName, artemisPluginTitle, artemisPluginPath, artemisJMXPluginName, artemisJMXPluginPath, artemisJMXPluginTitle,  } from './globals'
import help from './help.md'

export const artemis: HawtioPlugin = () => {



  log.info('Loading', artemisPluginName);

  hawtio.addPlugin({
    id: artemisPluginName,
    title: artemisPluginTitle,
    path: artemisPluginPath,
    component: Artemis,
    order: -2,
    isActive:  async () => workspace.treeContainsDomainAndProperties("org.apache.activemq.artemis"),
  })

  hawtio.addPlugin({
    id: artemisJMXPluginName,
    title: artemisJMXPluginTitle,
    path: artemisJMXPluginPath,
    component: ArtemisJMX,
    order: -1,
    isActive:  async () => workspace.treeContainsDomainAndProperties("org.apache.activemq.artemis"),
  })

  helpRegistry.add(artemisPluginName, artemisPluginTitle, help, 1)
  preferencesRegistry.add(artemisPluginName, artemisPluginTitle, ArtemisPreferences, 1)
}
