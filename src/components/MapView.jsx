import {MapContainer, TileLayer, useMap} from 'react-leaflet'
import RestaurantMarkers from './RestaurantMarkers.jsx';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {resetLocate} from '../reducers/locateSlice.js';
import {doSearch, resetSearch} from '../reducers/searchingSlice.js';
import {setPosition} from '../reducers/positionSlice.js';
import {setRestaurantsList} from '../reducers/restaurantsListSlice.js';
import {useMutation} from '@tanstack/react-query';
import {searchRestaurants} from '../useApi.js';

export default function MapView() {
    const mapSearch = useSelector(state => state.mapSearch.value);
    const mapLocate = useSelector(state => state.mapLocate.value);
    const position = useSelector(state => state.position.value);
    const dispatch = useDispatch();

    const mutateRestaurantsList = useMutation({
        mutationFn: (viewbox) => searchRestaurants(viewbox),
        onSuccess: data => dispatch(setRestaurantsList(data)),
        onError: error => console.log(error)
    });

    const LocateAndSearch = () => {
        if (mapLocate) {
            const map = useMap();
            useEffect(() => {
                map.locate().on('locationfound', (pos) => {
                    dispatch(setPosition([pos.latlng.lat, pos.latlng.lng]));
                    dispatch(resetLocate());
                    dispatch(doSearch());
                });
            }, [mapLocate]);
        }
        return null;
    }

    const SearchRestaurants = () => {
        const map = useMap();
        if (mapSearch) {
            useEffect(() => {
                const bounds = map.getBounds();
                const viewbox = (bounds._northEast.lng + ',' + bounds._northEast.lat + ',' + bounds._southWest.lng + ',' + bounds._southWest.lat)
                mutateRestaurantsList.mutate(viewbox);
                dispatch(resetSearch());
            }, [mapSearch, position]);
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
        <div data-testid="map">
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

                <RestaurantMarkers/>
            </MapContainer>
        </div>
    );
}