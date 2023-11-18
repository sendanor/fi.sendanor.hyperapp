import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO, SEOProps } from './SEO';

jest.mock('react-helmet-async', () => {
    return {
        Helmet: jest.fn(),
    };
});

describe('SEO Component', () => {
    const defaultProps: SEOProps = {
        publicUrl: 'https://example.com',
        title: 'Test Title',
        language: 'en',
        description: 'Test Description',
    };

    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <SEO {...defaultProps} />
            </MemoryRouter>
        );

        expect(Helmet).toHaveBeenCalled();
    });
});