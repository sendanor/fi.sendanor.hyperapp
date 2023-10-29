// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReactNode } from "react";
import { HyperComponentContent, HyperComponentDTO } from "../../hyperstack/dto/HyperComponentDTO";
import { HyperDTO } from "../../hyperstack/dto/HyperDTO";
import { HyperRouteDTO } from "../../hyperstack/dto/HyperRouteDTO";
import { HyperViewDTO } from "../../hyperstack/dto/HyperViewDTO";
import { HyperRoute } from "../components/types/HyperRoute";

export interface HyperAppRenderer {
    (
        definitions : HyperDTO,
    ) : ReactNode;
}

export interface HyperViewRenderer {
    (
        view        : HyperViewDTO,
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
     * @param definitions
     */
    renderApp (
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
     * @param definitions
     */
    renderRoute (
        item        : HyperRouteDTO,
        definitions : HyperDTO,
    ) : HyperRoute;

    /**
     *
     * @param definitions
     */
    renderRouteList (
        definitions : HyperDTO,
    ) : readonly HyperRoute[];

    /**
     *
     * @param viewName
     * @param routePath
     * @param definitions
     */
    renderView (
        viewName    : string,
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
