import { HyperRendererImpl } from './HyperRendererImpl';
import React from "react";
import {HyperDTO} from "../../hyperstack/dto/HyperDTO";

describe('HyperRendererImpl', () => {
    test('renderApp returns a defined and valid React element', () => {
        const renderer = HyperRendererImpl.create();

        const mockComponents: never[] = [

        ];

        const mockViews: never[] = [

        ]

        const mockDefinitions: HyperDTO = {
            name: 'MockHyperDTO',
            components: mockComponents,
            views: mockViews,
            publicUrl: 'mockPublicUrl',
            language: 'en',
            routes: [
            ],
        };

        const appElement = renderer.renderApp(mockDefinitions);

        expect(appElement).toBeDefined();
        expect(React.isValidElement(appElement)).toBe(true);
    });

});