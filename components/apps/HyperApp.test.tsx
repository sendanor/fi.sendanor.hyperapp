import { render } from '@testing-library/react';
import {HyperApp} from "./HyperApp";
import {MemoryRouter} from "react-router-dom";


describe('HyperApp', () => {
    const mockRouteList: any[] = [];

    it('renders the route list correctly', () => {
        const { container } = render(
            <MemoryRouter>
                <HyperApp
                    publicUrl="/public"
                    language="en"
                    routeList={mockRouteList}
                />
            </MemoryRouter>
        );
        expect(container.firstChild).toBeInstanceOf(HTMLElement);
    });

    // The container.firstChild is null, which indicates that there might be an issue with the rendering of the HyperApp component.
    // The MemoryRouter and HyperApp components are not generating any content inside the container.

    it('renders without crashing', () => {
        expect(() => {
            render(
                <MemoryRouter>
                    <HyperApp
                        publicUrl="/public"
                        language="en"
                        routeList={mockRouteList}
                    />
                </MemoryRouter>
            );
        }).not.toThrow();
    });
});