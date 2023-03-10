import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addLocation } from "./app/locations.js";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ReactMapGL, {
  GeolocateControl,
  Marker,
  NavigationControl,
  Popup,
  useControl,
} from "react-map-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import MapBoxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useAuthContext } from "./frontendAuth";
import { useNavigate } from "react-router-dom";

const blueMarker = require("./assets/blue-marker.png");
const redMarker = require("./assets/red-marker.png");

const AddLocation = () => {
  const viewport = {
    latitude: 37.783977,
    longitude: -122.358809,
    zoom: 10,
  };
  const [lat, setLat] = useState(37.783977);
  const [lng, setLng] = useState(-122.358809);
  const mapRef = useRef();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [yelpSelectedPlace, setYelpSelectedPlace] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [yelpPopup, setYelpPopUp] = useState(false);
  const [yelpData, setYelpData] = useState([]);
  const [backendData, setBackendData] = useState([]);
  const [locations, setLocations] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useAuthContext();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchYelpData = async () => {
      //get all the yelp bars added to database
      const url = `${process.env.REACT_APP_TRIPS_API_HOST}/bars/`;
      const response = await fetch(url);
      const data = await response.json();
      setBackendData(data);
    };

    fetchYelpData();
  }, []);

  useEffect(() => {
    const search = async () => {
      let url = `${process.env.REACT_APP_TRIPS_API_HOST}/api/bars?term=bar&latitude=${lat}&longitude=${lng}`;
      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        setYelpData(data.businesses);
      } else {
        console.log("response not ok");
      }
    };
    search();
  }, [lat, lng]);

  useEffect(() => {
    if ((lng || lat) && mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
      });
    }
  }, [lng, lat]);

  const mapboxAccessToken = `${process.env.REACT_APP_MAP_TOKEN}`;

  const Geocoder = () => {
    const ctrl = new MapBoxGeocoder({
      accessToken: mapboxAccessToken,
      marker: false,
      collapsed: false,
    });

    useControl(() => ctrl);
    ctrl.on("result", (e) => {
      const coords = e.result.geometry.coordinates;
      setLng(coords[0]);
      setLat(coords[1]);
    });
    return null;
  };

  function setLatLong(e) {
    setLng(e.lngLat.lng);
    setLat(e.lngLat.lat);
  }

  function getLocation(e) {
    setLng(e.coords.longitude);
    setLat(e.coords.latitude);
  }

  useEffect(() => {}, [locations]);

  const handleAddLocation = async () => {
    const location = selectedPlace ? selectedPlace : yelpSelectedPlace;
    if (!location["bar_id"]) {
      const yelp_id = location.id;
      const data = {
        yelp_id: "string",
        bar_name: "string",
        url: "string",
        lat: 0,
        long: 0,
        image_url: "string",
      };
      const fetchConfig = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const barResponse = await fetch(
        `${process.env.REACT_APP_TRIPS_API_HOST}/bars/add/${yelp_id}`,
        fetchConfig
      );
      if (barResponse.ok) {
        const newBar = await barResponse.json();
        locations.push(newBar.bar_id);
        return true;
      }
    }
    location.bar_id && locations.push(location.bar_id);
  };

  return (
    <Box
      sx={{
        height: 700,
        width: 1000,
        position: "relative",
      }}
    >
      <ReactMapGL
        ref={mapRef}
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={viewport}
        mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      >
        <Marker
          latitude={lat}
          longitude={lng}
          draggable
          onDragEnd={setLatLong}
        />
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="top-left"
          trackUserLocation
          onGeolocate={getLocation}
        />
        {backendData?.map((places) => (
          <>
            <Marker
              key={places.id}
              latitude={places.lat}
              longitude={places.long}
            >
              <button
                className="marker-btn"
                onClick={(e) => {
                  setSelectedPlace(places);
                  //have to set Popup is true
                  setShowPopup(true);
                  setYelpPopUp(false);
                }}
              >
                <img src={redMarker} alt="hello" />
              </button>
            </Marker>
          </>
        ))}
        {yelpData?.map((places) => (
          <>
            <Marker
              key={places.id}
              latitude={places.coordinates.latitude}
              longitude={places.coordinates.longitude}
            >
              <button
                className="marker-btn"
                onClick={(e) => {
                  setYelpSelectedPlace(places);
                  setSelectedPlace(null);
                  //have to set Popup is true
                  setYelpPopUp(true);
                  setShowPopup(false);
                }}
              >
                <img src={blueMarker} alt="hello" />
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
            <button onClick={handleAddLocation}>+ add location</button>
            <a
              href={selectedPlace.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                className="pop-up-image"
                src={selectedPlace.image_url}
                alt="bar"
              ></img>
            </a>
          </Popup>
        )}
        {yelpPopup && (
          <Popup
            key={yelpSelectedPlace.id}
            latitude={yelpSelectedPlace.coordinates.latitude}
            longitude={yelpSelectedPlace.coordinates.longitude}
            closeOnClick={false}
            maxWidth="300px"
            onClose={() => setYelpPopUp(false)}
          >
            <h2>{yelpSelectedPlace.name}</h2>
            <h3>link</h3>
            <a
              href={yelpSelectedPlace.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                className="pop-up-image"
                src={yelpSelectedPlace.image_url}
                alt="bar"
              ></img>
            </a>
            <button onClick={handleAddLocation}>+ add location</button>
          </Popup>
        )}

        <Geocoder />
      </ReactMapGL>
      <div>
        <button onClick={(e) => setLocations([])}>clear locations</button>
        <Typography align="center">
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2, mw: 4, pl: 8.5, pr: 8.5 }}
            onClick={() => {
              dispatch(addLocation(locations));
            }}
          >
            Finished Adding Locations
          </Button>
        </Typography>
      </div>
    </Box>
  );
};

export default AddLocation;
