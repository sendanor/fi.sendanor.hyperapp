// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReactNode, Fragment } from "react";
import { Link } from "react-router-dom";
import { map } from "../../../hg/core/functions/map";
import { ReadonlyJsonObject } from "../../../hg/core/Json";
import { LogService } from "../../../hg/core/LogService";
import { isArray } from "../../../hg/core/types/Array";
import { isString } from "../../../hg/core/types/String";
import { Button } from "../../../hg/frontend/components/button/Button";
import { HyperComponentContent, HyperComponentDTO, isHyperComponentDTO } from "../../hyperstack/dto/HyperComponentDTO";
import { HyperDTO } from "../../hyperstack/dto/HyperDTO";
import { HyperRouteDTO } from "../../hyperstack/dto/HyperRouteDTO";
import { HyperStyleDTO } from "../../hyperstack/dto/HyperStyleDTO";
import { HyperViewDTO } from "../../hyperstack/dto/HyperViewDTO";
import { HyperComponent } from "../../hyperstack/dto/types/HyperComponent";
import { HyperAction, isHyperActionOrStringOrUndefined } from "../../hyperstack/types/HyperAction";
import { findAndPopulateHyperViewDTO } from "../../hyperstack/utils/views/findAndPopulateHyperViewDTO";
import { populateHyperComponentDTO } from "../../hyperstack/utils/components/populateHyperComponentDTO";
import { HyperActionButton } from "../components/actionButton/HyperActionButton";
import { HyperApp } from "../components/apps/HyperApp";
import { HyperArticle } from "../components/article/HyperArticle";
import { createHyperRoute, HyperRoute } from "../components/types/HyperRoute";
import { LazyHyperView } from "../components/views/LazyHyperView";
import { HyperAppRenderer, HyperContentRenderer, HyperRenderer, HyperRouteRenderer, HyperViewRenderer } from "./HyperRenderer";

const LOG = LogService.createLogger( 'HyperRendererImpl' );

export class HyperRendererImpl implements HyperRenderer {

    private static _fragmentIdIndex : number = 0;
    private _myFragmentBaseId : number = 0;

    private _contentRenderer  : HyperContentRenderer;
    private _viewRenderer     : HyperViewRenderer;
    private _appRenderer      : HyperAppRenderer;
    private _routeRenderer    : HyperRouteRenderer;
    private _publicUrl        : string;

    private static _getNextFragmentId () : number {
        HyperRendererImpl._fragmentIdIndex += 1;
        return HyperRendererImpl._fragmentIdIndex;
    }

    private constructor (
        publicUrl : string,
    ) {
        this._publicUrl = publicUrl;
        this._myFragmentBaseId = HyperRendererImpl._getNextFragmentId();
        this._appRenderer = HyperRendererImpl.defaultRenderApp.bind(undefined, this);
        this._routeRenderer = HyperRendererImpl.defaultRenderRoute.bind(undefined, this);
        this._viewRenderer = HyperRendererImpl.defaultRenderView.bind(undefined, this);
        this._contentRenderer = HyperRendererImpl.defaultRenderContent.bind(undefined, this);
    }

    public getPublicUrl () : string {
        return this._publicUrl;
    }

    public static create (
        publicUrl : string,
    ) : HyperRendererImpl {
        return new HyperRendererImpl(publicUrl);
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
        const publicUrl = definitions?.publicUrl ?? this._publicUrl;
        return this._routeRenderer(
            item,
            definitions,
            publicUrl,
        );
    }

    /**
     * @inheritDoc
     */
    public renderRouteList (
        definitions : HyperDTO,
    ) : readonly HyperRoute[] {
        return map(
            definitions.routes,
            (item: HyperRouteDTO): HyperRoute => this.renderRoute(
                item,
                definitions,
            )
        );
    }

