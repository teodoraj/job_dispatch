import React from 'react';
import GoogleMapReact from 'google-map-react';
import classes from './Map.module.css';

const Map = ({children, ...props}) => {

    return(
        <div className={classes.map_wrapper}>
            <GoogleMapReact
            // FIXME move this somewhere safe
            bootstrapURLKeys={{ key: 'AIzaSyC98XizdkgfmgthJppJIj-5NHSSDoCNYCo' }}
            {...props}
            >
                {children}
            </GoogleMapReact>
        </div>
    )
}
export default Map;

