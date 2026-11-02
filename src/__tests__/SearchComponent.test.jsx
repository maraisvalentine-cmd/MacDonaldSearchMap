import {search} from '../services/nominatimApi.js';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import SearchComponent from '../components/SearchComponent.jsx';
import {renderWithProviders} from './TestUtils.jsx';

const mockSearch = vi.fn().mockReturnValue({then: ()=> vi.fn()});
vi.mock('../services/nominatimApi.js', () => ({
    search: (...args) => mockSearch(...args),
}));

describe('SearchComponent', () => {
    it('ne fait aucun appel nominatim à moins de 3 caractères', () => {
        renderWithProviders(<SearchComponent/>);
        fireEvent.change(screen.getByRole('combobox'), {
            target: {value: 'Ly'},
        });
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('appelle une api nominatim de recherche à partir de 3 caractères', async () => {
        renderWithProviders(<SearchComponent/>);
        fireEvent.change(screen.getByRole('combobox'), {
            target: {value: 'Lyo'},
        });
        await waitFor(() => expect(mockSearch).toHaveBeenCalled());
    });
});