    /**
     * @inheritDoc
     */
    public renderApp (
        definitions : HyperDTO,
    ) : ReactNode {
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
        const view : HyperViewDTO = findAndPopulateHyperViewDTO(
            viewName,
            definitions.views,
            definitions.publicUrl ?? this._publicUrl,
        );
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
     * @param definitions
     * @param renderer
     */
    public static defaultRenderApp (
        renderer    : HyperRenderer,
        definitions : HyperDTO,
    ) : ReactNode {
        const publicUrl : string | undefined = definitions.publicUrl ?? renderer.getPublicUrl();
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
     * @param definitions
     */
    public static defaultRenderRoute (
        renderer    : HyperRenderer,
        item        : HyperRouteDTO,
        definitions : HyperDTO,
    ) : HyperRoute {

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
     * @param routePath
     * @param definitions
     */
    public static defaultRenderView (
        renderer    : HyperRenderer,
        view        : HyperViewDTO,
        routePath   : string,
        definitions : HyperDTO,
    ) : ReactNode {
        const viewName  : string = view.name;
        const language  : string = view.language  ?? definitions.language  ?? 'en';
        const publicUrl : string = view.publicUrl ?? definitions.publicUrl ?? '';
        const style     : HyperStyleDTO = view.style ?? {};
        const meta      : ReadonlyJsonObject = view.meta ?? {};
        LOG.debug(`Initializing view: `, viewName);
        return (
            <LazyHyperView
                name={viewName}
                language={language}
                publicUrl={publicUrl}
                routePath={routePath}
                style={style}
                meta={meta}
            >{renderer.renderContent( view.content, definitions )}</LazyHyperView>
        );
    }

    /**
     *
     * @param renderer
     * @param content
     * @param definitions
     */
    public static defaultRenderComponent (
        renderer    : HyperRenderer,
        content     : HyperComponentDTO,
        definitions : HyperDTO,
    ) : ReactNode {

        const populatedComponent : HyperComponentDTO = populateHyperComponentDTO(content, definitions.components);

        if (populatedComponent.name === HyperComponent.Article) {
            return <HyperArticle>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</HyperArticle>
        }

        return <>{JSON.stringify(content)}</>;
    }

    /**
     *
     * @param renderer
     * @param content
     * @param definitions
     */
    public static defaultRenderContent (
        renderer    : HyperRenderer,
        content     : undefined | HyperComponentContent,
        definitions : HyperDTO,
    ) : ReactNode {

        const internalRoutePaths : readonly string[] = map(
            definitions?.routes,
            (route: HyperRouteDTO) : string => route.path
        );

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

            if (populatedComponent.name === HyperComponent.ActionButton) {

                // FIXME: This should default to the current route
                const hrefData = content?.meta?.href;
                const href : string | undefined = isString(hrefData) ? hrefData : undefined;

                const methodData = content?.meta?.method;
                const method : string | undefined = isString(methodData) ? methodData : undefined;

                // FIXME: This should default to the current route
                const successRedirectData = content?.meta?.successRedirect;
                const successRedirect : string | HyperAction | undefined = isHyperActionOrStringOrUndefined(successRedirectData) ? successRedirectData : undefined;

                // FIXME: This should default to the current route
                const failureRedirectData = content?.meta?.failureRedirect;
                const failureRedirect : string | HyperAction | undefined = isHyperActionOrStringOrUndefined(failureRedirectData) ? failureRedirectData : undefined;

                const body = content?.meta?.body;

                return (
                    <HyperActionButton
                        target={href}
                        method={method}
                        successRedirect={successRedirect}
                        failureRedirect={failureRedirect}
                        body={body}
                    >{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</HyperActionButton>
                );
            }

            if (populatedComponent.name === HyperComponent.Article) {
                return <HyperArticle>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</HyperArticle>;
            }

            if (populatedComponent.name === HyperComponent.Table) {
                return <table>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</table>;
            }

            if (populatedComponent.name === HyperComponent.TableRow) {
                return <tr>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</tr>;
            }

            if (populatedComponent.name === HyperComponent.TableColumn) {
                return <td>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</td>;
            }

            if (populatedComponent.name === HyperComponent.Button) {
                return <Button>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</Button>;
            }

            if (populatedComponent.name === HyperComponent.LinkButton) {
                const hrefData = populatedComponent.meta?.href;
                const href : string = isString(hrefData) ? hrefData : '#';
                if (internalRoutePaths.includes(href)) {
                    return <Link className={"hg-button"} to={ href }>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</Link>
                }
                return <a className={"hg-button"} href={ href }>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</a>
            }

            if (populatedComponent.name === HyperComponent.Link) {
                const hrefData = populatedComponent.meta?.href;
                const href : string = isString(hrefData) ? hrefData : '#';
                if (internalRoutePaths.includes(href)) {
                    return <Link to={ href }>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</Link>
                }
                return <a href={ href }>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</a>
            }

            if (populatedComponent.name === HyperComponent.Div) {
                return <div>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</div>
            }

            if (populatedComponent.name === HyperComponent.Span) {
                return <span>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</span>
            }

            if (populatedComponent.name === HyperComponent.H1) {
                return <h1>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</h1>
            }

            if (populatedComponent.name === HyperComponent.H2) {
                return <h1>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</h1>
            }

            if (populatedComponent.name === HyperComponent.H2) {
                return <h2>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</h2>
            }

            if (populatedComponent.name === HyperComponent.H3) {
                return <h3>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</h3>
            }

            if (populatedComponent.name === HyperComponent.H4) {
                return <h4>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</h4>
            }

            if (populatedComponent.name === HyperComponent.H5) {
                return <h5>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</h5>
            }

            if (populatedComponent.name === HyperComponent.H6) {
                return <h6>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</h6>
            }

            if (populatedComponent.name === HyperComponent.Paragraph) {
                return <p>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</p>
            }

            if (populatedComponent.name === HyperComponent.Image) {
                return <img src={ isString(populatedComponent.meta?.src) ? populatedComponent.meta?.src : '#' } alt={ isString(populatedComponent.meta?.alt) ? populatedComponent.meta?.alt : '' }>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</img>
            }

            if (populatedComponent.name === HyperComponent.Card) {
                return <div className={"hyper-card"}>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</div>
            }

            if (populatedComponent.name === HyperComponent.Accordion) {
                return <div className={"hyper-accordion"}>{HyperRendererImpl.defaultRenderContent(renderer, content.content, definitions)}</div>
            }

        }

        if (isString(content)) {
            return <>{content}</>;
        }

        return <>{JSON.stringify(content)}</>;
    }

}
