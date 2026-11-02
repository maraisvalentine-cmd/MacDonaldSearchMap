import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {useDispatch, useSelector} from 'react-redux';
import {resetLocate} from '../reducers/locateSlice.js';
import {doSearch} from '../reducers/searchingSlice.js';
import {setPosition} from '../reducers/positionSlice.js';

/**
 * Géolocalise l'utilisateur quand la géolocalisation est demandée, puis lance la recherche de restaurants autour de lui.
 */
export default function LocateAndSearch() {
    const mapLocate = useSelector(state => state.mapLocate.value);
    const dispatch = useDispatch();
    const map = useMap();

    useEffect(() => {
        if (!mapLocate) {
            return;
        }
        const onLocationFound = (pos) => {
            dispatch(setPosition([pos.latlng.lat, pos.latlng.lng]));
            dispatch(resetLocate());
            dispatch(doSearch());
        };
        map.locate().on('locationfound', onLocationFound);
        return () => {
            map.off('locationfound', onLocationFound);
        };
    }, [dispatch, map, mapLocate]);

    return null;
}
