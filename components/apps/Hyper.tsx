// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    useCallback,
    useEffect,
    useState,
} from "react";
import { LogService } from "../../../../hg/core/LogService";
import { useServiceEvent } from "../../../../hg/frontend/hooks/useServiceEvent";
import {
    HyperDTO,
} from "../../../hyperstack/dto/HyperDTO";
import { HyperRenderer } from "../../renderers/HyperRenderer";
import { HyperServiceEvent } from "../../services/HyperService";
import { HyperServiceImpl } from "../../services/HyperServiceImpl";

export interface HyperProps {

    /**
     * The URL where to fetch hyper stack application definitions
     */
    readonly url : string;

    /**
     * The Hyper Application renderer
     */
    readonly renderer : HyperRenderer;

}

const LOG = LogService.createLogger( 'Hyper' );

export function Hyper (
    props : HyperProps
) {

    const renderer : HyperRenderer = props.renderer;
    const url : string = props.url;

    const [dto, setDto] = useState<HyperDTO>(
        () => HyperServiceImpl.getAppDefinitions()
    );

    const updateDtoCallback = useCallback(
        () : void => {
            LOG.debug(`Updating definitions from event`);
            setDto( () => HyperServiceImpl.getAppDefinitions() );
        }, [
        ],
    );

    useServiceEvent(
        HyperServiceImpl,
        HyperServiceEvent.APP_DEFINITIONS_UPDATED,
        updateDtoCallback,
    );

    useEffect(() => {
        LOG.debug(`Initializing URL: `, url);
        HyperServiceImpl.setUrl(url);
        return () : void => {
            LOG.debug(`Uninitialized URL: `, url);
            HyperServiceImpl.unsetUrl();
        };
    }, [
        url,
    ]);

    return renderer.renderApp( dto );
}
