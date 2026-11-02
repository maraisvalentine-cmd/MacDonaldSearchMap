import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {useSelector} from 'react-redux';

/**
 * Recentre la carte sur la position du store à chaque changement de position.
 */
export default function RecenterAutomaticallyAfterSearch() {
    const position = useSelector(state => state.position.value);
    const map = useMap();

    useEffect(() => {
        map.setView(position, 13);
    }, [map, position]);

    return null;
}
