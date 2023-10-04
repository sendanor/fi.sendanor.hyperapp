// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { HyperDTO } from "../../../hyperstack/dto/HyperDTO";
import { HyperRenderer } from "../../renderers/HyperRenderer";

export interface HyperProps {

    /**
     * The hyper stack application definition
     */
    readonly definitions : HyperDTO;

    /**
     * The name of the app to use
     */
    readonly app : string;

    /**
     * The node renderer
     */
    readonly renderer : HyperRenderer;

}

export function Hyper (
    props : HyperProps
) {
    const renderer : HyperRenderer = props.renderer;
    const definitions : HyperDTO = props.definitions;
    const appName : string = props.app;
    console.log('WOOT: Hyper: definitions = ', appName, definitions);
    return renderer.renderApp(
        appName,
        definitions,
    );
}
