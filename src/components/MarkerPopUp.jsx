import {Popup} from 'react-leaflet';

export default function MarkerPopUp(props) {
    //ToDo: appel à Nominatim avec la props position
    const onClick = (e) => {}

    return (<Popup>
        // Mettre l'adresse
        <button onClick={onClick}>Choisir</button>
    </Popup>);
}