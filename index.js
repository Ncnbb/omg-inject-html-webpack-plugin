const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const htmlTags = require( 'html-webpack-plugin/lib/html-tags' );
const { isString, isArray, isObject } = require( './lib/utils/typeof' );
const path = require( 'path' );
const fs = require( 'fs' );

const PLUGIN_NAME = 'omg-inject-html-webpack-plugin';

const cacheContent = {};

class OmgInjectHtmlWebpackPlugin {
    constructor( options ) {
        const defaultOptions = {
            inject: false, // 默认将会关闭html-webpack-plugin的inject
        };
        this.options = Object.assign( defaultOptions, options );
        this.cwd = process.cwd();
        this.inlineFileContent = {};
    }

    createNewAssetsObject ( assets, item, xhtml ) {
        const tagName = item.tagName;
        const extName = tagName == 'link' ? path.extname( item.attributes.href ).replace( '.', '' ) : path.extname( item.attributes.src ).replace( '.', '' );
        const htmlStr = htmlTags.htmlTagObjectToString( item, xhtml );
        if ( !assets[extName] || !isArray( assets[extName] ) ) {
            assets[extName] = [htmlStr];
        } else {
            assets[extName].push( htmlStr )
        }
    }

    createInlineStaticObject ( compilation, cb ) {
        const entrys = compilation.options.entry;
        const regex = /\?__inline/;
        if ( isObject( entrys ) ) {
            const entryKeys = Object.keys( entrys );
            entryKeys.forEach( entry => {

                let target = entrys[entry];
                // build情况下target是字符串，server下是数组
                target = isArray(target) ? target[target.length - 1] : target;

                if ( regex.test( target ) ) {
                    const [file, ext] = target.split( '?' );
                    let filePath = '';
                    if ( file[0] != '/' || file[0] != '.' ) {
                        filePath = path.join( this.cwd, './node_modules', file );
                    } else {
                        filePath = path.join( this.cwd, file );
                    }

                    if ( cacheContent[filePath] ) {
                        this.inlineFileContent[entry] = `<script>${cacheContent[filePath]}</script>`;
                    } else {
                        const exists = fs.existsSync( filePath );
                        if ( exists ) {
                            const content = fs.readFileSync( filePath, 'utf8' );
                            this.inlineFileContent[entry] = `<script>${content}</script>`;
                            cacheContent[filePath] = content;
                        }
                    }
                }
            } )
        }
        return cb();
    }

    templateParametersGenerator ( compilation, assets, assetTags, options ) {
        const _self = this;
        options.inject = _self.options.inject;

        // 如果开启默认inject，那么将不会进行任何操作
        if ( options.inject ) {
            // 官方这样返回，但是先简略处理
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

        const xhtml = options.xhtml;
        const inject = options.inject;
        const crossOriginLoading = compilation.options.output.crossOriginLoading; // 是否允许资源跨域

        const injectIndexKeys = Object.keys( assetTags );
        const newAssets = {
            js: [],
            css: [],
            manifest: assets.manifest,
            favicon: assets.favicon,
        };

        // 循坏每一个tag进行属性的扩展
        injectIndexKeys.forEach( ( key ) => {
            const tags = assetTags[key];
            const newTags = tags.map( ( item ) => {

                // 扩展属性参数
                item.attributes = !item.attributes ? {} : item.attributes;
                if ( crossOriginLoading ) {
                    item.attributes.crossorigin = crossOriginLoading;
                }

                // 不使用默认注入那么将生成script和link标签进行构建并保存到变量中
                !inject && _self.createNewAssetsObject( newAssets, item, xhtml );

            } );

            // 重写assets，将assets转为构建后的html字段
            assetTags[key] = newTags;
        } );
        return {
            assets: newAssets,
            inline: { ...this.inlineFileContent },
            ..._self.options.templateParameters
        }
    }

    apply ( compiler ) {

        // compiler.hooks.beforeRun.tapAsync( PLUGIN_NAME, ( compilation, cb ) => {
        //     // console.log(compilation);
        //     // 获取entry，将inline移除，并保持内容
        //     // 只有入口文件是object形式才可使用
        //     const entrys = compilation.options.entry;
        //     const regex = /\?__inline/;
        //     console.log( entrys )
        //     if ( isObject( entrys ) ) {
        //         const entryKeys = Object.keys( entrys );
        //         entryKeys.forEach( entry => {
        //             if ( regex.test( entrys[entry] ) ) {
        //                 const [file, ext] = entrys[entry].split( '?' );
        //                 let filePath = '';
        //                 if ( file[0] != '/' || file[0] != '.' ) {
        //                     filePath = path.join( this.cwd, './node_modules', file );
        //                 } else {
        //                     filePath = path.join( this.cwd, file );
        //                 }

        //                 const exists = fs.existsSync( filePath );
        //                 if ( exists ) {
        //                     const content = fs.readFileSync( filePath, 'utf8' );
        //                     this.inlineFileContent[entry] = `<script>${content}</script>`;
        //                 }
        //                 delete entrys[entry];

        //             }
        //         } )
        //     }
        //     cb( null, compilation );
        // } );

        compiler.hooks.compilation.tap( PLUGIN_NAME, ( compilation ) => {
            const hooks = HtmlWebpackPlugin.getHooks( compilation );
            // 修改templateParametersGenerator，返回构建好的每个页面所关联的资源注入模板变量
            hooks.beforeAssetTagGeneration.tapAsync( PLUGIN_NAME, ( data, cb ) => {
                // 重写templateParameters，在最后输出前替换
                data.plugin.options.templateParameters = ( compilation, assets, assetTags, options ) => {
                    return this.createInlineStaticObject( compilation, () => {
                        return this.templateParametersGenerator( compilation, assets, assetTags, options )
                    } )
                }

                cb( null, data );
            } );

        } );
    }
}

module.exports = OmgInjectHtmlWebpackPlugin;