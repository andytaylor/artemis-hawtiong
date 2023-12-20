const { ModuleFederationPlugin } = require('webpack').container
const { hawtioBackend } = require('@hawtio/backend-middleware')
const { dependencies } = require('./package.json')

module.exports = {
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          // The container name corresponds to 'scope' passed to HawtioPlugin
          name: 'artemisPlugin',
          filename: 'remoteEntry.js',
          // The key in exposes corresponds to 'remote' passed to HawtioPlugin
          exposes: {
            './plugin': './src/artemis-plugin',
          },
          shared: {
            ...dependencies,
            react: {
              singleton: true,
              requiredVersion: dependencies['react'],
            },
            'react-dom': {
              singleton: true,
              requiredVersion: dependencies['react-dom'],
            },
            'react-router-dom': {
              singleton: true,
              requiredVersion: dependencies['react-router-dom'],
            },
            '@hawtio/react': {
              singleton: true,
              requiredVersion: dependencies['@hawtio/react'],
            },
          },
        }),
      ],
    },
    configure: webpackConfig => {
      // Required for Module Federation
      webpackConfig.output.publicPath = 'auto'

      webpackConfig.module.rules.push({
        test: /\.md/,
        type: 'asset/source',
      })

      // For suppressing sourcemap warnings from dependencies
      webpackConfig.ignoreWarnings = [/Failed to parse source map/]

       // To resolve errors for @module-federation/utilities 2.x
      // https://github.com/module-federation/universe/issues/827
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify'),
        },
      }

      // MiniCssExtractPlugin - Ignore order as otherwise conflicting order warning is raised
      const miniCssExtractPlugin = webpackConfig.plugins.find(p => p.constructor.name === 'MiniCssExtractPlugin')
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.ignoreOrder = true
      }

      return webpackConfig
    },
  },
  // For plugin development
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
       // Redirect / or /hawtio to /hawtio/
       devServer.app.get('/', (_, res) => res.redirect('/hawtio/'))
       devServer.app.get('/hawtio$', (_, res) => res.redirect('/hawtio/'))

      const username = 'developer'
      const login = true
      const proxyEnabled = true
      const plugin = []
      const hawtconfig = {
        "branding": {
          "appName": "Artemis Management Console 3 ",
          "appLogoUrl": "img/activemq.png",
          "css": "/hawtio/css/artemis.css",
          "favicon": "img/favicon.ico"
        },
        "about": {
          "title": "Artemis Management Console",
          "description": "An Artemis console based on HawtIO + cdTypeScript + React.",
          "imgSrc": "img/activemq.png",
          "productInfo": [
            {
              "name": "Artemis",
              "value": "2.32.0"
            }
          ],
          "copyright": "© Hawtio project"
        },
        "disabledRoutes": ["disabled"]
      }

      /**const keycloakEnabled = false
      const keycloakClientConfig = {
      }
      const keycloakClientConfig = {
        realm: 'artemis-keycloak-demo',
        clientId: 'artemis-console',
        url: 'http://localhost:8080/',
        jaas: false,
        pkceMethod: 'S256',
      }*/

      // Hawtio backend API mock
      devServer.app.get('/hawtio/user', (req, res) => res.send(`"${username}"`))
      devServer.app.post('/hawtio/auth/login', (req, res) => res.send(String(login)))
      devServer.app.get('/hawtio/auth/logout', (req, res) => res.redirect('/hawtio/login'))
      devServer.app.get('/hawtio/proxy/enabled', (req, res) => res.send(String(proxyEnabled)))
      devServer.app.get('/hawtio/plugin', (req, res) => res.send(JSON.stringify(plugin)))
     // devServer.app.get('/hawtio/keycloak/enabled', (_, res) => res.send(String(keycloakEnabled)))
     // devServer.app.get('/hawtio/keycloak/client-config', (_, res) => res.send(JSON.stringify(keycloakClientConfig)))
     // devServer.app.get('/hawtio/keycloak/validate-subject-matches', (_, res) => res.send('true'))

      // hawtconfig.json mock
      devServer.app.get('/hawtio/hawtconfig.json', (req, res) => res.send(JSON.stringify(hawtconfig)))

      middlewares.push({
        name: 'hawtio-backend',
        path: '/hawtio/proxy',
        middleware: hawtioBackend({
          // Uncomment it if you want to see debug log for Hawtio backend
          logLevel: 'debug',
        }),
      })

      return middlewares
    },
  },
}
