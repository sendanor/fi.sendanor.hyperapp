import React from 'react';
import { render } from '@testing-library/react';
import { HyperActionButton } from './HyperActionButton';


describe('ActionButton', () => {
    it('renders without crashing', () => {
        const { container } = render(<HyperActionButton />);
        expect(container.firstChild).toBeInstanceOf(HTMLElement);
    });
});
