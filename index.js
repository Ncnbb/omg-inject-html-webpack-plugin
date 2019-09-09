const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const { isString } = require( './lib/utils/typeof' );
const path = require( 'path' );

const PLUGIN_NAME = 'InjectHtmlWebpackPlugin';

class InjectHtmlWebpackPlugin {
    constructor( options ) {
        const defaultOptions = {
            htmlDir: null,
            inject: true, // 默认将会关闭html-webpack-plugin的inject
            test: /(\.view\.html)|\.html/
        };
        this.options = Object.assign( defaultOptions, options );

        if ( this.options.htmlDir && isString( this.options.htmlDir ) ) {
            this.options.htmlDir = path.resolve( process.cwd(), this.options.htmlDir );
        }
    }

    templateParametersGenerator ( compilation, assets, assetTags, options ) {

        const _self = this;
        options.inject = _self.options.inject;

        const xhtml = options.xhtml;
        const inject = options.inject;
        const crossOriginLoading = compilation.options.output.crossOriginLoading; // 是否允许资源跨域
        
        const injectIndexKeys = Object.keys(assetTags);
        
        console.log('assets',assets)
        // console.log('assetTags',assetTags)
        // console.log('options',options)

        // 循坏每一个tag进行属性的扩展
        injectIndexKeys.forEach((key) => {
            const tags = assetTags[key];
            const newTags = tags.map((item) => {

                // 扩展属性参数
                item.attributes = !item.attributes ? {} : item.attributes;
                if ( crossOriginLoading ) {
                    item.attributes.crossorigin = crossOriginLoading;
                }

                // 重写assets，将assets转为构建后的html字段
            });
            assetTags[key] = newTags;
        });


        return {
            compilation: compilation,
            webpackConfig: compilation.options,
            htmlWebpackPlugin: {
                tags: assetTags,
                files: assets,
                options: options
            }
        };
    }

    apply ( compiler ) {
        compiler.hooks.compilation.tap( PLUGIN_NAME, ( compilation ) => {
            const hooks = HtmlWebpackPlugin.getHooks( compilation );
            hooks.beforeAssetTagGeneration.tapAsync( PLUGIN_NAME, ( data, cb ) => {
                // data.plugin.options.templateParameters = {
                //     'foo': 'bar'
                // }
                // 重写templateParameters，在最后输出前替换
                data.plugin.options.templateParameters = ( compilation, assets, assetTags, options ) => {
                    return this.templateParametersGenerator( compilation, assets, assetTags, options );
                }
                cb( null, data );
            } );
        } );
    }
}

module.exports = InjectHtmlWebpackPlugin;