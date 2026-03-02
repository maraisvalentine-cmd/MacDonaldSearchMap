import {MapContainer, Marker, TileLayer, useMap} from 'react-leaflet'
import SearchComponent from './SearchComponent.jsx';
import {useState} from 'react';
import {search} from '../services/nominatimApi.js';


export default function MapView() {
    const [restaurants, setRestaurants] = useState([]);

    const updateRestaurants = async (city) => {
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

    return (<div className="mx-auto content-center">
        <SearchComponent onUpdate={updateRestaurants}></SearchComponent>
        <MapContainer
            center={[48.8611, 2.3484]}
            zoom={13}
            scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {restaurants.map(restaurant => (<Marker position={[restaurant.lat, restaurant.lon]} key={restaurant.osm_id} />))}
        </MapContainer></div>);
}