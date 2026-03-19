import MarkerPopUp from './MarkerPopUp.jsx';
import {Marker} from 'react-leaflet';
import {useSelector} from 'react-redux';

export default function RestaurantMarkers() {
    const restaurants = useSelector(state => state.restaurantsList.value);

    return (
        <>
            {restaurants.map(restaurant => (
                <Marker position={[restaurant.lat, restaurant.lon]}
                        key={restaurant.osm_id}>
                    <MarkerPopUp restaurant={restaurant}
                                 key={restaurant.osm_id}>
                    </MarkerPopUp>
                </Marker>))}
        </>
    );
}