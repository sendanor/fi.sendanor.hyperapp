import React from 'react';
import { render } from '@testing-library/react';
import { HyperLayout } from './HyperLayout';

describe('HyperLayout Component', () => {
    it('renders without crashing', () => {
        const { container } = render(<HyperLayout>Test Content</HyperLayout>);
        expect(container.firstChild).toBeInstanceOf(HTMLElement);
    });
});