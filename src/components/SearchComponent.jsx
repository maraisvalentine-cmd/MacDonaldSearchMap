import {useCallback, useState} from 'react';
import {search} from '../services/nominatimApi.js';
import Select from 'react-select';
import searchLogo from '../assets/search.svg';

/**
 * Un composant de recherche de ville.
 * Prend en charge la recherche d'une ville de France à partir de 3 caractères donnés, via l'appel à une API Nominatim.
 */
export default function SearchComponent({updateMap}) {
    const [city, setCity] = useState('');
    const [possibleCities, setPossibleCities] = useState([]);
    const [isMenuOpen, setMenuOpen] = useState(false);

    const handlePossibilities = (c) => {
        if (c.length > 2) {
            try {
                search({
                    country: 'France',
                    city: c,
                    dedupe: 1,
                    featureType: 'city',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMap(city.value);
    }

    return (
        <form className="mt-2 px-2 py-2 rounded-lg bg-slate-50 w-full md:w-96"
              onSubmit={handleSubmit}>
            <label className="font-semibold">Rechercher un restaurant</label>
            <div className="flex items-center">
                <div className="w-5/6">
                    <Select name="city"
                            onChange={setCity}
                            options={possibleCities}
                            menuIsOpen={isMenuOpen}
                            isSearchable={true}
                            onInputChange={handlePossibilities}/>
                </div>
                <div className="mx-2 w-1/8">
                    <button
                        className="py-1 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                        type="submit">
                        <img src={searchLogo} className="h-6 w-6" alt="Rechercher"/>
                    </button>
                </div>
            </div>
        </form>
    );
}