import { HawtioPlugin, configManager } from '@hawtio/react'
import { artemis } from './artemis'

/**
 * The entry function for the plugin exposed to Hawtio.
 *
 * The default name for the function is "plugin". If you want to use the name other
 * than the default one, you need to specify the name using {HawtioPlugin#pluginEntry()}
 * method when registering the plugin to JMX MBean server.
 *
 * <code>
 * new HawtioPlugin()
 *     .pluginEntry("registerMyPlugin");
 * </code>
 *
 * @see src/main/java/io/hawt/artemis/PluginContextListener.java
 */
export const plugin: HawtioPlugin = () => {
  artemis()
}


// Register the custom plugin version to Hawtio
// See package.json "replace-version" script for how to replace the version placeholder with a real version
configManager.addProductInfo('Artemis Plugin', '__PACKAGE_VERSION_PLACEHOLDER__')

// Branding and styles can be customised from a plugin as follows
configManager.configure(config => {
  config.branding = {
    appName: 'Artemis Console',
    showAppName: false,
    appLogoUrl: '/artemis-plugin/branding/activemq.png',
    css: '/artemis-plugin/branding/app.css',
    favicon: '/artemis-plugin/branding/favicon.png',
  }
  config.login = {
    description: 'Login page for Artemis Console.',
    links: [
      { url: 'https://activemq.apache.org/components/artemis/documentation/', text: 'Documentation' },
      { url: 'https://activemq.apache.org/', text: 'Website' },
    ],
  }
  config.about = {
    title: 'ActiveMQ Artemis Management Console',
    description: '',
    productInfo: [
      { name: 'Artemis', value: '1.0.1' },
    ],
    copyright: '',
    imgSrc: '/artemis-plugin/branding/activemq.png',
  }
  // If you want to disable specific plugins, you can specify the paths to disable them.
  //config.disabledRoutes = ['/simple-plugin']
})
