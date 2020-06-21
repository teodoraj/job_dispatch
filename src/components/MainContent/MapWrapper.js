import React from 'react';
import { withScriptjs, withGoogleMap} from 'react-google-maps';
import classes from './MapWrapper.module.css';
import Map from '../Map/Map';

// withScriptjs embeds all the sripts necessary for the map
const GoogleMapWrapper = withScriptjs(withGoogleMap(Map));

const Wrapper = () => {
    return (
        <div className={classes.map_wrapper}>
            <GoogleMapWrapper
            googleMapURL= {`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_MAP_KEY}`}
            loadingElement={<div className={classes.wrapper_loading} />}
            containerElement={<div className={classes.wrapper_container} />}
            mapElement={<div className={classes.wrapper_map_element}/>}
            />

        </div>
    )
}
export default Wrapper;