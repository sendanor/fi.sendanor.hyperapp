import React from 'react';
import { render } from '@testing-library/react';
import { HyperArticle } from './HyperArticle';


describe('HyperArticle', () => {
    it('renders without crashing', () => {
        const { container } = render(<HyperArticle />);
        expect(container.firstChild).toBeInstanceOf(HTMLElement);
    });
});
