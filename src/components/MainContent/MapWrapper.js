import React, { useState, useEffect } from 'react';
import { GoogleMap, withScriptjs, withGoogleMap, Marker, InfoWindow, GroundOverlay } from 'react-google-maps';
import classes from './MainContent.module.css';
// const { MarkerWithLabel } = require("react-google-maps/lib/components/addons/MarkerWithLabel");

import mapStyle from '../../static/mapStyle'
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

    useEffect(() =>{
        console.log('Fetch jobs');

        fetch('https://run.mocky.io/v3/d27b910a-4fcc-4ff6-ba34-717f9834105d')
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
    // const addTravelTime = (jobs) => {

    //     const distanceMatrix = new window.google.maps.DistanceMatrixService();
    //     const origin = [currentPosition];
    //     const travelMode = window.google.maps.TravelMode.DRIVING;
    //     console.log("direction", origin);

    //     // for each job get the distance
    //         jobs.map( job => {
    //         let jobCoords = [{lat:job.$propertyLocation.coords.latitude, lng: job.$propertyLocation.coords.longitude}];
    //         distanceMatrix.getDistanceMatrix({
    //             origins: origin,
    //             destinations: jobCoords,
    //             travelMode
    //             },
    //             (response, status) => {
    //                 console.log(response);

    //                 if( status === 'OK'){
    //                     if(response && response.rows[0]  && response.rows[0].elements[0].duration){
    //                         job.$travelTime = response.rows[0].elements[0].duration.text
    //                     }

    //                 }
    //                 return job
    //         });
    //         console.log("job", job)
    //     })

    // }
    // useEffect( () => {
    //     console.log("direction");

    //     const directionsService = new window.google.maps.DirectionsService();
    //     const distanceMatrix = new window.google.maps.DistanceMatrixService();
    //     const origin = [currentPosition];
    //     const travelMode = window.google.maps.TravelMode.DRIVING
    //     // const destination = [ {lat: 41.756795, lng: -78.954298} ];

    //     // directionsService.route(
    //     //   {
    //     //     origin: origin,
    //     //     destination: destination,
    //     //     travelMode: window.google.maps.TravelMode.DRIVING
    //     //   },
    //     //   (result, status) => {
    //     //       console.log("directionsService" ,result);

    //     //     if (status === window.google.maps.DirectionsStatus.OK) {
    //     //       setDirection(result)
    //     //     } else {
    //     //       console.error(`error fetching directions ${result}`);
    //     //     }
    //     //   }
    //     // );
    //     console.log("orgin", jobs);

    //     // for each job get the distance
    //     // return () => {
    //     //     jobs.map( job => {
    //     //     let jobCoords = [job.$propertyLocation.coords];
    //     //     distanceMatrix.getDistanceMatrix(
    //     //         {origins: origin,
    //     //         destinations: jobCoords,
    //     //         travelMode
    //     //         },
    //     //         (response, status) => {
    //     //             if( status === 'OK'){
    //     //                 if(response && response.rows[0]  && response.rows[0].elements[0].duration){
    //     //                     console.log("STATUS", status)
    //     //                     console.log("response", response.rows[0].elements[0].duration, response)
    //     //                 }

    //     //             }

    //     //         }
    //     //     )
    //     // })}


    // },[currentPosition, jobs]);


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
                icon = {{ url: '/map_marker.svg', scaledSize: new window.google.maps.Size(35, 35)}}
                />
            ) })
        return jobsList;
    };

    const showCurrentPosition = () => {

        return(
            <React.Fragment>
                <Marker
                position = {currentPosition}
                icon = {{ url: '/location.svg', scaledSize: new window.google.maps.Size(35, 35)}}
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

    if (error) {
        return <div> Error: {error} </div>
    } else if (!isLoaded) {
        return <div> Is loading ....</div>
    } else{
    return (
        <GoogleMap
        defaultZoom={propsMap.zoom}
        defaultCenter={{lat: propsMap.center.lat, lng:propsMap.center.lng}}
        defaultOptions = {{disableDefaultUI: true, styles: mapStyle}}>
            {renderMarkers(jobs)}

            {showCurrentPosition()}
            {selectedJob && showJobInfo(selectedJob) }
            {/* <div> test</div> */}
            {/* <DirectionsRenderer
                directions={direction}
            /> */}

             {/* <GroundOverlay
                defaultUrl='https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png'
                bounds={new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(42.712216, -72.22655),
                    new window.google.maps.LatLng(40.773941, -74.12544)
                )}
                // defaultOpacity={1}
            /> */}
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
}

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