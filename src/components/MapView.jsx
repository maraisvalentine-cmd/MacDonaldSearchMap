import {MapContainer, Marker, TileLayer, useMap, useMapEvent} from 'react-leaflet'
import SearchComponent from './SearchComponent.jsx';
import {useEffect, useState} from 'react';
import {search} from '../services/nominatimApi.js';
import MarkerPopUp from './MarkerPopUp.jsx';
import PopIn from './PopIn.jsx';

export default function MapView() {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState({});
    const [position, setPosition] = useState([48.8611, 2.3484]);
    const [doSearch, setDoSearch] = useState(false);
    const [doLocate, setDoLocate] = useState(false);

    const updateMap = async (e, city) => {
        e.preventDefault();
        try {
            setPosition([city.lat, city.lon]);
            setDoSearch(true);
        } catch (e) {
            console.log(e.stack);
        }
    }

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
            <div className="absolute top-0 left-16 z-10">
                <SearchComponent updateMap={updateMap}/>
            </div>

            <div className="absolute top-2 right-5 z-10">
                <button
                    className="py-1 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                    onClick={e => {
                        locate(e)
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="size-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                    </svg>
                </button>
            </div>

            <div className="absolute w-full bottom-0 z-10">
                <PopIn restaurant={selectedRestaurant}/>
            </div>
        </div>);
}