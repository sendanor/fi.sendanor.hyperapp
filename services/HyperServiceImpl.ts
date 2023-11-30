// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { filter } from "../../../hg/core/functions/filter";
import { find } from "../../../hg/core/functions/find";
import { isEqual } from "../../../hg/core/functions/isEqual";
import { map } from "../../../hg/core/functions/map";
import { reduce } from "../../../hg/core/functions/reduce";
import { some } from "../../../hg/core/functions/some";
import { uniqBy } from "../../../hg/core/functions/uniqBy";
import { HttpService } from "../../../hg/core/HttpService";
import { ReadonlyJsonAny } from "../../../hg/core/Json";
import { LogService } from "../../../hg/core/LogService";
import {
    Observer,
    ObserverCallback,
} from "../../../hg/core/Observer";
import { parseInteger } from "../../../hg/core/types/Number";
import { isString } from "../../../hg/core/types/String";
import { RouteService } from "../../../hg/frontend/services/RouteService";
import {
    explainHyperComponentDTO,
    HyperComponentDTO,
    isHyperComponentDTO,
} from "../../hyperstack/dto/HyperComponentDTO";
import {
    createHyperDTO,
    explainHyperDTO,
    HyperDTO,
    isHyperDTO,
} from "../../hyperstack/dto/HyperDTO";
import {
    explainHyperRouteDTO,
    HyperRouteDTO,
    isHyperRouteDTO,
} from "../../hyperstack/dto/HyperRouteDTO";
import {
    explainHyperViewDTO,
    HyperViewDTO,
    isHyperViewDTO,
} from "../../hyperstack/dto/HyperViewDTO";
import { createLoadingAppDefinition } from "../../hyperstack/samples/loading/LoadingAppDefinition";
import {
    HyperServiceDestructor,
    HyperServiceEvent,
} from "./HyperService";

const LOG = LogService.createLogger( 'HyperServiceImpl' );

/**
 * Frontend service to control Hyper application state.
 */
export class HyperServiceImpl {

    /**
     * Default app definitions when the cached copy is not available.
     *
     * @private
     */
    private static _loadingApp : HyperDTO = createLoadingAppDefinition(
        'LoadingApp',
        '',
        'en',
    );

    /**
     * The source URL for definitions
     * @private
     */
    private static _url : string | undefined;

    /**
     * Array of active view components.
     *
     * @private
     */
    private static _activeViews : string[] = [];

    /**
     * The cached app definitions.
     *
     * @private
     */
    private static _appDefinition : HyperDTO | undefined = undefined;
    private static _appDefinitionTime : number | undefined = undefined;

    /**
     * Event observer manager.
     *
     * @private
     */
    private static _observer: Observer<HyperServiceEvent> = new Observer<HyperServiceEvent>( "HyperServiceImpl" );

    public static Event = HyperServiceEvent;

    public static on (
        name: HyperServiceEvent,
        callback: ObserverCallback<HyperServiceEvent>
    ): HyperServiceDestructor {
        return this._observer.listenEvent( name, callback );
    }

    public static destroy (): void {
        this._observer.destroy();
        this._url = undefined;
        this._appDefinition = undefined;
        this._appDefinitionTime = undefined;
        this._activeViews = [];
    }

    public static updateApp (name : string) : void {

        if (this._observer.hasCallbacks(HyperServiceEvent.UPDATE_APP)) {
            this._observer.triggerEvent( HyperServiceEvent.UPDATE_APP, name );
            LOG.debug(`App updated: `, name);
        } else {
            LOG.warn(`App updated: ${name}; But nothing listening events for HyperServiceEvent.UPDATE_APP`);
        }

        if (this.isAppLoaded(name)) {
            this._updateFromUrlSync([name]);
        }

    }

    public static updateView (name : string) : void {
        const view : HyperViewDTO | undefined = this.findView(name);
        if (view !== undefined) {

            LOG.debug(`updateView: View "${name}": `, view);

            if (this._observer.hasCallbacks(HyperServiceEvent.UPDATE_VIEW)) {
                this._observer.triggerEvent(HyperServiceEvent.UPDATE_VIEW, name);
                LOG.debug(`updateView: View updated: ${name}`);
            } else {
                LOG.warn(`updateView: View updated: ${name}; But nothing was listening for HyperServiceEvent.UPDATE_VIEW`);
            }

            const now : number = Date.now();
            const timestampString = view?.meta?.timestamp;
            const timestamp : number | undefined = isString(timestampString) ? new Date(timestampString).getTime() : this._appDefinitionTime;
            const expiration : number | undefined = isString(view?.meta?.expiration) ? parseInteger(view?.meta?.expiration) ?? 1 : 1;
            if (timestamp !== undefined) {
                if ( now - timestamp >= expiration*1000 ) {
                    LOG.debug(`updateView: View was not fresh, removing it: `, name);
                    this._updateFromUrlSync([name]);
                } else {
                    LOG.debug(`updateView: View was already fresh, did not need updating.`);
                }
            } else {
                this._updateFromUrlSync([name]);
                LOG.debug(`updateView: View did not have timestamp.`);
            }

        } else {
            LOG.debug(`updateView: The app did not have a view named: ${name}`);
        }
    }

