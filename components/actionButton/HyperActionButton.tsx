// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { PropsWithChildren, ReactNode, useCallback } from "react";
import { HttpService } from "../../../../hg/core/HttpService";
import { ReadonlyJsonAny, ReadonlyJsonObject } from "../../../../hg/core/Json";
import { LogService } from "../../../../hg/core/LogService";
import { parseRequestMethod, RequestMethod, stringifyRequestMethod } from "../../../../hg/core/request/types/RequestMethod";
import { Button } from "../../../../hg/frontend/components/button/Button";
import { RouteService } from "../../../../hg/frontend/services/RouteService";
import { HYPER_ARTICLE_CLASS_NAME } from "../../../hyperstack/constants/classNames";
import { PropsWithClassName } from "../types/PropsWithClassName";
import "./HyperActionButton.scss";

const LOG = LogService.createLogger( 'HyperActionButton' );

export interface HyperActionButtonProps
    extends
        PropsWithClassName,
        PropsWithChildren
{
    readonly className ?: string;
    readonly children  ?: ReactNode;
    readonly method    ?: string;
    readonly target    ?: string;
    readonly body      ?: ReadonlyJsonAny | undefined;
    readonly successRedirect ?: string;
    readonly failureRedirect ?: string;
}

async function doRequest (
    m: string,
    url: string,
    body ?: ReadonlyJsonAny | undefined,
) {
    const requestMethod : RequestMethod = m ? parseRequestMethod(m) : RequestMethod.POST;
    LOG.debug(`doRequest: ${m} ${url} with `, body);
    switch(requestMethod) {
        case RequestMethod.GET     : return await HttpService.getJson(url);
        case RequestMethod.POST    : return await HttpService.postJson(url, body);
        case RequestMethod.DELETE  : return await HttpService.deleteJson(url);
        default:
            throw new TypeError(`Unsupported method: ${stringifyRequestMethod(requestMethod)}`);
    }
}

export function HyperActionButton (props: HyperActionButtonProps) {

    const className = props?.className;
    const children = props?.children;
    const method = props?.method ?? "post";
    const target = props?.target;
    const body = props?.body;
    const successRedirect = props?.successRedirect;
    const failureRedirect = props?.failureRedirect;

    const clickCallback = useCallback(
        () => {

            // FIXME: This should default to the current route path
            if (!target) {
                LOG.error(`Target was not defined.`);
                return;
            }

            doRequest(method, target, body).then( () => {
                if (successRedirect) {
                    RouteService.setRoute(successRedirect);
                } else {
                    LOG.info(`Action was successful. No successRedirect defined.`);
                }
            }).catch((err: any) => {
                LOG.error(`Exception: `, err);
                if (failureRedirect) {
                    RouteService.setRoute(failureRedirect);
                }
            });

        }, [
            failureRedirect,
            successRedirect,
            method,
            target,
            body,
        ]
    );

    return (
        <Button
            click={clickCallback}
            className={HYPER_ARTICLE_CLASS_NAME + (className ? ` ${className}` : "")}
        >{children}</Button>
    );

}
