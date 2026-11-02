import {beforeEach, describe, expect, it, vi} from 'vitest';
import {searchCity} from '../useApi.js';

const mockSearchCommunes = vi.fn();
vi.mock('../services/geoApi.js', () => ({
    searchCommunes: (...args) => mockSearchCommunes(...args),
}));
vi.mock('../services/nominatimApi.js', () => ({}));

describe('searchCity', () => {
    beforeEach(() => {
        mockSearchCommunes.mockReset();
    });

    it('convertit les communes en {display_name, lat, lon} avec les coordonnées GeoJSON [lon, lat]', async () => {
        mockSearchCommunes.mockResolvedValue({
            status: 200,
            data: [{nom: 'Lyon', centre: {type: 'Point', coordinates: [4.8351, 45.758]}, departement: {code: '69', nom: 'Rhône'}}],
        });

        const result = await searchCity('Lyo');

        expect(mockSearchCommunes).toHaveBeenCalledWith({nom: 'Lyo'});
        expect(result).toEqual([{display_name: 'Lyon, Rhône', lat: 45.758, lon: 4.8351}]);
    });

    it('ignore les communes sans centre et tolère l\'absence de département', async () => {
        mockSearchCommunes.mockResolvedValue({
            status: 200,
            data: [
                {nom: 'Sans centre'},
                {nom: 'Sans département', centre: {type: 'Point', coordinates: [1, 2]}},
            ],
        });

        const result = await searchCity('San');

        expect(result).toEqual([{display_name: 'Sans département', lat: 2, lon: 1}]);
    });

    it('lève une erreur quand l\'API ne répond pas 200', async () => {
        mockSearchCommunes.mockResolvedValue({status: 500, statusText: 'Internal Server Error', data: []});

        await expect(searchCity('Lyo')).rejects.toBe('Internal Server Error');
    });
});
