module.exports = {
    entry: {
//          'login': './login/login.jsx',
          //'index'  : './index.jsx',
 //         'menu'  : './menu.jsx',
 //         'setting': './user/setting.jsx',
          'app': './app.jsx',
    },
  //resolve.extensions
    output: {
        path: __dirname,
        filename: './build/[name].js'
    },
    module: {
        rules: [{
            test: /\.js[x]$/i, 
            loader: 'babel-loader'
        }],
    },
    resolve:{
      extensions: [".js", ".json", ".jsx", ".css"],
    } ,
    externals: {
      'react': 'React', 
      'react-dom': 'ReactDOM', 
    },
    mode:'development'
};