    public static isAppLoaded (name : string) : boolean {
        return this._appDefinition?.name === name;
    }

    public static hasView (name : string) : boolean {
        return some(this._appDefinition?.views, (item: HyperViewDTO) : boolean => item.name === name);
    }

    public static findView (name : string) : HyperViewDTO | undefined {
        if (!this._appDefinition) return undefined;
        return this._findView(this._appDefinition, name);
    }

    public static _findView (
        dto : HyperDTO,
        name : string,
    ) : HyperViewDTO | undefined {
        return find(
            dto.views,
            (item: HyperViewDTO) : boolean => item.name === name
        );
    }

    public static findViewParents (
        name : string
    ) : readonly HyperViewDTO[] {
        if (!this._appDefinition) return [];
        return this._findViewParents(this._appDefinition, name);
    }

    public static _findViewParents (
        dto : HyperDTO,
        name : string,
    ) : readonly HyperViewDTO[] {
        let view : HyperViewDTO | undefined = this._findView(dto, name);
        if (view === undefined) return [];
        const views : HyperViewDTO[] = [];
        while ( view && view.extend && view.extend !== view.name ) {
            view = this._findView(dto, view.extend);
            if (view) {
                views.push(view);
                if (view.extend === undefined) break;
            }
        }
        return views;
    }

    public static _removeViewsAndParents (
        dto : HyperDTO,
        names : readonly string[],
    ) : HyperDTO {

        const views : readonly string[] = reduce(
            names,
            (prev: readonly string[], name: string): readonly string[] => [
                ...prev,
                name,
                ...map(
                    this._findViewParents(dto, name),
                    (item : HyperViewDTO) : string => item.name,
                ),
            ],
            []
        );
        LOG.debug(`_removeViewsAndParents(${names.join(', ')}): Removing views: `, views);

        const newDto : HyperDTO = {
            ...dto,
            views: filter(
                dto.views,
                (item: HyperViewDTO) : boolean => !views.includes(item.name),
            ),
        };

        LOG.debug(`_removeViewsAndParents(${names.join(', ')}): Changing to DTO: `, newDto);
        return newDto;
    }

    public static isViewActive (name : string) : boolean {
        return this._activeViews.includes(name);
    }

    public static activateView (name : string) : void {
        this._activeViews.push(name);
        if (this._observer.hasCallbacks(HyperServiceEvent.ACTIVATE_VIEW)) {
            this._observer.triggerEvent( HyperServiceEvent.ACTIVATE_VIEW, name );
            LOG.debug(`View activated: `, name);
        } else {
            LOG.warn(`View activated: ${name}; But nothing listening events for HyperServiceEvent.ACTIVATE_VIEW`);
        }
        this.updateView(name);
    }

    public static deactivateView (name : string) : void {

        // Remove the last occurrence of the name (there might be multiple stacked)
        const removeIndex : number = this._activeViews.lastIndexOf(name);

        this._activeViews = filter(
            this._activeViews,
            (_item: string, i : number) : boolean => i !== removeIndex
        );

        if (this._observer.hasCallbacks(HyperServiceEvent.DEACTIVATE_VIEW)) {
            this._observer.triggerEvent( HyperServiceEvent.DEACTIVATE_VIEW, name );
            LOG.debug(`View deactivated: `, name);
        } else {
            LOG.warn(`View deactivated: ${name}; But nothing listening events for HyperServiceEvent.DEACTIVATE_VIEW`);
        }

    }

    public static getAppDefinitions () : HyperDTO {
        return this._appDefinition ?? this._loadingApp;
    }

    public static _setAppDefinitions (dto : HyperDTO) : void {
        if (!isEqual(this._appDefinition, dto)) {
            this._appDefinition = dto;
            this._appDefinitionTime = new Date().getTime();
            LOG.debug(`_setAppDefinitions: App definitions changed to: `, dto);
            if (this._observer.hasCallbacks(HyperServiceEvent.APP_DEFINITIONS_UPDATED)) {
                this._observer.triggerEvent(HyperServiceEvent.APP_DEFINITIONS_UPDATED);
            }
        } else {
            LOG.debug(`_setAppDefinitions: Nothing to change`);
        }
    }

    public static async setAppDefinitions (dto : HyperDTO) : Promise<void> {
        dto = await this._populateHyperDTO(dto, dto?.publicUrl);
        this._setAppDefinitions(dto);
    }

