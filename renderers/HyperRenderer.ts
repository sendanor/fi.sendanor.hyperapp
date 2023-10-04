// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReactNode } from "react";
import { HyperAppDTO } from "../../hyperstack/dto/HyperAppDTO";
import { HyperComponentContent, HyperComponentDTO } from "../../hyperstack/dto/HyperComponentDTO";
import { HyperDTO } from "../../hyperstack/dto/HyperDTO";
import { HyperRouteDTO } from "../../hyperstack/dto/HyperRouteDTO";
import { HyperViewDTO } from "../../hyperstack/dto/HyperViewDTO";
import { HyperRoute } from "../components/types/HyperRoute";

export interface HyperAppRenderer {
    (
        app         : HyperAppDTO,
        definitions : HyperDTO,
    ) : ReactNode;
}

export interface HyperViewRenderer {
    (
        view        : HyperViewDTO,
        app         : HyperAppDTO,
        routePath   : string,
        definitions : HyperDTO,
    ) : ReactNode;
}

export interface HyperContentRenderer {
    (
        content     : undefined | HyperComponentContent,
        definitions : HyperDTO,
    ) : ReactNode;
}

export interface HyperComponentRenderer {
    (
        component   : HyperComponentDTO,
        definitions : HyperDTO,
    ) : ReactNode;
}

export interface HyperRouteRenderer {
    (
        item        : HyperRouteDTO,
        app         : HyperAppDTO,
        definitions : HyperDTO,
    ) : HyperRoute;
}

export interface HyperRenderer {

    /**
     * Attach custom app renderer.
     * @param f
     */
    attachAppRenderer (f : HyperAppRenderer) : void;

    /**
     *
     * @param appName
     * @param definitions
     */
    renderApp (
        appName     : string,
        definitions : HyperDTO,
    ) : ReactNode;

    /**
     *
     * @param f
     */
    attachRouteRenderer (f : HyperRouteRenderer) : void;

    /**
     *
     * @param item
     * @param app
     * @param definitions
     */
    renderRoute (
        item        : HyperRouteDTO,
        app         : HyperAppDTO,
        definitions : HyperDTO,
    ) : HyperRoute;

    /**
     *
     * @param appName
     * @param definitions
     */
    renderRouteList (
        appName     : string,
        definitions : HyperDTO,
    ) : readonly HyperRoute[];

    /**
     *
     * @param viewName
     * @param appName
     * @param routePath
     * @param definitions
     */
    renderView (
        viewName    : string,
        appName     : string,
        routePath   : string,
        definitions : HyperDTO,
    ) : ReactNode;

    /**
     *
     * @param content
     * @param definitions
     */
    renderContent (
        content     : undefined | HyperComponentContent,
        definitions : HyperDTO,
    ) : ReactNode;

}
