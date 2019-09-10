const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const InjectHtmlWebpackPlugin = require( './index' );
const ip = require( 'ip' );
const fs = require( 'fs' );
const host = ip.address().toString();
const port = 9528;

const DIST_PATH = path.resolve( __dirname, './example/react/dist' );

const NODE_ENV = process.env.NODE_ENV;
let REACT_PATH = 'react/umd/react.production.min.js';
let REACT_DOM_PATH = 'react-dom/umd/react-dom.production.min.js';

if ( NODE_ENV == 'server' || NODE_ENV == 'development' ) {
    REACT_PATH = 'react/umd/react.development.js';
    REACT_DOM_PATH = 'react-dom/umd/react-dom.development.js';
}

const splitChunksName = [];

const initWebpackConfig = () => {
    return {
        mode: "development",
        devtool: 'source-map',
        devServer: {
            host,
            allowedHosts: [
                'localhost',
                host,
                '0.0.0.0',
                '127.0.0.1',
            ],
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            },
            disableHostCheck: true,
            port,
            // setup: router
        },
        module: {
            rules: [
                {
                    test: /\.(hbs|handlebars)$/,
                    loader: 'handlebars-loader'
                },
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
                'react-dom': require.resolve( REACT_DOM_PATH ),
                '@': path.resolve( __dirname, './example/react/src/book/' ),
                '^': path.resolve( __dirname, './example/react/src/otherService/' ),
                '@@': path.resolve( __dirname, './example/react/src/' )
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
                    ea: {
                        name: 'ea',
                        test: /node_modules\/@eagleeye-jssdk/,
                        chunks: 'initial',
                        priority: 15,
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
        ]
    };
}

module.exports = initWebpackConfig();