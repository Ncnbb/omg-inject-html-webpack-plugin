const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const InjectHtmlWebpackPlugin = require('../../index');

const DIST_PATH = path.resolve( __dirname, './dist' );
const baseConfig = require('../../webpack.config');

function createHtml () {
    return ['app'].map( page => {
        return new HtmlWebpackPlugin( {
            template: `./example/hbs/src/${page}.hbs`,
            filename: path.resolve( __dirname, `./dist/html/${page}.html` ),
            chunks: [`${page}`],
            // inject: false,
            xhtml: true
        } )
    } );
}

baseConfig.entry= {
    app: './example/hbs/src/app.js',
}
baseConfig.output= {
    filename: 'js/[name]-[chunkhash].js',
    publicPath: 'https://imgcdn50.zuzuche.com/static/',
    path: DIST_PATH,
    crossOriginLoading: 'anonymous'
}
baseConfig.plugins.push(...(createHtml()), new InjectHtmlWebpackPlugin({
    htmlDir: './example/hbs/src'
}) );


module.exports = baseConfig;