import {Popup} from 'react-leaflet';

export default function MarkerPopUp({restaurant, onSelect}) {
    return (<Popup>
        <div className="text-l text-center font-bold mb-10 ">{restaurant.display_name}</div>
        <button
            className="absolute bottom-2 right-2 w-24 rounded-lg font-light text-sm bg-contain bg-yellow-400 hover:bg-yellow-200 hover:border-2"
            onClick={e => onSelect(e, restaurant)}> Choisir
        </button>
    </Popup>);
}