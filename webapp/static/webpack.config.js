module.exports = {
    entry: {
          'login': './login/login.jsx',
          'index'  : './index.jsx',
          'setting': './user/setting.jsx',
    },
    output: {
        path: __dirname,
        filename: './build/[name].js'
    },
    module: {
        rules: [{
            test: /\.js[x]$/i, 
            loader: 'babel-loader'
        }]
    },
    externals: {
      'react': 'React', 
      'react-dom': 'ReactDOM', 
    },
    mode:'development'
};
