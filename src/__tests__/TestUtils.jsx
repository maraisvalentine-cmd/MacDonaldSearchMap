import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import mapStore from '../mapStore.js'
import {MemoryRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

export function renderWithProviders(ui, extendedRenderOptions = {}) {
    const {
        preloadedState = {},
        store = mapStore,
        queryClient = new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}}),
        ...renderOptions
    } = extendedRenderOptions

    const Wrapper = ({ children }) => (
       <QueryClientProvider client={queryClient}>
           <MemoryRouter>
               <Provider store={store}>{children}</Provider>
           </MemoryRouter>
       </QueryClientProvider>
    )

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions })
    }
}