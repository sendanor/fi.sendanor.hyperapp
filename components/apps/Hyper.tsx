// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { useCallback } from "react";
import { useServiceEvent } from "../../../../hg/frontend/hooks/useServiceEvent";
import { HyperDTO } from "../../../hyperstack/dto/HyperDTO";
import { createLoadingAppDefinition } from "../../../hyperstack/samples/loading/LoadingAppDefinition";
import { useHyperDefinitions } from "../../hooks/useHyperDefinitions";
import { HyperRenderer } from "../../renderers/HyperRenderer";
import { HyperServiceEvent } from "../../services/HyperService";
import { HyperServiceImpl } from "../../services/HyperServiceImpl";

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
    'LoadingApp',
    '',
    'en',
);

export function Hyper (
    props : HyperProps
) {
    const renderer : HyperRenderer = props.renderer;
    const definitions : HyperDTO | string = props.definitions;
    const [dto, refreshCallback] = useHyperDefinitions(definitions);

    const updateAppCallback = useCallback(
        (eventName: string, name : string) => {
            // FIXME: Implement better logic
            refreshCallback();
        }, [
            refreshCallback
        ]
    );

    const updateViewCallback = useCallback(
        (eventName: string, name: string) => {
            // FIXME: Implement better logic
            refreshCallback();
        }, [
            refreshCallback
        ]
    );

    // When language in our service changes
    useServiceEvent(
        HyperServiceImpl,
        HyperServiceEvent.UPDATE_APP,
        updateAppCallback,
    );

    // When language in our service changes
    useServiceEvent(
        HyperServiceImpl,
        HyperServiceEvent.UPDATE_VIEW,
        updateViewCallback,
    );

    return renderer.renderApp( dto ?? LOADING_APP );
}
