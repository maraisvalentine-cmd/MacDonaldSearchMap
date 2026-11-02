import {useState} from 'react';
import Select from 'react-select';
import searchLogo from '../assets/search.svg';
import {doSearch} from '../reducers/searchingSlice.js';
import {useDispatch} from 'react-redux';
import {setPosition} from '../reducers/positionSlice.js';
import {useSearchCity} from '../useApi.js';
import {useMutation} from '@tanstack/react-query';

/**
 * Un composant de recherche de ville.
 * Prend en charge la recherche d'une ville de France à partir de 3 caractères donnés, via l'appel à une API Nominatim.
 */
export default function SearchComponent() {
    const [city, setCity] = useState('');
    const [possibleCities, setPossibleCities] = useState([]);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const dispatch = useDispatch();

    const mutateCity = useMutation({
        mutationFn: (c) => useSearchCity(c),
        onSuccess: data => {
            setMenuOpen(true);
            setPossibleCities(data.map(r => ({value: r, label: r.display_name})));
        },
        onError: error => {
            console.log(error)
        }
    });


    const handlePossibilities = (c) => {
        if (c.length > 2) {
            mutateCity.mutate(c);
        } else {
            setMenuOpen(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            dispatch(setPosition([city.value.lat, city.value.lon]))
            dispatch(doSearch());
        } catch (e) {
            console.log(e.stack);
        }
    }


    return (
        <div className="absolute top-0 left-12 z-10 md:left-16 w-4/6">
            <form className="mt-2 px-2 py-2 rounded-lg bg-slate-50 w-full md:w-96"
                  onSubmit={handleSubmit}>
                <label className="font-semibold" data-testid="search-label">Rechercher un restaurant</label>
                <div className="flex items-center">
                    <div className="w-5/6" data-testid="search-city-select">
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
                            type="submit"
                            data-testid="search-submit">
                            <img src={searchLogo} className="h-6 w-6" alt="Rechercher"/>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}