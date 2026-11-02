import {useCallback, useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {resetSelectedRestaurant} from '../reducers/selectedRestaurantSlice.js';
import closeLogo from '../assets/close.svg';
import chevronDownLogo from '../assets/chevron-down.svg';
import chevronUpLogo from '../assets/chevron-up.svg';
import {useMutation} from '@tanstack/react-query';
import {lookupRestaurant} from '../useApi.js';

/**
 * Un bandeau d'affichage des détails du restaurant sélectionné.
 */
export default function SelectionDetails() {
    const [hide, setHide] = useState(false);
    const [address, setAddress] = useState({});
    const [extraData, setExtraData] = useState({});
    const restaurant = useSelector(state => state.selectedRestaurant.value);
    const dispatch = useDispatch();

    const mutateDetails = useMutation({
        mutationFn: (osmIds) => lookupRestaurant(osmIds),
        onSuccess: data => {
            setAddress(data.address);
            setExtraData(data.extratags);
        },
        onError: error => {
            console.log(error)
        }
    })

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
            const osmIds = osmType + restaurant.osm_id
            mutateDetails.mutate(osmIds);
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

    // En cas d'erreur, on n'affiche pas les détails d'un éventuel restaurant précédent.
    const hasError = Boolean(restaurant?.osm_id) && mutateDetails.isError;
    const showDetails = address && !hasError;

    return (
        <div className="absolute w-full bottom-0 z-10" data-testid="selection-details">
            <div className="mt-2 px-2 py-2 rounded-t-lg bg-slate-50">
                {hasError && <span className="font-bold text-red-700" role="alert" data-testid="selection-error">
                    Impossible de récupérer les détails du restaurant. Réessayez dans quelques instants.
                </span>}
                {!hasError && !address && <span className="font-bold" data-testid="selection-empty">Aucun restaurant sélectionné</span>}

                {showDetails &&
                    <div>
                        <div>
                            <span className="font-bold" data-testid="selection-title">Restaurant sélectionné
                                {!hide &&
                                    <button className="absolute right-6"
                                            role="hide"
                                            data-testid="selection-hide"
                                            onClick={() => setHide(true)}>
                                        <img src={chevronDownLogo} className="h-4 w-4" alt="Hide"/>
                                    </button>}
                                {!hide &&
                                    <button className="absolute right-0"
                                            role="close"
                                            data-testid="selection-close"
                                            onClick={() => dispatch(resetSelectedRestaurant())}>
                                        <img src={closeLogo} className="h-4 w-4" alt="Close"/>
                                    </button>
                                }
                                {hide && <button className="absolute right-0"
                                                 role="show"
                                                 data-testid="selection-show"
                                                 onClick={() => setHide(false)}>
                                    <img src={chevronUpLogo} className="h-4 w-4" alt="Show"/>
                                </button>
                                }</span>
                        </div>
                        {!hide && <div>
                            <div className="mx-2 w-full grid gap-6 md:grid-cols-2" data-testid="selection-info">
                                <div data-testid="selection-address">
                                    <div>{address.amenity}</div>
                                    <div>{address.road}</div>
                                    {address.suburb && <div>{address.suburb}</div>}
                                    <div>{address.postcode} {address.town || address.village}</div>
                                </div>
                                <div data-testid="selection-contact">
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
                            <Link to={extraData.website} data-testid="selection-continue-link">
                                <button
                                    className="py-1 px-2 border-2 border-black rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-200 hover:ring-4"
                                    role="continue"
                                    data-testid="selection-continue"
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