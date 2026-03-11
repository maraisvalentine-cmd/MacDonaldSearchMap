import axios from 'axios';

const nominatimApi = axios.create({
    baseURL: 'https://nominatim.openstreetmap.org/',
    allowAbsoluteUrls: false
});

nominatimApi.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
);

nominatimApi.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

/** Une API Nominatim pour rechercher et récupérer des résultats au format Json. */
export const search = (config = {}) => {
    const searchConfig = {
        params: {
            ...config,
            format: 'json',
        }
    }
    return nominatimApi.get('search', searchConfig);
}

/** Une API Nominatim pour récupérer des détails d'un point OpenSearchMap (OSM) au format Json. */
export const lookup = (config = {}) => {
    const searchConfig = {
        params: {
            ...config,
            format: 'json',
            extratags: '1',
        }
    }
    return nominatimApi.get('lookup', searchConfig);
}

export const reverse = (config = {}) => nominatimApi.get('reverse', config);
export const details = (config = {}) => nominatimApi.get('details', config);

export default nominatimApi;
