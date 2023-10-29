// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReactNode, Fragment } from "react";
import { map } from "../../../hg/core/functions/map";
import { isArray } from "../../../hg/core/types/Array";
import { isString } from "../../../hg/core/types/String";
import { HyperComponentContent, HyperComponentDTO, isHyperComponentDTO } from "../../hyperstack/dto/HyperComponentDTO";
import { HyperDTO } from "../../hyperstack/dto/HyperDTO";
import { HyperRouteDTO } from "../../hyperstack/dto/HyperRouteDTO";
import { HyperStyleDTO } from "../../hyperstack/dto/HyperStyleDTO";
import { HyperViewDTO } from "../../hyperstack/dto/HyperViewDTO";
import { HyperComponent } from "../../hyperstack/dto/types/HyperComponent";
import { findAndPopulateHyperViewDTO } from "../../hyperstack/utils/views/findAndPopulateHyperViewDTO";
import { populateHyperComponentDTO } from "../../hyperstack/utils/components/populateHyperComponentDTO";
import { HyperApp } from "../components/apps/HyperApp";
import { HyperArticle } from "../components/article/HyperArticle";
import { createHyperRoute, HyperRoute } from "../components/types/HyperRoute";
import { HyperView } from "../components/views/HyperView";
import { HyperAppRenderer, HyperContentRenderer, HyperRenderer, HyperRouteRenderer, HyperViewRenderer } from "./HyperRenderer";

export class HyperRendererImpl implements HyperRenderer {

    private static _fragmentIdIndex : number = 0;
    private _myFragmentBaseId : number = 0;

    private _contentRenderer  : HyperContentRenderer;
    private _viewRenderer     : HyperViewRenderer;
    private _appRenderer      : HyperAppRenderer;
    private _routeRenderer    : HyperRouteRenderer;

    private static _getNextFragmentId () : number {
        HyperRendererImpl._fragmentIdIndex += 1;
        return HyperRendererImpl._fragmentIdIndex;
    }

    private constructor () {
        this._myFragmentBaseId = HyperRendererImpl._getNextFragmentId();
        this._appRenderer     = HyperRendererImpl.defaultRenderApp.bind(undefined, this);
        this._routeRenderer   = HyperRendererImpl.defaultRenderRoute.bind(undefined, this);
        this._viewRenderer    = HyperRendererImpl.defaultRenderView.bind(undefined, this);
        this._contentRenderer = HyperRendererImpl.defaultRenderContent.bind(undefined, this);
    }

    public static create () {
        return new HyperRendererImpl();
    }

    /**
     * @inheritDoc
     */
    public attachAppRenderer (f : HyperAppRenderer) : void {
        this._appRenderer = f;
    }

    /**
     * @inheritDoc
     */
    public attachRouteRenderer (f : HyperRouteRenderer) : void {
        this._routeRenderer = f;
    }

    /**
     * @inheritDoc
     */
    public renderRoute (
        item        : HyperRouteDTO,
        definitions : HyperDTO,
    ) : HyperRoute {
        return this._routeRenderer(item, definitions);
    }

    /**
     * @inheritDoc
     */
    public renderRouteList (
        definitions: HyperDTO,
    ) : readonly HyperRoute[] {
        return map(
            definitions.routes,
            (item: HyperRouteDTO): HyperRoute => this.renderRoute( item, definitions )
        );
    }

    /**
     * @inheritDoc
     */
    public renderApp (
        definitions : HyperDTO,
    ) : ReactNode {
        console.log(`WOOT: renderApp: findAndPopulateHyperAppDTO: = `, definitions);
        return this._appRenderer(definitions);
    }

    /**
     * @inheritDoc
     */
    public renderView (
        viewName    : string,
        routePath   : string,
        definitions : HyperDTO,
    ) : ReactNode {
        const view : HyperViewDTO = findAndPopulateHyperViewDTO(viewName, definitions.views);
        return this._viewRenderer(view, routePath, definitions);
    }

