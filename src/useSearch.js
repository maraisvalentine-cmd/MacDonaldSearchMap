import {search} from './services/nominatimApi.js';

export const searchCity = async (city) => {
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

export const searchRestaurants = async (viewbox) => {
    const result = await search({
        viewbox: viewbox,
        bounded: 1,
        amenity: 'McDonald',
        limit: '20',
    });
    if (result.status !== 200) {
        throw result.statusText;
    }
    console.log(result.data);
    return result.data;
}