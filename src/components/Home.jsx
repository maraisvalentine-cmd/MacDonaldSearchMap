import SearchComponent from './SearchComponent.jsx';
import GeolocateComponent from './GeolocateComponent.jsx';
import SelectionDetails from './SelectionDetails.jsx';
import MapView from './MapView.jsx';

export default function Home() {
    return (
        <div className="static">
            <MapView/>
            <div className="w-full">
                <SearchComponent/>
                <GeolocateComponent/>
            </div>

            <SelectionDetails/>
        </div>
    );
}