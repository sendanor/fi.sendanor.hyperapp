// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    PropsWithChildren,
    ReactNode,
    useCallback,
    useEffect,
} from "react";
import { ReadonlyJsonObject } from "../../../../hg/core/Json";
import { LogService } from "../../../../hg/core/LogService";
import { isNumber } from "../../../../hg/core/types/Number";
import { isString } from "../../../../hg/core/types/String";
import { ScrollToHere } from "../../../../hg/frontend/components/common/scrollToHere/ScrollToHere";
import { HYPER_VIEW_CLASS_NAME } from "../../../hyperstack/constants/classNames";
import { getCssStyles, HyperStyleDTO } from "../../../hyperstack/dto/HyperStyleDTO";
import { HyperServiceImpl } from "../../services/HyperServiceImpl";
import { SEO } from "../seo/SEO";
import { useLocation } from "react-router-dom";
import { PropsWithClassName } from "../types/PropsWithClassName";
import { PropsWithLanguage } from "../types/PropsWithLanguage";
import { PropsWithPublicUrl } from "../types/PropsWithPublicUrl";
import { PropsWithRoute } from "../types/PropsWithRoute";
import "./HyperView.scss";

const LOG = LogService.createLogger( 'HyperView' );

export interface HyperViewProps
    extends
        PropsWithRoute,
        PropsWithClassName,
        PropsWithChildren,
        PropsWithPublicUrl,
        PropsWithLanguage
{
    readonly name            : string;
    readonly publicUrl       : string;
    readonly routePath       : string;
    readonly children       ?: ReactNode;
    readonly style          ?: HyperStyleDTO;
    readonly className      ?: string;
    readonly seoTitle       ?: string;
    readonly seoDescription ?: string;
    readonly seoSiteName    ?: string;
    readonly meta           ?: ReadonlyJsonObject;
}

export function HyperView (props: HyperViewProps) {
    const className = props?.className;
    const name : string = props.name;
    const publicUrl : string = props.publicUrl;
    const language : string = props.language;
    const routePath : string = props.routePath;
    const style : HyperStyleDTO = props.style ?? {};
    const seoTitle : string = props?.seoTitle ?? '';
    const seoDescription : string = props?.seoDescription ?? '';
    const seoSiteName : string = props?.seoSiteName ?? '';
    const children = props?.children ?? null;
    const meta : ReadonlyJsonObject = props?.meta ?? {};
    const metaRefresh : number | undefined = isNumber(meta?.refresh) ? meta.refresh : undefined;
    const metaTimestamp : string | undefined = isString(meta?.timestamp) ? meta.timestamp : undefined;

    const location = useLocation();

    const updateViewCallback = useCallback(
        () => {
            LOG.debug(`Updating view: `, name);
            HyperServiceImpl.updateView(name);
        },
        [
            name
        ]
    );

    // Handle view activation and deactivation
    useEffect( () => {
        LOG.debug(`Activate view: `, name);
        HyperServiceImpl.activateView(name);
        return () : void => {
            LOG.debug(`Deactivate view: `, name);
            HyperServiceImpl.deactivateView(name);
        };
    }, [
        name,
    ] );

    // Handle view refreshing
    useEffect(() => {

        let timeout : any | undefined = undefined;

        if (metaRefresh !== undefined) {

            // These logging lines with metaTimestamp are important and implement a desired functionality, e.g. if
            // timestamp changes the timer should also reset. This way the timer is loaded again after a refresh, and it
            // implements interval updating. Probably not the best and most easily readable way to do it, but it works.
            if (metaTimestamp) {
                LOG.debug(`Enabling refresh for "${name}" from ${metaTimestamp} after ${metaRefresh} ms`);
            } else {
                LOG.debug(`Enabling refresh for "${name}" after ${metaRefresh} ms`);
            }
            timeout = setTimeout(
                () => {
                    LOG.debug(`Timeout reached: Refreshing view "${name}"`);
                    timeout = undefined;
                    updateViewCallback();
                },
                metaRefresh
            );
        }

        return () : void => {
            if (timeout !== undefined) {
                LOG.debug(`Disabling refresh for "${name}"`);
                clearTimeout(timeout);
                timeout = undefined;
            }
        };

    }, [
        name,
        updateViewCallback,
        metaRefresh,
        metaTimestamp,
    ]);

    return (
        <div
            className={
                HYPER_VIEW_CLASS_NAME
                + (className? ` ${className}` : '')
            }
            style={getCssStyles(style)}>
            {location.pathname === routePath ? (
                <>
                    <SEO
                        publicUrl={publicUrl}
                        language={language}
                        title={seoTitle}
                        description={seoDescription}
                        siteName={seoSiteName}
                    />
                    <ScrollToHere path={routePath} />
                </>
            ) : null}
            {children}
        </div>
    );
}
