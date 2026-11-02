import {MapContainer, TileLayer} from 'react-leaflet'
import RestaurantMarkers from './RestaurantMarkers.jsx';
import LocateAndSearch from './LocateAndSearch.jsx';
import SearchRestaurants from './SearchRestaurants.jsx';
import RecenterAutomaticallyAfterSearch from './RecenterAutomaticallyAfterSearch.jsx';
import {useSelector} from 'react-redux';

export default function MapView() {
    const position = useSelector(state => state.position.value);

    return (
        <div data-testid="map">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                {/* Le recentrage passe avant la recherche : la zone interrogée est celle de la carte recentrée. */}
                <RecenterAutomaticallyAfterSearch/>
                <LocateAndSearch/>
                <SearchRestaurants/>

                <RestaurantMarkers/>
            </MapContainer>
        </div>
    );
}
