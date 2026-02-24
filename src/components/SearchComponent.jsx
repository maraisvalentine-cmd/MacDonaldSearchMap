import {useState} from 'react';

export default function SearchComponent() {
    const [city, setCity] = useState('');
    const onChange = (value) => {}
    const onClick = () => {}

    return (<div>
        <h1>Rechercher un restaurant</h1>
        <input onChange={onChange} value={city} type="text" placeholder="Search..." />
        <button onClick={onClick}>Search</button>
    </div>)
}