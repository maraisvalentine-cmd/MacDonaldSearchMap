import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import SearchComponent from '../components/SearchComponent.jsx';
import {renderWithProviders} from './TestUtils.jsx';

const mockSearchCommunes = vi.fn().mockReturnValue({then: ()=> vi.fn()});
vi.mock('../services/geoApi.js', () => ({
    searchCommunes: (...args) => mockSearchCommunes(...args),
}));

describe('SearchComponent', () => {
    it('ne fait aucun appel à l\'API des communes à moins de 3 caractères', () => {
        renderWithProviders(<SearchComponent/>);
        fireEvent.change(screen.getByRole('combobox'), {
            target: {value: 'Ly'},
        });
        expect(mockSearchCommunes).not.toHaveBeenCalled();
    });

    it('appelle l\'API des communes à partir de 3 caractères', async () => {
        renderWithProviders(<SearchComponent/>);
        fireEvent.change(screen.getByRole('combobox'), {
            target: {value: 'Lyo'},
        });
        await waitFor(() => expect(mockSearchCommunes).toHaveBeenCalledWith({nom: 'Lyo'}));
    });
});
