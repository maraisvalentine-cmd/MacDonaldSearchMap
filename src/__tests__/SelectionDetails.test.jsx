import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import SelectionDetails from '../components/SelectionDetails.jsx';
import {MemoryRouter} from 'react-router-dom';

const mockRestaurantComplet = vi.mockObject({
    osm_type: 'way',
    osm_id: '12345',
    display_name: 'Restaurant',
})

const mockRestaurantVide = vi.mockObject({})

const mockLookup = vi.fn().mockReturnValue({
    then: () => vi.fn()
});
vi.mock('../services/nominatimApi.js', () => ({
    lookup: (...args) => mockLookup(...args),
}));

describe('SelectionDetails', () => {
    it('sans restaurant, n\'affiche qu\'un label', () => {
        render(<SelectionDetails restaurant={mockRestaurantVide}/>, {wrapper: MemoryRouter});
        const element = screen.getByText('Aucun restaurant sélectionné');
        expect(element).not.toBeNull();
    });

    it('avec restaurant, affiche le bon label', () => {
        render(<SelectionDetails restaurant={mockRestaurantComplet}/>, {wrapper: MemoryRouter});
        const element = screen.getByText('Restaurant sélectionné');
        expect(element).not.toBeNull();
    });

    it('avec restaurant, recherche son adresse et ses détails', () => {
        render(<SelectionDetails restaurant={mockRestaurantComplet}/>, {wrapper: MemoryRouter});
        expect(mockLookup).toHaveBeenCalled();
    })
});