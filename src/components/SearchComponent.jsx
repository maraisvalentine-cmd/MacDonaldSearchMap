import {useState} from 'react';

export default function SearchComponent({onUpdate}) {
    const [city, setCity] = useState('');

    const handleChange = async (c) => {
        setCity(c);
        onUpdate(c);
    }

    return (
        <form className="container mx-auto px-4 py-16 max-w-lg">
            <label className="font-semibold">Rechercher un restaurant</label>
            <input className="rounded-lg border border-gray-300 px-3 py-2 w-full focus:outline-none focus:ring-2"
                   value={city} onChange={e => handleChange(e.target.value)} placeholder="Search..."/>
            <button className="w-full py-2 rounded-lg font-semibold">Search</button>
        </form>
    );
}