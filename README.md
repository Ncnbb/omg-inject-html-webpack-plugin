# InjectHtmlWebpackPlugin

一个基于html-webpack-plugin插件扩展的可自定义注入资源路径的插件。

### 依赖
- webpack - 4.x
- html-webpack-plugin - 4.0.0-beta.8

### 基本使用

```javascript
{
    plugins: [
        new HtmlWebpackPlugin( {
            template: `./src/html/page.hbs`,
            filename: './dist/html/page.html',
            xhtml: true
        } ),
        new InjectHtmlWebpackPlugin()
    ]
}
```

默认情况下，使用InjectHtmlWebpackPlugin插件，会默认将HtmlWebpackPlugin的options.inject设置为false，并交由InjectHtmlWebpackPlugin设置模板变量传入。

### 在webpack配置中配置资源跨域

在webpack配置对资源进行跨域配置，最终也可以注入到模板变量的script和link标签中
```json
{
    output: {
        crossOriginLoading: 'anonymous'
    }
}
```

### options
- inject - 默认为false，如果设置为true，那么将不会生成新的模板变量，使用HtmlWebpackPlugin自己的模板变量

### 模板支持
- ejs（默认支持）
- handlebars

### 例子

```javascript
{
    entry： {
        app: './example/inline/src/app.js',
        app2: './example/inline/src/app2.js',
    },

    ...忽略若干配置

    plugins: [
        new HtmlWebpackPlugin( {
            template: `./src/html/page.hbs`,
            filename: './dist/html/page.html',
            xhtml: true,
            chunks: ['app'],
        } ),
        new HtmlWebpackPlugin( {
            template: `./src/html/page2.hbs`,
            filename: './dist/html/page2.html',
            xhtml: true,
            chunks: ['app2'],
        } ),
        new InjectHtmlWebpackPlugin()
    ]
}
```

那么实际上会生成一个这样的对象注入模板，

```json
app模板属性
{ 
    js: [ 
        '<script src="https://imgcdn50.zuzuche.com/static/js/react-runtime-f6f38831f74b9a7f3775.js" crossorigin="anonymous"></script>',
        '<script src="https://imgcdn50.zuzuche.com/static/js/vender~app~app2-b0e019ca74a52cfa7c7f.js" crossorigin="anonymous"></script>',
        '<script src="https://imgcdn50.zuzuche.com/static/js/style~app-6ca9de33c0d05e1f278d.js" crossorigin="anonymous"></script>',
        '<script src="https://imgcdn50.zuzuche.com/static/js/app-ab23bfa0dea17ff99171.js" crossorigin="anonymous"></script>' 
    ],
    css: [ 
        '<link href="https://imgcdn50.zuzuche.com/static/css/style~app-752d171e573587446e3b.css" rel="stylesheet" crossorigin="anonymous"/>' 
    ],
    manifest: undefined,
    favicon: undefined 
}

app2模板属性
{ 
    js: [ 
        '<script src="https://imgcdn50.zuzuche.com/static/js/react-runtime-f6f38831f74b9a7f3775.js" crossorigin="anonymous"></script>',
        '<script src="https://imgcdn50.zuzuche.com/static/js/vender~app~app2-b0e019ca74a52cfa7c7f.js" crossorigin="anonymous"></script>',
        '<script src="https://imgcdn50.zuzuche.com/static/js/style~app2-cd35f66a9ad216025fc5.js" crossorigin="anonymous"></script>',
        '<script src="https://imgcdn50.zuzuche.com/static/js/app2-e3e6d564b273b5f42b43.js" crossorigin="anonymous"></script>'
    ],
    css: [ 
        '<link href="https://imgcdn50.zuzuche.com/static/css/style~app2-f0d566be024b468994ec.css" rel="stylesheet" crossorigin="anonymous"/>'
    ],
    manifest: undefined,
    favicon: undefined 
}
```

在模板中使用变量注入资源

ejs
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Webpack App</title>
    <% assets.css.forEach(function(file){ %>
      <%= file %>
    <% }); %>
  </head>
  <body>
  <div id='root'></div>
  <% assets.js.forEach(function(file){ %>
    <%= file %>
  <% }); %>
  </body>
</html>
```

handlebars
```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Webpack App</title>
  {{#each assets.css}}
    {{{this}}}
  {{/each}}
</head>

<body>
  <div id='root'></div>
  {{#each assets.js}}
    {{{this}}}
  {{/each}}
</body>

</html>
```

### 将资源inline注入
 - webpack配置entry入口特殊处理
 - 建议只对node_modules中的包进行inline
 - inline会直接读取文件内容进行注入，并不会注入经过webpack编译的代码

```javascript
{
    entry： {
        app: './example/inline/src/app.js',
        eaentry: '@eagleeye-jssdk/loader/zuzuche.js?__inline'
    },

    ...忽略若干配置

    plugins: [
        new HtmlWebpackPlugin( {
            template: `./src/html/page.hbs`,
            filename: './dist/html/page.html',
            xhtml: true,
            chunks: ['app'],
        } ),
        new InjectHtmlWebpackPlugin()
    ]
}
```
模板引入

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Webpack App</title>
  {{> './tpl/head.handlebars'}}
  {{{inline.eaentry}}}
  {{#each assets.css}}
    {{{this}}}
  {{/each}}
</head>

<body>
  <div id='root'></div>
  {{#each assets.js}}
    {{{this}}}
  {{/each}}
</body>

</html>
```