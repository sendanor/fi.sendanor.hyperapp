import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HyperView, HyperViewProps } from './HyperView';

jest.mock('react-helmet-async', () => {
    return {
        Helmet: jest.fn(),
    };
});

describe('HyperView Component', () => {
    const defaultProps: HyperViewProps = {
        name: 'ViewName',
        publicUrl: 'https://example.com',
        routePath: '/test',
        language: 'en',
    };

    it('renders without crashing', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/test']}>
                <HyperView {...defaultProps} />
            </MemoryRouter>
        );

        expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });
});