    public static async updateAppDefinitions (
        dto : HyperDTO,
        refreshViews: readonly string[],
    ) : Promise<void> {

        if (this._appDefinition) {
            const origDefinition : HyperDTO = refreshViews.length ? this._removeViewsAndParents(this._appDefinition, refreshViews) : this._appDefinition;

            dto = {
                ...dto,
                views: uniqBy(
                    [
                        ...dto.views,
                        ...origDefinition.views,
                    ],
                    'name'
                ),
                routes: uniqBy(
                    [
                        ...dto.routes,
                        ...origDefinition.routes,
                    ],
                    'name'
                ),
                components: uniqBy(
                    [
                        ...dto.components,
                        ...origDefinition.components,
                    ],
                    'name'
                ),
            };
        }

        dto = await this._populateHyperDTO(dto, dto?.publicUrl);

        if (!isEqual(this._appDefinition, dto)) {
            this._appDefinition = dto;
            this._appDefinitionTime = new Date().getTime();
            if (this._observer.hasCallbacks(HyperServiceEvent.APP_DEFINITIONS_UPDATED)) {
                this._observer.triggerEvent(HyperServiceEvent.APP_DEFINITIONS_UPDATED);
            }
            LOG.debug(`updateAppDefinitions: Updated: `, dto);
        } else {
            LOG.debug(`updateAppDefinitions: Nothing to change`);
        }
    }

    public static getRoutePathByRouteName ( name : string) : string | undefined {
        const routes : readonly HyperRouteDTO[] = this._appDefinition?.routes ?? [];
        const route : HyperRouteDTO | undefined = find(
            routes,
            (item: HyperRouteDTO) : boolean => item.name === name
        );
        return route?.path ? route.path : undefined;
    }

    public static getRoutePathByViewName ( name : string) : string | undefined {
        const routes : readonly HyperRouteDTO[] = this._appDefinition?.routes ?? [];
        const route : HyperRouteDTO | undefined = find(
            routes,
            (item: HyperRouteDTO) : boolean => item.view === name
        );
        return route?.path ? route.path : undefined;
    }

    public static saveViewDTO (dto : HyperViewDTO) : void {

        LOG.debug(`Saving view DTO: `, dto);

        const appDto : HyperDTO = {
            ...(this._appDefinition ? {
                ...this._appDefinition,
                views: [
                    ...filter(
                        this._appDefinition.views,
                        (view: HyperViewDTO) : boolean => view.name !== dto.name
                    ),
                    dto,
                ]
            } : createHyperDTO(
                '',
                undefined,
                [],
                undefined,
                undefined,
                [],
                [dto],
            )),
        };

        this.updateAppDefinitions(appDto, []).catch((err) => {
            LOG.error(`Error in saveViewDTO: `, err);
        });

    }

    public static setUrl (url: string) : void {
        if (this._url !== url) {
            LOG.debug(`URL changed to: `, url);
            this._url = url;
            if (this._observer.hasCallbacks(HyperServiceEvent.APP_URL_UPDATED)) {
                this._observer.triggerEvent(HyperServiceEvent.APP_URL_UPDATED);
            }
            this._updateFromUrlSync([]);
        }
    }

    public static getUrl () : string | undefined {
        return this._url;
    }

    public static unsetUrl () : void {
        if (this._url !== undefined) {
            LOG.debug(`URL removed: `, this._url);
            this._url = undefined;
            if (this._observer.hasCallbacks(HyperServiceEvent.APP_URL_UPDATED)) {
                this._observer.triggerEvent(HyperServiceEvent.APP_URL_UPDATED);
            }
        }
    }

    private static _updateFromUrlSync (
        refreshViews: readonly string[],
    ) : void {
        if (this._url === undefined) {
            LOG.debug(`_updateFromUrlSync: URL not defined`);
            return;
        }
        this._updateFromUrl(this._url, refreshViews).catch((err): void => {
            LOG.error(`_updateFromUrlSync: Could not update: `, err);
        });
    }

    private static async _updateFromUrl (
        url : string,
        refreshViews: readonly string[],
    ) : Promise<void> {
        try {
            const result : ReadonlyJsonAny | undefined = await HttpService.getJson(url);
            if ( !isHyperDTO( result ) ) {
                LOG.error( `_updateFromUrl("${ url }"): Response was not HyperDTO: ${ explainHyperDTO( result ) }: `, result );
            } else {

                if ( this._appDefinition === undefined || !this.isAppLoaded(result.name) ) {
                    LOG.debug(`_updateFromUrl("${ url }"): Received new app named "${result.name}": `, result);
                    await this.setAppDefinitions( result );
                } else {
                    LOG.debug(`_updateFromUrl("${ url }"): Updating app named "${result.name}": `, result);
                    LOG.debug(`_updateFromUrl("${ url }"): with refreshViews: `, refreshViews);
                    await this.updateAppDefinitions( result, refreshViews );
                }

                const location = (result as any)?.meta?.location;
                if (isString(location)) {
                    LOG.debug(`Redirecting to `, location);
                    RouteService.setRoute(location);
                    return;
                }

            }
        } catch (err) {
            LOG.error(`_updateFromUrl("${url}"): Could not update: `, url);
        }
    }

