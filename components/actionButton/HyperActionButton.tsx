// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { PropsWithChildren, ReactNode, useCallback } from "react";
import { HttpService } from "../../../../hg/core/HttpService";
import { ReadonlyJsonAny } from "../../../../hg/core/Json";
import { LogService } from "../../../../hg/core/LogService";
import { parseRequestMethod, RequestMethod, stringifyRequestMethod } from "../../../../hg/core/request/types/RequestMethod";
import { isString } from "../../../../hg/core/types/String";
import { Button } from "../../../../hg/frontend/components/button/Button";
import { RouteService } from "../../../../hg/frontend/services/RouteService";
import { HYPER_ARTICLE_CLASS_NAME } from "../../../hyperstack/constants/classNames";
import { isHyperViewDTO } from "../../../hyperstack/dto/HyperViewDTO";
import { HyperAction, isHyperAction } from "../../../hyperstack/types/HyperAction";
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
    readonly successRedirect ?: string | HyperAction | undefined;
    readonly failureRedirect ?: string | HyperAction | undefined;
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

async function handleRedirect (
    redirect: HyperAction | string | undefined,
    response: ReadonlyJsonAny | undefined,
) : Promise<void> {

    if (isString(redirect)) {
        RouteService.setRoute( redirect );
        return;
    }

    if (isHyperAction(redirect)) {
        try {
            const method = redirect.method ?? "POST";
            const target = redirect.target;
            const body = redirect?.body ?? response;
            LOG.debug(`Calling ${method} ${target} with `, body);
            const nextResponse : ReadonlyJsonAny | undefined = await doRequest(
                method,
                target,
                body,
            );
            LOG.debug(`Response from ${method} ${target}: `, nextResponse);

            if (redirect.successRedirect === undefined && isHyperViewDTO(nextResponse) && nextResponse.extend ) {
                RouteService.setRoute( nextResponse.extend );
                return;
            }

            return await handleRedirect(redirect.successRedirect, nextResponse);
        } catch (err : any) {
            LOG.error(`handleRedirect: Exception: `, err);
            return await handleRedirect(redirect.errorRedirect, err);
        }
    }

    if (redirect === undefined) {
        LOG.info(`handleRedirect: No redirect defined.`);
    } else {
        LOG.warn(`Warning! Redirection object was not recognized: `, redirect);
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

            doRequest(
                method,
                target,
                body
            ).then( async (response) : Promise<void> => {
                await handleRedirect(successRedirect, response);
            }).catch( async (err: any) => {
                LOG.error(`Exception: `, err);
                await handleRedirect(failureRedirect, err);
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
