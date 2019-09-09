import React from 'react';
import moment from 'moment';

export default class Content extends React.Component{
    render() {
        return <div>{moment().format('MMMM Do YYYY, h:mm:ss a')}</div>
    }
}