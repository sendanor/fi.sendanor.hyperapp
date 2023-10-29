// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { HyperDTO } from "../../../hyperstack/dto/HyperDTO";
import { HyperRenderer } from "../../renderers/HyperRenderer";

export interface HyperProps {

    /**
     * The hyper stack application definition
     */
    readonly definitions : HyperDTO;

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
    console.log('WOOT: Hyper: definitions = ', definitions);
    return renderer.renderApp(
        definitions,
    );
}
