const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const InjectHtmlWebpackPlugin = require('../../index');

const DIST_PATH = path.resolve( __dirname, './dist' );

const NODE_ENV = process.env.NODE_ENV;
let REACT_PATH = 'react/umd/react.production.min.js';
let REACT_DOM_PATH = 'react-dom/umd/react-dom.production.min.js';

if ( NODE_ENV == 'server' || NODE_ENV == 'development' ) {
    REACT_PATH = 'react/umd/react.development.js';
    REACT_DOM_PATH = 'react-dom/umd/react-dom.development.js';
}

const splitChunksName = [];

function createHtml () {
    return ['app', 'app2'].map( page => {
        return new HtmlWebpackPlugin( {
            template: `./example/default/src/${page}.html`,
            filename: path.resolve( __dirname, `./dist/html/${page}.html` ),
            chunks: [`${page}`],
            // inject: false,
            xhtml: true
        } )
    } );
}

const initWebpackConfig = async () => {
    return {
        mode: "development",
        devtool: 'source-map',
        entry: {
            app: './example/default/src/app.js',
            app2: './example/default/src/app2.js',
        },
        output: {
            filename: 'js/[name]-[chunkhash].js',
            publicPath: 'https://imgcdn50.zuzuche.com/static/',
            path: DIST_PATH,
            crossOriginLoading: 'anonymous'
        },
        module: {
            rules: [
                {
                    test: /\.js|jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                [
                                    require( '@babel/preset-env' ).default,
                                    {
                                        "targets": {
                                            browsers: [ // 浏览器
                                                'Chrome >= 45', 
                                                'last 2 Firefox versions',
                                                'ie >= 10',
                                                 'Edge >= 12',
                                                'iOS >= 9', 
                                                'Android >= 4', 
                                                'last 2 ChromeAndroid versions'
                                            ]
                                        },
                                        modules: false,
                                        debug: false,
                                        useBuiltIns: false,
                                        ignoreBrowserslistConfig: false,
                                    }
                                ],
                                require( '@babel/preset-react' ).default
                            ],
                            plugins: [
                                ["@babel/plugin-proposal-class-properties", {
                                    "loose": true
                                }],
                                ["@babel/plugin-transform-runtime", {
                                    "corejs": 3,
                                    "helpers": true,
                                    "regenerator": true,
                                    "useESModules": true
                                }]
                            ]
                        }
                    }
                },
                {
                    test: /(\.scss|\.css|\.sass)$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: [
                                    require( 'autoprefixer' )( {
                                        broswer: [
                                            'Chrome >= 45',
                                            'last 2 Firefox versions',
                                            'ie >= 10',
                                            'Edge >= 12',
                                            'iOS >= 9',
                                            'Android >= 4',
                                            'last 2 ChromeAndroid versions',
                                        ]
                                    } )], //处理CSS前缀问题，自动添加前缀
                            }
                        },
                        {
                            loader: 'sass-loader'
                        }]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|jpg|png|gif)\??.*$/,
                    loader: 'url-loader',
                    query: {
                        limit: 8192,
                        name: 'images/[name].[ext]'
                    }
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-sprite-loader',
                },
            ]
        },
        resolve: {
            alias: {
                react: require.resolve( REACT_PATH ),
                'react-dom': require.resolve( REACT_DOM_PATH )
            },
            extensions: ['.js', '.jsx', '.json'],
        },
        optimization: {
            //抽取公共的dm
            splitChunks: {
                chunks: 'initial',
                minSize: 30000,
                maxSize: 0,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                automaticNameMaxLength: 30,
                name: true,
                cacheGroups: {
                    styles: {
                        name: ( module, chunks, cacheGroupKey ) => {
                            const arr = [];
                            module._chunks.forEach( ( chunk ) => { arr.push( chunk.name ) } )
                            let splitChunkName = 'style~' + arr.join( '~' );
                            if ( splitChunksName.indexOf( splitChunkName ) == -1 ) {
                                splitChunksName.push( splitChunkName );
                            }
                            return splitChunkName;
                        },
                        test: /\.scss$/,
                        chunks: 'initial',
                        enforce: true,
                        priority: 5,
                    },
                    react: {
                        name: 'react-runtime',
                        test: /node_modules\/(react|redux|prop-types)/,
                        chunks: 'initial',
                        priority: 10,
                    },
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: ( module, chunks, cacheGroupKey ) => {
                            const arr = [];
                            module._chunks.forEach( ( chunk ) => { arr.push( chunk.name ) } )
                            let splitChunkName = 'vender~' + arr.join( '~' );
                            if ( splitChunksName.indexOf( splitChunkName ) == -1 ) {
                                splitChunksName.push( splitChunkName );
                            }
                            return splitChunkName;
                        },
                        priority: 5
                    }
                }
            }
        },
        plugins: [
            new MiniCssExtractPlugin( {
                filename: 'css/[name]-[contenthash].css',
                chunkFilename: 'css/[name]-[contenthash].css'
            } ),
            ...createHtml(),
            new InjectHtmlWebpackPlugin({
                htmlDir: './example/default/src'
            })
        ]
    };
}

module.exports = initWebpackConfig();