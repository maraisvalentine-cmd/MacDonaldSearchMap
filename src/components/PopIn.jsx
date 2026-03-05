import {useEffect, useState} from 'react';

export default function PopIn({restaurant}) {
    const [label,setLabel] = useState('')
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (restaurant && !restaurant.empty) {
            setAddress(restaurant.display_name);
            setLabel('Restaurant sélectionné');
        } else {
            setAddress('');
            setLabel('Aucun restaurant sélectionné');
        }
    }, [restaurant]);


    return (
        <div className="mt-2 px-2 py-2 rounded-t-lg bg-slate-50">
            <label className="font-semibold">{label}</label>
            {address &&
                <div className="w-96">
                    {address}
                    <div className="mx-2 1/6">
                        <button
                            className="py-1 px-2 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                            type="submit"> Continuer
                        </button>
                    </div>
                </div>
            }
        </div>
    );
}