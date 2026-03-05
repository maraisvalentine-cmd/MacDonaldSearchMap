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

    const updateMap = async (e, city) => {
        e.preventDefault();
        try {
            setPosition([city.lat, city.lon]);
            await updateRestaurants(e, city.name);
        } catch (e) {
            console.log(e.stack);
        }
    }

    const updateRestaurants = async (e, city) => {
        e.preventDefault();
        try {
            const result = await search({
                params: {
                    format: 'json',
                    city: city,
                    amenity: 'McDonald'
                }
            });
            setRestaurants(result.data);
        } catch (e) {
            console.log(e.stack);
        }
    }

    const selectRestaurant = (e, restaurant) => {
        e.preventDefault();
        setSelectedRestaurant(restaurant);
    }

    const LocateAutomatically = () => {
        const map = useMapEvent({
            click: () => {
                map.locate();
            },
            locationfound: (location) => {
                console.log(location);
                setPosition(location.latlng);
                const bounds = map.getBounds();
                console.log(bounds);
                const viewbox = bounds._northEast.lng+ ',' +bounds._northEast.lat+ ',' +bounds._southWest.lng+ ',' +bounds._southWest.lat
                console.log(viewbox);
                search({
                    params: {
                        format: 'json',
                        viewbox: viewbox,
                        bounded: 1,
                        amenity: 'McDonald'
                    }
                }).then(result =>
                setRestaurants(result.data));
            },
        })
        return null;
    }

    const RecenterAutomaticallyAfterSearch = ({position}) => {
        const map = useMap();
        useEffect(() => {
            map.flyTo(position);
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
                <LocateAutomatically/>
                <RecenterAutomaticallyAfterSearch position={position}/>

                {restaurants.map(restaurant => (
                    <Marker position={[restaurant.lat, restaurant.lon]} key={restaurant.osm_id}>
                        <MarkerPopUp restaurant={restaurant} onSelect={selectRestaurant}
                                     key={restaurant.osm_id}></MarkerPopUp>
                    </Marker>))}
            </MapContainer>

            <div className="absolute top-0 left-16 z-10">
                <SearchComponent updateMap={updateMap}/>
            </div>

            <div className="absolute w-full bottom-0 z-10">
                {selectedRestaurant? <PopIn restaurant={selectedRestaurant}/> : <PopIn restaurant={undefined}/>}
            </div>
        </div>);
}