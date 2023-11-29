// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    useCallback,
    useEffect,
    useState,
} from "react";
import { LogService } from "../../../../hg/core/LogService";
import {
    HyperView,
    HyperViewProps,
} from "./HyperView";

const LOG = LogService.createLogger( 'LazyHyperView' );

/**
 * How long to wait until activating the view
 */
const DEFAULT_LAZY_LOAD_TIME = 500;

export function LazyHyperView ( props: HyperViewProps) {

    const viewName : string = props.name;
    const [ isActive, setActive ] = useState<boolean>(false);

    const activateCallback = useCallback(
        () : void => {
            LOG.debug(`activateCallback: Activating view: ${viewName}`);
            setActive( () : boolean => true );
        }, [
            viewName
        ]
    );

    useEffect( () => {

        let timeout : any | undefined = setTimeout(
            (): void => {
                timeout = undefined;
                activateCallback();
            },
            DEFAULT_LAZY_LOAD_TIME
        );

        return () : void => {
            if (timeout !== undefined) {
                clearTimeout(timeout);
                timeout = undefined;
            }
        };

    }, [
        activateCallback
    ]);

    if (!isActive) {
        LOG.debug(`View not activated yet: `, viewName);
        return <></>;
    }

    LOG.debug(`Rendering view: `, viewName);
    return (
        <HyperView
            name={viewName}
            language={props.language}
            publicUrl={props.publicUrl}
            routePath={props.routePath}
            style={props.style}
            meta={props.meta}
        >{props.children}</HyperView>
    );
}
