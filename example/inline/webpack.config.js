const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const InjectHtmlWebpackPlugin = require('../../index');

const DIST_PATH = path.resolve( __dirname, './dist' );
const baseConfig = require('../../webpack.config');

function createHtml () {
    return ['app'].map( page => {
        return new HtmlWebpackPlugin( {
            template: `./example/inline/src/${page}.hbs`,
            filename: path.resolve( __dirname, `./dist/html/${page}.html` ),
            chunks: [`${page}`],
            // inject: false,
            xhtml: true
        } )
    } );
}

baseConfig.entry= {
    app: './example/inline/src/app.js',
    eaentry: '@eagleeye-jssdk/loader/zuzuche.js?__inline'
}
baseConfig.output= {
    filename: 'js/[name]-[chunkhash].js',
    publicPath: '/',
    path: DIST_PATH,
    crossOriginLoading: 'anonymous'
}
baseConfig.plugins.push(...(createHtml()), new InjectHtmlWebpackPlugin({
    htmlDir: './example/inline/src'
}) );

// baseConfig.devServer = {
//     headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//         'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
//     },
//     disableHostCheck: true,
//     setup: (app, Server) => {
    
//         // 首页模板
//         app.get(/\/html\./, function (request, response) {
//             const fileContent = readFile('home', Server, 'book');
//             // 获取服务器渲染后的html文件字符串
//             getHomeHtml(request, response, fileContent, userLog.cookie, (html) => {
//                 response.send(html);
//             });
//         });
//     }
// },


module.exports = baseConfig;