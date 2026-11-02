import geolocateLogo from '../assets/geolocate.svg';
import {useDispatch} from 'react-redux';
import {doLocate} from '../reducers/locateSlice.js';

export default function GeolocateComponent() {
    const dispatch = useDispatch();

    const locate = (e) => {
        e.preventDefault();
        dispatch(doLocate());
    }

    return (
        <div className="absolute top-4 right-5 z-10">
            <button role="geolocate"
                data-testid="geolocate-button"
                className="py-1 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                onClick={locate}>
                <img src={geolocateLogo} className="h-8 w-8" alt="Géolocaliser"/>
            </button>
        </div>
    );
}