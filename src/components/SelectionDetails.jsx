import {useCallback, useEffect, useMemo, useState} from 'react';
import {lookup} from '../services/nominatimApi.js';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {resetSelectedRestaurant} from '../reducers/selectedRestaurantSlice.js';
import closeLogo from '../assets/close.svg';
import chevronDownLogo from '../assets/chevron-down.svg';
import chevronUpLogo from '../assets/chevron-up.svg';

/**
 * Un bandeau d'affichage des détails du restaurant sélectionné.
 */
export default function SelectionDetails() {
    const [hide, setHide] = useState(false);
    const [address, setAddress] = useState({});
    const [extraData, setExtraData] = useState({});
    const restaurant = useSelector(state => state.selectedRestaurant.value);
    const dispatch = useDispatch();

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
                setAddress(result.data[0].address);
                setExtraData(result.data[0].extratags);
            });
        },
        [restaurant]
    )

    useEffect(() => {
        if (restaurant && restaurant?.osm_id) {
            renderAddress();
        } else {
            setAddress(null);
        }
    }, [restaurant]);

    return (
        <div className="absolute w-full bottom-0 z-10">
            <div className="mt-2 px-2 py-2 rounded-t-lg bg-slate-50">
                {!address && <span className="font-bold">Aucun restaurant sélectionné</span>}

                {address &&
                    <div>
                        <div>
                            <span className="font-bold">Restaurant sélectionné
                                {!hide &&
                                    <button className="absolute right-6"
                                            role="hide"
                                            onClick={e => setHide(true)}>
                                        <img src={chevronDownLogo} className="h-4 w-4" alt="Hide"/>
                                    </button>}
                                {!hide &&
                                    <button className="absolute right-0"
                                            role="close"
                                            onClick={e => dispatch(resetSelectedRestaurant())}>
                                        <img src={closeLogo} className="h-4 w-4" alt="Close"/>
                                    </button>
                                }
                                {hide && <button className="absolute right-0"
                                                 role="show"
                                                 onClick={e => setHide(false)}>
                                    <img src={chevronUpLogo} className="h-4 w-4" alt="Show"/>
                                </button>
                                }</span>
                        </div>
                        {!hide && <div>
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
                                    role="continue"
                                > Continuer
                                </button>
                            </Link>
                        </div>
                        }
                    </div>
                }
            </div>
        </div>
    );
}