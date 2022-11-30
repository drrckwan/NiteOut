import React, { useState, useEffect } from "react";
import MapGL, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function YelpMap() {
  const viewport = {
    latitude: 37.774929,
    longitude: -122.419418,
    zoom: 14,
  };

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [yelpData, setYelpData] = useState([]);
  const [location, setLocation] = useState({})
  // const [locations, setLocations] = useState([]);
  let locations = []


  // useEffect(() => {
  //   const createBar = async () => {
  //     const url = "http//localhost:8001/bars/new";
  //     const response = await fetch(url);
  //     const data = await response.json();
  //     setLocations(data)
  //   }
  //   createBar();
  // }, []);
  // console.log("locations", locations)

  useEffect(() => {
    const fetchYelpData = async () => {
      //get all the yelp bars added to database
      const url = "http://localhost:8001/bars/";
      const response = await fetch(url);
      const data = await response.json();
      setYelpData(data);
    };

    fetchYelpData();
  }, []);
  console.log("yelp data", yelpData);

  useEffect(() => {
    console.log("location", location);
    // console.log("locations::::::::::", locations);
    // console.log("selected place", setLocation(selectedPlace));
  });

  // const addLocationClicked = (event) => {
  //   setClicked(true)
  // }



  const handleAddLocation = async () => {
    setLocation(selectedPlace)
    if (!(location["bar_id"])) {
      const data = {}
      const barUrl = "http://localhost:8001/bars/new"
      const fetchConfig = {
        method: "post",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const response = await fetch(barUrl, fetchConfig);
      if (response.ok) {
        const newBar = await response.json();
        console.log("new bar", newBar)
        return newBar.bar_id
      }
    }
    location.bar_id && locations.push(location.bar_id)
  }

  return (
    <div>
      <MapGL
        initialViewState={viewport}
        style={{ width: "100vw", height: "90vh" }}
        mapStyle="mapbox://styles/mitchhh35/cl9yq5lbl000115o6la7ih9qr"
        mapboxAccessToken="pk.eyJ1IjoiZHJyY2t3YW4iLCJhIjoiY2xhYTlsMnR2MDV3MzNybnQzbGo1dWloaSJ9.GAh-bzyBqqjNEYeIDfT94g"
      >
        {yelpData?.map((places) => (
          <>
            <Marker
              key={places.id}
              latitude={places.lat}
              longitude={places.long}
            >
              <button
                className="marker-btn"
                onClick={(e) => {
                  // e.preventDefault();
                  setSelectedPlace(places);
                  //have to set Popup is true
                  setShowPopup(true);
                }}
              >
                <img
                  src="https://img.icons8.com/color/344/where.png"
                  alt="hello"
                />
              </button>
            </Marker>
          </>
        ))}

        {showPopup && (
          <Popup
            key={selectedPlace.id}
            latitude={selectedPlace.lat}
            longitude={selectedPlace.long}
            closeOnClick={false}
            maxWidth="300px"
            onClose={() => setShowPopup(false)}
          >
            <h2>{selectedPlace.bar_name}</h2>
            <h3>Price</h3>
            <button onClick={handleAddLocation}>+</button>
            <p>{selectedPlace.price}</p>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
export default YelpMap;

// { () => setLocation(selectedPlace) }
