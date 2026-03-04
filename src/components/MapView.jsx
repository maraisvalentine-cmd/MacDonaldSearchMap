import {LayerGroup, LayersControl, MapContainer, Marker, Pane, TileLayer, useMap} from 'react-leaflet'
import SearchComponent from './SearchComponent.jsx';
import {useState} from 'react';
import {search} from '../services/nominatimApi.js';
import MarkerPopUp from './MarkerPopUp.jsx';
import {Geosearch} from 'esri-leaflet-geocoder';
import {DivOverlay} from 'leaflet/dist/leaflet-src.esm.js';


export default function MapView() {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');

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

    return (<div className="static">
        <MapContainer
            center={[48.8611, 2.3484]}
            zoom={13}
            scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

            {restaurants.map(restaurant => (<Marker position={[restaurant.lat, restaurant.lon]} key={restaurant.osm_id}>
                <MarkerPopUp address={restaurant.display_name} key={restaurant.osm_id}></MarkerPopUp>
            </Marker>))}
        </MapContainer>
        <div className="absolute top-0 left-24 z-10">
            <SearchComponent updateRestaurants={updateRestaurants}/>
        </div>
    </div>);
}