    /**
     * @inheritDoc
     */
    public renderContent (
        content     : undefined | HyperComponentContent,
        definitions : HyperDTO,
    ) : ReactNode {
        return this._contentRenderer(content, definitions);
    }

    /**
     * Default render implementation for apps
     *
     * @param app
     * @param definitions
     * @param renderer
     */
    public static defaultRenderApp (
        renderer    : HyperRenderer,
        definitions : HyperDTO,
    ) : ReactNode {
        const publicUrl : string | undefined = definitions.publicUrl ?? '';
        const language : string | undefined = definitions.language ?? 'en';
        return (
            <HyperApp
                publicUrl={publicUrl}
                language={language}
                routeList={ renderer.renderRouteList(definitions) }
            />
        );
    }

    /**
     *
     * @param renderer
     * @param item
     * @param app
     * @param definitions
     */
    public static defaultRenderRoute (
        renderer    : HyperRenderer,
        item        : HyperRouteDTO,
        definitions : HyperDTO,
    ) : HyperRoute {

        console.log(`WOOT: defaultRenderRoute: item = `, item);
        console.log(`WOOT: defaultRenderRoute: definitions = `, definitions);

        if ( item.redirect ) {
            return createHyperRoute(
                item.path,
                item.language,
                item.publicUrl,
                item.redirect,
                undefined
            );
        }

        if ( !item.view ) throw new TypeError(`No view defined for route: ${item.name}`);

        return createHyperRoute(
            item.path,
            item.language,
            item.publicUrl,
            undefined,
            renderer.renderView(
                item.view,
                item.path,
                definitions,
            ),
        );

    }

    /**
     *
     * @param renderer
     * @param view
     * @param app
     * @param routePath
     * @param definitions
     */
    public static defaultRenderView (
        renderer    : HyperRenderer,
        view        : HyperViewDTO,
        routePath   : string,
        definitions : HyperDTO,
    ) : ReactNode {
        const language  : string = view.language  ?? definitions.language  ?? 'en';
        const publicUrl : string = view.publicUrl ?? definitions.publicUrl ?? '';
        const style     : HyperStyleDTO      = view.style     ?? {};
        return (
            <HyperView
                language={language}
                publicUrl={publicUrl}
                routePath={routePath}
                style={style}
            >{renderer.renderContent( view.content, definitions )}</HyperView>
        );
    }

    public static defaultRenderComponent (
        renderer    : HyperRenderer,
        content     : HyperComponentDTO,
        definitions : HyperDTO,
    ) : ReactNode {

        const populatedComponent : HyperComponentDTO = populateHyperComponentDTO(content, definitions.components);

        if (populatedComponent.name === HyperComponent.Article) {
            return <HyperArticle>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</HyperArticle>
        }

        console.log('WOOT: populatedComponent = ', populatedComponent);

        return <>{JSON.stringify(content)}</>;
    }

    public static defaultRenderContent (
        renderer    : HyperRenderer,
        content     : undefined | HyperComponentContent,
        definitions : HyperDTO,
    ) : ReactNode {

        if (isArray(content)) {
            const fragmentId : number = HyperRendererImpl._getNextFragmentId();
            return <>{map(
                content,
                (item: string | HyperComponentDTO, index: number) : ReactNode => {
                    return (
                        <Fragment key={`content-${fragmentId}-index-${index}`}>{
                            HyperRendererImpl.defaultRenderContent(renderer, item, definitions)
                        }</Fragment>
                );
                }
            )}</>;
        }

        if (isHyperComponentDTO(content)) {

            const populatedComponent : HyperComponentDTO = populateHyperComponentDTO(content, definitions.components);

            if (populatedComponent.name === HyperComponent.Article) {
                return <HyperArticle>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</HyperArticle>
            }

        }

        if (isString(content)) {
            return <>{content}</>;
        }

        return <>{JSON.stringify(content)}</>;
    }

}
