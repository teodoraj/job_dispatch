import React from 'react';
import classes from './Marker.module.css';


const Marker = (props) => {
    return(
    <div className={classes.marker} onClick={props.onClick}>{props.text}</div>
    )
}

export default Marker