import { HyperRendererImpl } from './HyperRendererImpl';
import React from "react";
import {AppDTO} from "../../hyperstack/dto/AppDTO";

describe('HyperRendererImpl', () => {
    test('renderApp returns a defined and valid React element', () => {
        const renderer = HyperRendererImpl.create('http://localhost:3000');

        const mockComponents: never[] = [

        ];

        const mockViews: never[] = [

        ]

        const mockDefinitions: AppDTO = {
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