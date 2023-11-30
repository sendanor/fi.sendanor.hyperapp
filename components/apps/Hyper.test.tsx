import {Hyper} from "./Hyper";
import {HyperRendererImpl} from "../../renderers/HyperRendererImpl";
import { render } from '@testing-library/react';
import {MemoryRouter} from "react-router-dom";

jest.mock('react-helmet-async', () => {
    return {
        Helmet: jest.fn(),
    };
});

describe('Hyper Component', () => {

    describe('Hyper Component', () => {

        it('renders without crashing', () => {
            const hyperRendererImpl = HyperRendererImpl.create('https://localhost:3000');

            const { container } = render(
                <MemoryRouter>
                    <Hyper url={'https://localhost:3000/api/v1'} renderer={hyperRendererImpl} />
                </MemoryRouter>
            );

            expect(container.firstChild).toBeInstanceOf(HTMLElement);
        });
    });
});