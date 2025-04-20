// import React, { useCallback, useRef } from 'react';
// import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

// // const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

// const containerStyle = {
//   width: '100%',
//   height: '400px',
// };

// const center = {
//   lat: -3.2192, // Default latitude
//   lng: 40.1169, // Default longitude
// };

// function MapSelector({ onLocationSelect }) {
//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY, // Replace with your API key
//   });

//   const mapRef = useRef(null);

//   const onLoad = useCallback(function callback(map) {
//     mapRef.current = map;
//   }, []);

//   const onUnmount = useCallback(function callback(map) {
//     mapRef.current = null;
//   }, []);

//   const handleMapClick = (event) => {
//     const lat = event.latLng.lat();
//     const lng = event.latLng.lng();

//     const geocoder = new window.google.maps.Geocoder();
//     const latlng = { lat, lng };

//     geocoder.geocode({ location: latlng }, (results, status) => {
//       if (status === 'OK') {
//         if (results[0]) {
//           const plusCode = results[0].plus_code?.global_code || results[0].plus_code?.compound_code;
//           if (plusCode) {
//             onLocationSelect(plusCode);
//           } else {
//             // Fallback to formatted address if Plus Code is not available
//             onLocationSelect(results[0].formatted_address);
//           }
//         } else {
//           window.alert('No results found');
//         }
//       } else {
//         window.alert('Geocoder failed due to: ' + status);
//       }
//     });
//   };

//   return isLoaded ? (
//     <GoogleMap
//       mapContainerStyle={containerStyle}
//       center={center}
//       zoom={15}
//       onLoad={onLoad}
//       onUnmount={onUnmount}
//       onClick={handleMapClick}
//     >
//       {/* Child components, such as markers, info windows, etc. */}
//     </GoogleMap>
//   ) : (
//     <></>
//   );
// }

// export default React.memo(MapSelector);


import React, { useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

function MapSelector({ onLocationSelect, center }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY, // Replace with your API key
  });

  const mapRef = useRef(null);

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const plusCode = results[0].plus_code?.global_code || results[0].plus_code?.compound_code;
          if (plusCode) {
            onLocationSelect(plusCode);
          } else {
            onLocationSelect(results[0].formatted_address);
          }
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
    >
      {/* Child components, such as markers, info windows, etc. */}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MapSelector);