import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Content from './components/Content';
import './index.scss';

class Bork {
    //Property initializer syntax
    instanceProperty = "bork";
    boundFunction = () => {
        return this.instanceProperty;
    };

    //Static class properties
    static staticProperty = "babelIsCool";
    static staticFunction = function () {
        return Bork.staticProperty;
    };
}

let myBork = new Bork;

//Property initializers are not on the prototype.
console.log( myBork.__proto__.boundFunction ); // > undefined

//Bound functions are bound to the class instance.
console.log( myBork.boundFunction.call( undefined ) ); // > "bork"

//Static function exists on the class.
console.log( Bork.staticFunction() ); // > "babelIsCool"

class App extends React.Component {
    componentDidMount () {
        Object.assign( {}, {} )
        const arr = new Set();
        const { a, b, c } = { a: 1, b: 2, c: 3 };
        const { ...x } = { a: 1, b: 2, c: 3 };
        console.log( a )
        console.log( b )
        console.log( c )
        console.log( x )
    }

    render () {
        return (
            <div>
                <Content />
                <h1>{moment().format('MMMM Do YYYY, h:mm:ss a')}</h1>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById( 'root' )
);