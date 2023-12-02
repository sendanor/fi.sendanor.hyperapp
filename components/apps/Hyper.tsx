// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    useCallback,
    useEffect,
    useState,
} from "react";
import { LogService } from "../../../../hg/core/LogService";
import { useServiceEvent } from "../../../../hg/frontend/hooks/useServiceEvent";
import {
    AppDTO,
} from "../../../hyperstack/dto/AppDTO";
import { HyperRenderer } from "../../renderers/HyperRenderer";
import { AppServiceEvent } from "../../services/AppServiceType";
import { AppServiceImpl } from "../../services/AppServiceImpl";

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

    const [dto, setDto] = useState<AppDTO>(
        () => AppServiceImpl.getAppDefinitions()
    );

    const updateDtoCallback = useCallback(
        () : void => {
            LOG.debug(`Updating definitions from event`);
            setDto( () => AppServiceImpl.getAppDefinitions() );
        }, [
        ],
    );

    useServiceEvent(
        AppServiceImpl,
        AppServiceEvent.APP_DEFINITIONS_UPDATED,
        updateDtoCallback,
    );

    useEffect(() => {
        LOG.debug(`Initializing URL: `, url);
        AppServiceImpl.setUrl(url);
        return () : void => {
            LOG.debug(`Uninitialized URL: `, url);
            AppServiceImpl.unsetUrl();
        };
    }, [
        url,
    ]);

    return renderer.renderApp( dto );
}
