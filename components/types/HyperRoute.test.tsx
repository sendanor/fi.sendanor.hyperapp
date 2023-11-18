import {ReactNode} from "react";
import {
    createHyperRoute,
    explainHyperRoute, explainHyperRouteOrUndefined,
    HyperRoute,
    isHyperRoute, isHyperRouteOrUndefined,
    parseHyperRoute,
    stringifyHyperRoute
} from "./HyperRoute";

describe("HyperRoute", () => {
    describe('createHyperRoute', () => {
        it('creates a HyperRoute with the provided parameters', () => {
            const path = '/example';
            const language = 'en';
            const publicUrl = '/public';
            const redirect = '/redirect';
            const element: ReactNode = <div>Hello, World!</div>;

            const result: HyperRoute = createHyperRoute(path, language, publicUrl, redirect, element);

            expect(result).toEqual({
                path,
                language,
                publicUrl,
                redirect,
                element,
            });
        });

    });

    describe('isHyperRoute', () => {
        it('should return true for a valid HyperRoute', () => {
            const validHyperRoute = {
                path: '/example',
                language: 'en',
                publicUrl: '/public',
                redirect: '/redirect',
                element: <div>Hello, World!</div>,
            };

            expect(isHyperRoute(validHyperRoute)).toBe(true);
        });
    })

    describe('explainHyperRoute', () => {
        it('should explain a valid HyperRoute', () => {
            const validHyperRoute = {
                path: '/example',
                language: 'en',
                publicUrl: '/public',
                redirect: '/redirect',
                element: <div>Hello, World!</div>,
            };

            const explanation = explainHyperRoute(validHyperRoute);

            expect(explanation).toBe('OK');
        });
    })

    describe('stringifyHyperRoute', () => {
        it('should stringify a HyperRoute', () => {
            const hyperRoute = {
                path: '/example',
                language: 'en',
                publicUrl: '/public',
                redirect: '/redirect',
                element: <div>Hello, World!</div>,
            };

            const result = stringifyHyperRoute(hyperRoute);

            expect(result).toBe('HyperRoute([object Object])');
        });
    });

    describe('parseHyperRoute', () => {
        it('should parse a valid HyperRoute', () => {
            const validHyperRoute = {
                path: '/example',
                language: 'en',
                publicUrl: '/public',
                redirect: '/redirect',
                element: <div>Hello, World!</div>,
            };

            const result = parseHyperRoute(validHyperRoute);

            expect(result).toEqual(validHyperRoute);
        });
    })

    describe('isHyperRouteOrUndefined', () => {
        it('should return true for a valid HyperRoute', () => {
            const validHyperRoute = {
                path: '/example',
                language: 'en',
                publicUrl: '/public',
                redirect: '/redirect',
                element: <div>Hello, World!</div>,
            };

            const result = isHyperRouteOrUndefined(validHyperRoute);

            expect(result).toBe(true);
        });
    })

    describe('explainHyperRouteOrUndefined', () => {
        it('should explain "ok" for a valid HyperRoute', () => {
            const validHyperRoute = {
                path: '/example',
                language: 'en',
                publicUrl: '/public',
                redirect: '/redirect',
                element: <div>Hello, World!</div>,
            };

            const result = explainHyperRouteOrUndefined(validHyperRoute);

            expect(result).toBe('OK');
        });
    })
})