const path = require('path');

module.exports = {
    experimental: {
        modern: true,
        polyfillsOptimization: true
    },
  
    webpack(config, { dev, isServer }) {
        const aliases = config.resolve.alias || (config.resolve.alias = {});
        aliases.react = aliases['react-dom'] = 'preact/compat';

        // This is the shared folder that I wanna alias
        aliases.shared = path.resolve(__dirname, '..', 'shared');
        
        const reg = /shared/;
        const babel = config.module.rules[0];
        babel.include.push(reg);
        babel.exclude = [f => !reg.test(f)].concat(babel.exclude);

        const splitChunks = config.optimization && config.optimization.splitChunks
        if (splitChunks) {
            const cacheGroups = splitChunks.cacheGroups;
            const preactModules = /[\\/]node_modules[\\/](preact|preact-render-to-string|preact-context-provider)[\\/]/;
            if (cacheGroups.framework) {
                cacheGroups.preact = Object.assign({}, cacheGroups.framework, {
                    test: preactModules
                });
                cacheGroups.commons.name = 'framework';
            } else {
                cacheGroups.preact = {
                    name: 'commons',
                    chunks: 'all',
                    test: preactModules
                };
            }
        }
    
        // inject Preact DevTools
        if (dev && !isServer) {
            const entry = config.entry;
            config.entry = () => entry().then(entries => {
                entries['main.js'] = ['preact/debug'].concat(entries['main.js'] || []);
                return entries;
            });
        }
    
        return config;
    }
  };