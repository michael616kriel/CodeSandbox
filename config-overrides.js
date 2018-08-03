const { injectBabelPlugin } = require('react-app-rewired');

module.exports = {
    // The Webpack config to use when compiling your react app for development or production.
    webpack: function(config, env) {
        // ...add your webpack config customisation, rewires, etc...
        
        const { injectBabelPlugin } = require('react-app-rewired');
        const rewireLess = require('react-app-rewire-less');
        const rewireSass = require('react-app-rewire-scss');
        
        const theme = require('./src/theme')

        config = injectBabelPlugin([
            'import', { 
                libraryName: 'antd', 
                libraryDirectory: 'lib', 
                style: true    
            }
        ], config);
        
        config = rewireLess.withLoaderOptions({ 
            javascriptEnabled: true ,
            modifyVars: theme
        })(config, env);

        config = rewireSass(config, env);
        
        return config;
    }
}