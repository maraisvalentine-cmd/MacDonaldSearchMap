import {Popup} from 'react-leaflet';

export default function MarkerPopUp({address}) {
    const onClick = (e) => {
    }

    return (<Popup>
        <div className="text-l text-center font-bold mb-10 ">{address}
        </div>
        <button className="absolute bottom-2 right-2 w-24 rounded-lg font-light text-sm bg-contain bg-yellow-400 hover:bg-yellow-200 hover:border-2"
                onClick={onClick}> Choisir </button>
    </Popup>);
}