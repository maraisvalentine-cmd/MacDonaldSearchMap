import {Popup} from 'react-leaflet';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {setSelectedRestaurant} from '../reducers/selectedRestaurantSlice.js';

/**
 * Une popup pour le détail d'un restaurant au clic d'un marker de la carte.
 */
export default function MarkerPopUp({restaurant}) {
    const dispatch = useDispatch();
    const handleClick = useCallback(() =>
        dispatch(setSelectedRestaurant(restaurant)), [dispatch, restaurant]
    )

    return (<Popup>
        <div className="text-l text-center font-bold mb-10 " data-testid="popup-name">{restaurant.display_name}</div>
        <button
            data-testid="popup-choose"
            className="absolute bottom-2 right-2 w-24 rounded-lg font-light text-sm bg-contain bg-yellow-400 hover:bg-yellow-200 hover:border-2"
            onClick={handleClick}>Choisir</button>
    </Popup>);
}