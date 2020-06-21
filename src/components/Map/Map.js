import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import classes from './Map.module.css';
import mapStyle from '../../static/mapStyle';
import job_marker from '../../static/icons/map_marker.svg';
import current_location_marker from '../../static/icons/current_location.svg';
import loading_icon from '../../static/icons/loading.svg';

export default function Map (){
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
    const [showForm, setShowForm] = useState(false)

    // Use geolocation to get users current location
    useEffect( () => {
        if (navigator && navigator.geolocation){

            navigator.geolocation.getCurrentPosition( location => {
                let geolocation = {
                  lat: location.coords.latitude,
                  lng: location.coords.longitude
                };

                // update state
                setIsGeolocationEnabled(true);
                setCurrentPosition(geolocation);


                return currentPosition, propsMap
              },
                err => {
                    console.log('No current location', err);
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
        .then( results => {
            // get the distance to each job
            // update state
            setJobs(results);
            setIsLoaded(true)
            },
            error => {
                // update state
                setIsLoaded(true);
                setError(error);
            }
        );
    },[] );

    // add
    useEffect( () => {
        function addTravelTime (jobs) {
            console.log("add travel time");

            const distanceMatrix = new window.google.maps.DistanceMatrixService();
            const origin = [currentPosition || propsMap.center];
            const travelMode = window.google.maps.TravelMode.DRIVING;
            // for each job get the distance
                jobs.map( job => {
                let jobCoords = [{lat:job.$propertyLocation.coords.latitude, lng: job.$propertyLocation.coords.longitude}];
                distanceMatrix.getDistanceMatrix({
                    origins: origin,
                    destinations: jobCoords,
                    travelMode
                    },
                    (response, status) => {
                        if( status === 'OK'){
                            if(response && response.rows[0]  && response.rows[0].elements[0].duration){
                                job.$travelTime = response.rows[0].elements[0].duration.text
                            }
                        }
                        return job
                });
            })

        }
        if(jobs)  addTravelTime(jobs);
    }, [currentPosition, jobs])


    const renderJobMarker = (jobs) => {
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
                defaultAnimation={ window.google.maps.Animation.BOUNCE}
                />
            ) })
        return jobsList;
    };

    const showCurrentPosition = () => {

        return(
            <>
                <Marker
                position = {currentPosition}
                icon = {{ url: current_location_marker, scaledSize: new window.google.maps.Size(35, 35)}}
                />
                {!isGeolocationEnabled &&
                <InfoWindow position={propsMap.center} >
                    <div className={classes.map_geolocation_info}>
                    <h4>Geolocation disabled!</h4>
                    <p>Please enable your current location </p>
                    <em>We are going to use default location</em>
                    </div>
                </InfoWindow>}
            </>
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
                <div className={classes.map_marker_info}>
                    <h4>{info.title}</h4>

                    {info.travelTime && <p>{info.travelTime}</p> }
                    <p>{info.claim}</p>
                    <em>{info.address}</em>

                    <button onClick={() => setShowForm(true)}>Accept</button>
                </div>
            </InfoWindow>
        )
    }


    const updateJobState = () => {

    }
    const showOverlay = () => {
        return(
        <>
            <div className={classes.map_overlay}></div>
            <div className={classes.map_overlay_text}>
                {error && <p>Sorry, we can not provide the available jobs at the moment.<br /> Please try again later.</p>}
                {!isLoaded &&
                    <>
                        <p>Loading available jobs</p>
                        <img src={loading_icon} alt="loading"/>
                    </>
                }

                {showForm &&
                    <div className={classes.map_accept_job_modal}>
                        <form>
                            <input type="text" defaultValue="I am on my way" />
                            <button onClick={() => updateJobState}>Send</button>
                            <button onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    </div>
                }
            </div>
          </>
        )
    }

    return (
        <GoogleMap
        defaultZoom={propsMap.zoom}
        defaultCenter={propsMap.center}
        center = {currentPosition}
        defaultOptions = {{disableDefaultUI: true, styles: mapStyle}}>
            {(!isLoaded ||  error || showForm ) && showOverlay()}

            {jobs &&  renderJobMarker(jobs)}

            {isLoaded && showCurrentPosition()}
            {selectedJob && showJobInfo(selectedJob) }

        </GoogleMap>
        )
    }