import axios from 'axios';

const geoApi = axios.create({
    baseURL: 'https://geo.api.gouv.fr/',
    allowAbsoluteUrls: false
});

/**
 * Une API des communes françaises au format Json, dont la documentation autorise l'autocomplétion
 * (contrairement à Nominatim, dont la politique d'usage l'interdit côté client).
 * Les coordonnées de `centre` sont au format GeoJSON : [longitude, latitude].
 */
export const searchCommunes = (config = {}) => {
    const searchConfig = {
        params: {
            ...config,
            fields: 'nom,centre,departement',
            boost: 'population',
            limit: 5,
        }
    }
    return geoApi.get('communes', searchConfig);
}

export default geoApi;
