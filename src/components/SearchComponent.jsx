import {useRef, useState} from 'react';
import {search} from '../services/nominatimApi.js';
import Select from 'react-select';

export default function SearchComponent({updateMap}) {
    const [city, setCity] = useState('');
    const [possibleCities, setPossibleCities] = useState([]);
    const [isMenuOpen, setMenuOpen] = useState(false);

    const handlePossibilities = (c) => {
        if (c.length > 2) {
            try {
                search({
                    params: {
                        format: 'json',
                        city: c,
                    }
                }).then(response => {
                    setPossibleCities(response.data.map((c, i) => ({value: c, label: c.display_name})));
                    setMenuOpen(true);
                });
            } catch (e) {
                console.log(e.stack);
            }
        } else {
            setMenuOpen(false);
        }
    }

    return (<form className="mt-2 px-2 py-2 rounded-lg bg-slate-50" onSubmit={e => updateMap(e, city.value)}>
            <label className="font-semibold">Rechercher un restaurant</label>
            <div className="flex items-center">
                <div className="w-96">
                    <Select name="city"
                            onChange={setCity}
                            options={possibleCities}
                            menuIsOpen={isMenuOpen}
                            isSearchable={true}
                            onInputChange={handlePossibilities}/>
                </div>
                <div className="mx-2 1/6">
                    <button
                        className="py-1 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                        type="submit">
                        <svg width="24" height="24" fill="none" stroke="currentColor">
                            <path d="m19 19-3.5-3.5"></path>
                            <circle cx="11" cy="11" r="6"></circle>
                        </svg>
                    </button>
                </div>
            </div>
        </form>
    );
}