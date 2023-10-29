// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { HyperDTO } from "../../../hyperstack/dto/HyperDTO";
import { createLoadingAppDefinition } from "../../../hyperstack/samples/loading/LoadingAppDefinition";
import { useHyperDefinitions } from "../../hooks/useHyperDefinitions";
import { HyperRenderer } from "../../renderers/HyperRenderer";

export interface HyperProps {

    /**
     * The hyper stack application definition or URL to the definition
     */
    readonly definitions : HyperDTO | string;

    /**
     * The node renderer
     */
    readonly renderer : HyperRenderer;

}

const LOADING_APP = createLoadingAppDefinition(
    'loadingApp',
    '',
    'en',
);

export function Hyper (
    props : HyperProps
) {
    const renderer : HyperRenderer = props.renderer;
    const definitions : HyperDTO | string = props.definitions;
    const [dto] = useHyperDefinitions(definitions);
    return renderer.renderApp( dto ?? LOADING_APP );
}
