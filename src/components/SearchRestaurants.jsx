import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation} from '@tanstack/react-query';
import {resetSearch} from '../reducers/searchingSlice.js';
import {setRestaurantsList} from '../reducers/restaurantsListSlice.js';
import {searchRestaurants} from '../useApi.js';

/**
 * Recherche les restaurants dans la zone visible de la carte quand une recherche est demandée.
 */
export default function SearchRestaurants() {
    const mapSearch = useSelector(state => state.mapSearch.value);
    const dispatch = useDispatch();
    const map = useMap();

    const {mutate} = useMutation({
        mutationFn: (viewbox) => searchRestaurants(viewbox),
        onSuccess: data => dispatch(setRestaurantsList(data)),
        onError: error => console.log(error)
    });

    useEffect(() => {
        if (!mapSearch) {
            return;
        }
        const bounds = map.getBounds();
        const viewbox = [bounds.getEast(), bounds.getNorth(), bounds.getWest(), bounds.getSouth()].join(',');
        mutate(viewbox);
        dispatch(resetSearch());
    }, [dispatch, map, mapSearch, mutate]);

    return null;
}
