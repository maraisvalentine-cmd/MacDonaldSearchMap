import {lookup, search} from './services/nominatimApi.js';

export const useSearchCity = async (city) => {
    const result = await search({
        country: 'France',
        city: city,
        dedupe: 1,
        featureType: 'city',
    });
    if (result.status !== 200) {
        throw result.statusText;
    }
    return result.data;
};

export const useSearchRestaurants = async (viewbox) => {
    const result = await search({
        viewbox: viewbox,
        bounded: 1,
        amenity: 'McDonald',
        limit: '20',
    });
    if (result.status !== 200) {
        throw result.statusText;
    }
    return result.data;
}

export const useLookupRestaurant = async (osmIds) => {
    const result = await lookup({
        osm_ids: osmIds
    });
    if (result.status !== 200) {
        throw result.statusText;
    }
    return result.data[0];
}