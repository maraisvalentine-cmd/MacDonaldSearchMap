import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import mapStore from '../mapStore.js'
import {MemoryRouter} from 'react-router-dom';

export function renderWithProviders(ui, extendedRenderOptions = {}) {
    const {
        preloadedState = {},
        store = mapStore,
        ...renderOptions
    } = extendedRenderOptions

    const Wrapper = ({ children }) => (
       <MemoryRouter>
           <Provider store={store}>{children}</Provider>
       </MemoryRouter>
    )

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions })
    }
}