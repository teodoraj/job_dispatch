import React, { useState, useEffect } from 'react';
import { GoogleMap, withScriptjs, withGoogleMap, Marker, InfoWindow, OverlayView } from 'react-google-maps';
import classes from './MapWrapper.module.css';
import mapStyle from '../../static/mapStyle';
import job_marker from '../../static/map_marker.svg';
import current_location_marker from '../../static/current_location.svg';

function Map (){
    const [jobs, setJobs] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [propsMap, setPropsMap] = useState({
        zoom: 8,
        center:{
            lat: 42 ,
            lng: -72
        }
    });
    const [currentPosition, setCurrentPosition] =  useState(null);
    const [isGeolocationEnabled, setIsGeolocationEnabled] = useState(false)
    const [showModal, setShowModal] = useState(false)

    // Use geolocation to get users current location
    useEffect( () => {
        console.log(' get geolocation');

        if (navigator && navigator.geolocation){

            navigator.geolocation.getCurrentPosition( location => {
                let geolocation = {
                  lat: location.coords.latitude,
                  lng: location.coords.longitude
                };

                // update state
                setIsGeolocationEnabled(true);
                setCurrentPosition(geolocation);
                setPropsMap(prevState => {
                    return {...prevState, center : geolocation}
                });
                // return currentPosition, propsMap
              },
                err => {
                    console.log('no current location', err);
                    setIsGeolocationEnabled(false);
                    setCurrentPosition(propsMap.center);
                }
              );
            } else {

              // Browser doesn't support Geolocation
              console.log('No browser support for current location');
              setCurrentPosition(propsMap.center);
            }
    }, []);


    // Fetch data from API provided
    useEffect(() =>{
        console.log('Fetch jobs');
        const url = 'https://run.mocky.io/v3/d27b910a-4fcc-4ff6-ba34-717f9834105d';
        fetch(url)
        .then( response => response.json())
        .then( (results) => {
            // get the distance to each job
            // addTravelTime(results);
            // update state
            setJobs(results);
            setIsLoaded(true)
            },
            err => {
                // update state
                setIsLoaded(true);
                setError(err);

            }
        );
    },[] );

    useEffect( () => {
        function addTravelTime (jobs) {

            const distanceMatrix = new window.google.maps.DistanceMatrixService();
            const origin = [currentPosition];
            const travelMode = window.google.maps.TravelMode.DRIVING;
            console.log("direction", origin);

            // for each job get the distance
                jobs.map( job => {
                let jobCoords = [{lat:job.$propertyLocation.coords.latitude, lng: job.$propertyLocation.coords.longitude}];
                distanceMatrix.getDistanceMatrix({
                    origins: origin,
                    destinations: jobCoords,
                    travelMode
                    },
                    (response, status) => {
                        console.log(response);

                        if( status === 'OK'){
                            if(response && response.rows[0]  && response.rows[0].elements[0].duration){
                                job.$travelTime = response.rows[0].elements[0].duration.text
                            }

                        }
                        return job
                });
                console.log("job", job)
            })

        }
        if(jobs)  addTravelTime(jobs);

    }, [currentPosition])


    const renderMarkers = (jobs) => {
        let jobsList = [];

        jobs.map( job => {
            let coords ={
                lat: job.$propertyLocation.coords.latitude,
                lng: job.$propertyLocation.coords.longitude
            }

            return jobsList.push(
                <Marker
                key={job.$id}
                text={job.$trade}
                position = {{ lat: coords.lat, lng: coords.lng }}
                onClick = {() => setSelectedJob (job)}
                icon = {{ url: job_marker, scaledSize: new window.google.maps.Size(35, 35)}}
                />
            ) })
        return jobsList;
    };

    const showCurrentPosition = () => {

        return(
            <React.Fragment>
                <Marker
                position = {currentPosition}
                icon = {{ url: current_location_marker, scaledSize: new window.google.maps.Size(35, 35)}}
                />
                {!isGeolocationEnabled &&
                <InfoWindow position={propsMap.center} >
                    <div>
                    <h4>Geolocation disabled!</h4>
                    <p>Please enable your current location </p>
                    <em>We are going to use default location</em>
                    </div>
                </InfoWindow>}
            </React.Fragment>
        )
    }

    const showJobInfo = (job) => {
        let coords = {
            lat: job.$propertyLocation.coords.latitude,
            lng: job.$propertyLocation.coords.longitude
        }

        let addressFields = [job.$propertyLocation.addressLine1, job.$propertyLocation.addressLine2, job.$propertyLocation.city, job.$propertyLocation.state]
        let info = {
            title: job.$skill,
            claim: job.$claims.map(claim => claim.claimType).join(),
            address: addressFields.join(),
            travelTime : job.$travelTime
        }
        return (
            <InfoWindow position={{lat: coords.lat, lng: coords.lng}} onCloseClick={() => setSelectedJob(null)}>
                <div>
                    <h4>{info.title}</h4>
                    <p>{info.claim}</p>
                    <em>{info.address}</em>
                    <p>{info.travelTime}</p>

                    <button onClick={() => setShowModal(true)}>Accept</button>
                </div>
            </InfoWindow>
        )
    }


    const getPixelPositionOffset = (width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
      })

    const showOverlayView = () => {

        return(
        //     <OverlayView
        //     position={propsMap.center}
        //     mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        //     /*
        //      * 2. Tweak the OverlayView's pixel position. In this case, we're
        //      *    centering the content.
        //      */
        //     getPixelPositionOffset={getPixelPositionOffset}
        //     /*
        //      * 3. Create OverlayView content using standard React components.
        //      */
        //   >
        //     <div className={classes.map_overlay}>
        //       <h1></h1>

        //     </div>
        //   </OverlayView>
        <>
            <div className={classes.map_overlay}></div>
            <div className={classes.map_overlay_text}>
            <h1>MESSAGE</h1>
            </div>
          </>
        )
    }
    // if (error) {
    //     return <div> Error: {error} </div>
    // } else if (!isLoaded) {
    //     return <div> Is loading ....</div>
    // } else{
    return (
        <GoogleMap
        defaultZoom={propsMap.zoom}
        defaultCenter={{lat: propsMap.center.lat, lng:propsMap.center.lng}}
        defaultOptions = {{disableDefaultUI: true, styles: mapStyle}}>
            {(!isLoaded ||  error) && showOverlayView()}

            {isLoaded  && renderMarkers(jobs)}

            {isLoaded && showCurrentPosition()}
            {selectedJob && showJobInfo(selectedJob) }

            { showModal &&
                <div className={classes.accept_job_modal}>
                    <form>
                        <input type="text" defaultValue="I am on my way" />
                        <input type="submit" value="Send" />
                    </form>
                </div>
            }





        </GoogleMap>
        )
    }
// }

// withScriptjs embeds all the sripts necessary for the map
const GoogleMapWrapper = withScriptjs(withGoogleMap(Map));

const Wrapper = () =>{
    console.log("RENDER");
    // FIXME add the loading/ err here
    return (
        <div className={classes.map_wrapper}>
            <GoogleMapWrapper
            googleMapURL= {`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_MAP_KEY}`}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            />

        </div>
    )
}
export default Wrapper;