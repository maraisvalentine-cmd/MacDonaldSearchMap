import {MapContainer, Marker, TileLayer, useMap, useMapEvent} from 'react-leaflet'
import SearchComponent from './SearchComponent.jsx';
import {useCallback, useEffect, useState} from 'react';
import {search} from '../services/nominatimApi.js';
import MarkerPopUp from './MarkerPopUp.jsx';
import SelectionDetails from './SelectionDetails.jsx';
import geolocateLogo from '../assets/geolocate.svg';

export default function MapView() {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState({});
    const [position, setPosition] = useState([48.8611, 2.3484]);

    const [doSearch, setDoSearch] = useState(false);
    const [doLocate, setDoLocate] = useState(false);

    const updateMap = useCallback((city) => {
        try {
            setPosition([city.lat, city.lon]);
            setDoSearch(true);
        } catch (e) {
            console.log(e.stack);
        }
    }, []);

    const selectRestaurant = (e, restaurant) => {
        e.preventDefault();
        setSelectedRestaurant(restaurant);
    }

    const locate = (e) => {
        e.preventDefault();
        setDoLocate(true);
    }

    const LocateAndSearch = () => {
        if (doLocate) {
            const map = useMap();
            useEffect(() => {
                map.locate().on('locationfound', function (pos) {
                    setPosition(pos.latlng);
                    setDoLocate(false);
                    setDoSearch(true);
                });
            }, [doLocate]);
        }
        return null;
    }

    const SearchRestaurants = () => {
        if (doSearch) {
            const map = useMap();
            useEffect(() => {
                const bounds = map.getBounds();
                const viewbox = bounds._northEast.lng + ',' + bounds._northEast.lat + ',' + bounds._southWest.lng + ',' + bounds._southWest.lat
                search({
                    viewbox: viewbox,
                    bounded: 1,
                    amenity: 'McDonald',
                    limit: '20',
                }).then(result => setRestaurants(result.data));
                setDoSearch(false);
            }, [doSearch]);
        }
    }

    const RecenterAutomaticallyAfterSearch = () => {
        const map = useMap();
        useEffect(() => {
            map.setView(position, 13);
        }, [position]);
        return null;
    }

    return (
        <div className="static">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <LocateAndSearch/>
                <SearchRestaurants/>
                <RecenterAutomaticallyAfterSearch/>

                {restaurants.map(restaurant => (
                    <Marker position={[restaurant.lat, restaurant.lon]} key={restaurant.osm_id}>
                        <MarkerPopUp restaurant={restaurant}
                                     onSelect={selectRestaurant}
                                     key={restaurant.osm_id}>
                        </MarkerPopUp>
                    </Marker>))}
            </MapContainer>
            <div className="w-full">
                <div className="absolute top-0 left-12 z-10 md:left-16 w-4/6">
                    <SearchComponent updateMap={updateMap}/>
                </div>

                <div className="absolute top-4 right-5 z-10">
                    <button
                        className="py-1 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                        onClick={e => {
                            locate(e)
                        }}>

                        <img src={geolocateLogo} className="h-8 w-8" alt="Géolocaliser"/>
                    </button>
                </div>
            </div>
            <div className="absolute w-full bottom-0 z-10">
                <SelectionDetails restaurant={selectedRestaurant}/>
            </div>
        </div>);
}