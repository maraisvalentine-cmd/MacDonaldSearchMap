import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen} from '@testing-library/react';
import SelectionDetails from '../components/SelectionDetails.jsx';
import {renderWithProviders} from './TestUtils.jsx';
import {setSelectedRestaurant} from '../reducers/selectedRestaurantSlice.js';
import mapStore from '../mapStore.js';

const mockRestaurantComplet = vi.mockObject({
    osm_type: 'way',
    osm_id: '12345',
    display_name: 'Restaurant',
});

const mockLookup = vi.fn().mockReturnValue({
    data: [{
        address: {},
        extratags: {}
    }],
    then: () => vi.fn()
});
vi.mock('../services/nominatimApi.js', () => ({
    lookup: (...args) => mockLookup(...args),
}));

describe('SelectionDetails', () => {
    describe('sans restaurant', () => {
        it('n\'affiche qu\'un label', () => {
            renderWithProviders(<SelectionDetails/>);
            const element = screen.getByText('Aucun restaurant sélectionné');
            expect(element).not.toBeNull();
        });
    });


    describe('avec restaurant', () => {
        it('affiche le bon label', () => {
            const store = mapStore;
            store.dispatch(setSelectedRestaurant(mockRestaurantComplet));
            renderWithProviders(<SelectionDetails/>, {store});

            const element = screen.getByText('Restaurant sélectionné');
            expect(element).not.toBeNull();
        });

        it('recherche son adresse et ses détails', () => {
            const store = mapStore;
            store.dispatch(setSelectedRestaurant(mockRestaurantComplet));
            renderWithProviders(<SelectionDetails/>, {store});

            expect(mockLookup).toHaveBeenCalled();
        });

        it('cache les détails au clic sur chevron down', () => {
            const store = mapStore;
            store.dispatch(setSelectedRestaurant(mockRestaurantComplet));
            renderWithProviders(<SelectionDetails/>, {store});

            fireEvent.click(screen.getByRole('hide'));
            expect(screen.queryByRole('continue')).toBeNull();
        });

        it('affiche les détails au clic sur chevron up', () => {
            const store = mapStore;
            store.dispatch(setSelectedRestaurant(mockRestaurantComplet));
            renderWithProviders(<SelectionDetails/>, {store});

            fireEvent.click(screen.getByRole('hide'));
            fireEvent.click(screen.getByRole('show'));
            expect(screen.getByRole('continue')).not.toBeNull();
        });

        it('affiche un message d\'erreur quand la recherche des détails échoue', async () => {
            const store = mapStore;
            mockLookup.mockRejectedValueOnce(new Error('Request failed with status code 429'));
            store.dispatch(setSelectedRestaurant(mockRestaurantComplet));
            renderWithProviders(<SelectionDetails/>, {store});

            const element = await screen.findByTestId('selection-error');
            expect(element.textContent).toContain('Impossible de récupérer les détails du restaurant');
            expect(screen.queryByRole('continue')).toBeNull();
            expect(screen.queryByText('Aucun restaurant sélectionné')).toBeNull();
        });

        it('vide les détails au clic sur close', () => {
            const store = mapStore;
            store.dispatch(setSelectedRestaurant(mockRestaurantComplet));
            renderWithProviders(<SelectionDetails/>, {store});

            fireEvent.click(screen.getByRole('close'));
            const element = screen.getByText('Aucun restaurant sélectionné');
            expect(element).not.toBeNull();
        });
    });

});