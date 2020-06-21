import React from 'react';

import Map from '../Map/Map';
import Marker from '../Marker/Marker';


const mapProps = {
    center: {
        lat: 42.95,
        lng: -71.33
      },
    zoom: 11
};

// Return map bounds based on list of jobs
const getMapBounds = (map, maps, jobs) => {
    const bounds = new maps.LatLngBounds();

    jobs.forEach((job) => {
    bounds.extend(new maps.LatLng(
        job.$propertyLocation.coords.lat,
        job.$propertyLocation.coords.lng,
    ));
    });
    return bounds;
};

// Re-center map when resizing the window
const bindResizeListener = (map, maps, bounds) => {
    maps.event.addDomListenerOnce(map, 'idle', () => {
    maps.event.addDomListener(window, 'resize', () => {
        map.fitBounds(bounds);
    });
    });
};

// Fit map to its bounds after the api is loaded
const apiIsLoaded = (map, maps, jobs) => {
    // Get bounds by our jobs
    const bounds = getMapBounds(map, maps, jobs);
    // Fit map to bounds
    map.fitBounds(bounds);
    // Bind the resize listener
    bindResizeListener(map, maps, bounds);
};


// const handleApiLoaded = (map, maps, places) => {
//     const markers = [];
//     const infowindows = [];

//     places.forEach((place) => {
//       markers.push(new maps.Marker({
//         position: {
//           lat: place.$propertyLocation.coords.lat + 2,
//           lng: place.$propertyLocation.coords.lng +4 ,
//         },
//         map,
//       }));

//       infowindows.push(new maps.InfoWindow({
//         content: getInfoWindowString(place),
//       }));
//     });

//     markers.forEach((marker, i) => {
//       marker.addListener('click', () => {
//         infowindows[i].open(map, marker);
//       });
//     });
//   };
//   const getInfoWindowString = place => `
//   <div>
//     <div style="font-size: 16px;">
//       ${place.$trade}
//     </div>
//     <div style="font-size: 14px;">
//       <span style="color: grey;">
//       ${place.rating}
//       </span>
//       <span style="color: orange;">${String.fromCharCode(9733).repeat(Math.floor(place.rating))}</span><span style="color: lightgrey;">${String.fromCharCode(9733).repeat(5 - Math.floor(place.rating))}</span>
//     </div>

//   </div>`;


export default class Main extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            jobs: []
        }
    }




    componentDidMount(){
        fetch('https://run.mocky.io/v3/d27b910a-4fcc-4ff6-ba34-717f9834105d')
        .then( response => response.json())
        .then( data => {
            console.log("data", data);

            return this.setState({jobs: data});
            });
    }


    render(){
        return(
            <Map
            defaultCenter={mapProps.center}
            defaultZoom={mapProps.zoom}
            yesIWantToUseGoogleMapApiInternals = {true}
            onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps, this.state.jobs)}
            >

                {this.state.jobs.map(job => (
                    <Marker
                    key={job.$id}
                    text={job.$trade}
                    lat={job.$propertyLocation.coords.latitude}
                    lng={job.$propertyLocation.coords.longitude}
                    />
                ))}
            </Map>
        )
    }

}

// import React, { Component, createRef } from 'react';

// export default class MainContent extends React.Component {

//     constructor(props){

//         super(props);

//         this.createGoogleMap = this.createGoogleMap.bind(this);
//         this.createMarker = this.createMarker.bind(this);
//     }

//     googleMapRef = React.createRef()

//     componentDidMount() {
//       const googleMapScript = document.createElement('script')
//       googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${'AIzaSyC98XizdkgfmgthJppJIj-5NHSSDoCNYCo'}&libraries=places`
//       window.document.body.appendChild(googleMapScript)

//       googleMapScript.addEventListener('load', {
//         googleMap : this.createGoogleMap(),
//         marker : this.createMarker()
//       })
//     }

//     createGoogleMap = () =>
//       new window.google.maps.Map(this.googleMapRef.current, {
//         zoom: 16,
//         center: {
//           lat: 43.642567,
//           lng: -79.387054,
//         },
//         disableDefaultUI: true,
//       })

//     createMarker = () =>
//       new window.google.maps.Marker({
//         position: { lat: 43.642567, lng: -79.387054 },
//         map: this.googleMap,
//       })

//     render() {
//       return (
//         <div
//           id="google-map"
//           ref={this.googleMapRef}
//           style={{ width: '400px', height: '300px' }}
//         />
//       )
//     }
//   }