    private static async _populateHyperDTO (
        dto: HyperDTO,
        baseUrl: string | undefined = undefined,
    ): Promise<HyperDTO> {
        baseUrl = baseUrl ?? dto.publicUrl ?? '';

        const newViewsPromise = this._fetchMissingViews(dto.views, baseUrl);
        const newComponentsPromise = this._fetchMissingComponents(dto.components, baseUrl);
        const newRoutesPromise = this._fetchMissingRoutes(dto.routes, baseUrl);

        const newViews = await newViewsPromise;
        const newComponents = await newComponentsPromise;
        const newRoutes = await newRoutesPromise;

        return {
            ...dto,
            views: newViews,
            components: newComponents,
            routes: newRoutes,
        };
    }

    private static async _fetchMissingViews (
        views: readonly HyperViewDTO[],
        baseUrl: string,
    ) : Promise<HyperViewDTO[]> {
        let newViews : HyperViewDTO[] = [];
        for (const view of views) {

            let extend: string | undefined = view.extend;
            if (extend === undefined) {
                newViews.push(view);
                continue;
            }
            if (extend.startsWith('/')) {
                extend = baseUrl + extend;
            }

            if (extend.startsWith('http://') || extend.startsWith('https://')) {

                newViews.push({
                    ...view,
                    extend
                });

                // Skip if we already have the resource
                if (some(
                    [...newViews, ...views],
                    (item: HyperViewDTO) : boolean => item.name === extend
                )) {
                    continue;
                }

                // Fetch missing resources
                const response: ReadonlyJsonAny | HyperViewDTO | undefined = await HttpService.getJson(extend);
                if ( isHyperViewDTO(response) ) {
                    newViews.push( {
                        ...(response as HyperViewDTO),
                        name: extend,
                    } );
                } else {
                    LOG.debug( `response: ${explainHyperViewDTO(response)}: `, response );
                    throw new TypeError( `Response was not HyperViewDTO` );
                }

            } else {
                newViews.push(view);
            }
        }
        return newViews;
    }

    private static async _fetchMissingComponents (
        components : readonly HyperComponentDTO[],
        baseUrl : string,
    ) : Promise<HyperComponentDTO[]> {
        let newComponents : HyperComponentDTO[] = [];
        for (const component of components) {
            newComponents.push(component);
            let extend: string | undefined = component.extend;

            if (extend === undefined) {
                continue;
            }
            if (extend.startsWith('/')) {
                extend = baseUrl + extend;
            }
            if (extend.startsWith('http://') || extend.startsWith('https://')) {

                // Skip if we already have the resource
                if (some(
                    [...newComponents, ...components],
                    (item: HyperComponentDTO) : boolean => item.name === extend
                )) {
                    continue;
                }

                // Fetch missing resources
                const response: ReadonlyJsonAny | undefined = await HttpService.getJson(extend);
                if ( isHyperComponentDTO( response ) ) {
                    newComponents.push( {
                        ...(response as HyperComponentDTO),
                        name: extend
                    } );
                } else {
                    LOG.debug( `response: ${explainHyperComponentDTO( response )}: `, response );
                    throw new TypeError( `Response was not HyperComponentDTO` );
                }

            }
        }
        return newComponents;
    }

    private static async _fetchMissingRoutes (
        routes : readonly HyperRouteDTO[],
        baseUrl: string,
    ): Promise<HyperRouteDTO[]> {
        let newRoutes : HyperRouteDTO[] = [];
        for (const route of routes) {
            newRoutes.push(route);
            let extend: string | undefined = route.extend;

            if (extend === undefined) {
                continue;
            }
            if (extend.startsWith('/')) {
                extend = baseUrl + extend;
            }
            if (extend.startsWith('http://') || extend.startsWith('https://')) {

                // Skip if we already have the resource
                if (some(
                    [...newRoutes, ...routes],
                    (item: HyperRouteDTO) : boolean => item.name === extend
                )) {
                    continue;
                }

                // Fetch missing resources
                const response: ReadonlyJsonAny | undefined = await HttpService.getJson(extend);
                if ( isHyperRouteDTO( response ) ) {
                    newRoutes.push( {
                        ...(response as HyperRouteDTO),
                        name: extend
                    } );
                } else {
                    LOG.debug( `response: ${explainHyperRouteDTO( response )}: `, response );
                    throw new TypeError( `Response was not HyperRouteDTO` );
                }
                newRoutes.push(response);

            }
        }
        return newRoutes;
    }


}
