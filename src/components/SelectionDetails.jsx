import {useCallback, useEffect, useMemo, useState} from 'react';
import {lookup} from '../services/nominatimApi.js';
import {Link} from 'react-router-dom';

/**
 * Un bandeau d'affichage des détails du restaurant sélectionné.
 */
export default function SelectionDetails({restaurant}) {
    const [label, setLabel] = useState('');
    const [address, setAddress] = useState({});
    const [extraData, setExtraData] = useState({});

    const osmType = useMemo(() => {
        if (restaurant.osm_type === 'way') {
            return 'W';
        } else if (restaurant.osm_type === 'relation') {
            return 'R';
        } else {
            return 'N';
        }
    }, [restaurant]);

    const renderAddress = useCallback(() => {
            lookup({
                osm_ids: osmType + restaurant.osm_id
            }).then(result => {
                console.log(result);
                setAddress(result.data[0].address);
                setExtraData(result.data[0].extratags);
            });
        },
        [restaurant]
    )

    useEffect(() => {
        if (restaurant && restaurant?.display_name) {
            renderAddress();
            setLabel('Restaurant sélectionné');
        } else {
            setAddress('');
            setLabel('Aucun restaurant sélectionné');
        }
    }, [restaurant]);


    return (
        <div className="mt-2 px-2 py-2 rounded-t-lg bg-slate-50">
            <label className="font-bold">{label}</label>
            {address &&
                <div>
                    <div className="mx-2 w-full grid gap-6 md:grid-cols-2">
                        <div>
                            <div>{address.amenity}</div>
                            <div>{address.road}</div>
                            {address.suburb && <div>{address.suburb}</div>}
                            <div>{address.postcode} {address.town || address.village}</div>
                        </div>
                        <div>
                            {extraData.phone && <div>
                                <div className="font-semibold"> Tel :</div>
                                {extraData.phone}</div>
                            }
                            {extraData.opening_hours && <div>
                                <div className="font-semibold"> Ouverture :</div>
                                {extraData.opening_hours}</div>
                            }
                        </div>
                    </div>
                    <Link to={extraData.website}>
                        <button
                            className="py-1 px-2 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                        > Continuer
                        </button>
                    </Link>
                </div>
            }
        </div>
    );
}