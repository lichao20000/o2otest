module.exports = {
    entry: {
//        'react': './react-custom.js'
        'react16.2': './react-custom.jsx'
    },
    output: {
        path: __dirname,
        filename: '../build/[name].js'
    },
    module: {
        rules: [{
            test: /\.js[x]$/i, 
            loader: 'babel-loader'
        }]
    },
    externals: {
    },
    mode:'development'
};
