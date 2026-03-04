import {useState} from 'react';

export default function SearchComponent({updateRestaurants}) {
    const [city, setCity] = useState('');
    const handleChange = async (c) => {
        setCity(c);
    }

    return (<form className="px-4 py-4 max-w-lg bg-stale-400" onSubmit={e => updateRestaurants(e, city)}>
                <label className="font-semibold">Rechercher un restaurant</label>
                <div className="flex items-center">
                    <input className="rounded-lg border border-gray-300 py-2 w-5/6 focus:outline-none focus:ring-2"
                           value={city} onChange={e => handleChange(e.target.value)} placeholder=" Ville..."/>
                    <button
                        className="w-1/6 py-1 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                        type="submit">
                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="m19 19-3.5-3.5"></path>
                            <circle cx="11" cy="11" r="6"></circle>
                        </svg>
                    </button>
                </div>
            </form>
    );
}