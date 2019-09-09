const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const InjectHtmlWebpackPlugin = require('../../index');

const DIST_PATH = path.resolve( __dirname, './dist' );
const baseConfig = require('../../webpack.config');

function createHtml () {
    return ['app', 'app2'].map( page => {
        return new HtmlWebpackPlugin( {
            template: `./example/ejs/src/${page}.html`,
            filename: path.resolve( __dirname, `./dist/html/${page}.html` ),
            chunks: [`${page}`],
            // inject: false,
            xhtml: true
        } )
    } );
}

baseConfig.entry= {
    app: './example/ejs/src/app.js',
    app2: './example/ejs/src/app2.js',
}
baseConfig.output= {
    filename: 'js/[name]-[chunkhash].js',
    publicPath: 'https://imgcdn50.zuzuche.com/static/',
    path: DIST_PATH,
    crossOriginLoading: 'anonymous'
}
baseConfig.plugins.push(...(createHtml()), new InjectHtmlWebpackPlugin({
    htmlDir: './example/ejs/src'
}) );


module.exports = baseConfig;