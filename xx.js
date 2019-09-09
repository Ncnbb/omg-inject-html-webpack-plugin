function( data ) {
    var __t, __p = '', __j = Array.prototype.join;
    function print () { __p += __j.call( arguments, '' ) }
    __p += '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8">\n    <title>Webpack App</title>\n    ';
    htmlWebpackPlugin.files.css.forEach( function ( file ) {
        ;
        __p += '\n      ' +
            ( ( __t = ( file ) ) == null ? '' : __t ) +
            '\n    ';
    } );;
    __p += '\n  </head>\n  <body>\n  <div id=\'root\'></div>\n  ';
    htmlWebpackPlugin.files.js.forEach( function ( file ) {
        ;
        __p += '\n    ' +
            ( ( __t = ( file ) ) == null ? '' : __t ) +
            '\n  ';
    } );;
    __p += '\n  </body>\n</html>';
    return __p
}