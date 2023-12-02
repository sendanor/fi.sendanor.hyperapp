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
import {
    ActionDTO,
    isActionDTO,
} from "../../../hyperstack/dto/ActionDTO";
import { StyleDTO } from "../../../hyperstack/dto/StyleDTO";
import {
    ViewDTO,
    isViewDTO,
} from "../../../hyperstack/dto/ViewDTO";
import { StyleEntity } from "../../../hyperstack/entities/StyleEntity";
import { AppServiceImpl } from "../../services/AppServiceImpl";
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
    readonly successRedirect ?: string | ActionDTO | undefined;
    readonly failureRedirect ?: string | ActionDTO | undefined;
    readonly style     ?: StyleDTO;
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
    redirect: ViewDTO | ActionDTO | string | undefined,
    response: ReadonlyJsonAny | undefined,
) : Promise<void> {

    if ( redirect === undefined && isViewDTO(response) && response.name ) {

        const location = response?.meta?.location;
        if (isString(location)) {
            LOG.debug(`Redirecting to `, location);
            RouteService.setRoute(location);
            return;
        }

        AppServiceImpl.saveViewDTO(response);
        const path : string | undefined = AppServiceImpl.getRoutePathByViewName(response.name);
        if (path) {
            LOG.debug(`Redirecting to `, path);
            RouteService.setRoute( path );
        } else {
            LOG.warn(`Warning! Could not find route for name: ${response.name}`);
        }
        return;
    }

    if ( isViewDTO(redirect) && redirect.name ) {
        const location = redirect?.meta?.location;
        if (isString(location)) {
            LOG.debug(`Redirecting to `, location);
            RouteService.setRoute(location);
            return;
        }

        AppServiceImpl.saveViewDTO(redirect);
        const path : string | undefined = AppServiceImpl.getRoutePathByViewName(redirect.name);
        if (path) {
            LOG.debug(`Redirecting to `, path);
            RouteService.setRoute( path );
        } else {
            LOG.warn(`Warning! Could not find route for name: ${redirect.name}`);
        }
        return;
    }

    if (isString(redirect)) {
        const path : string | undefined = AppServiceImpl.getRoutePathByViewName(redirect);
        if (path) {
            LOG.debug(`Redirecting to `, path);
            RouteService.setRoute( path );
            return
        }
        const routePath : string | undefined = AppServiceImpl.getRoutePathByRouteName(redirect);
        if (routePath) {
            LOG.debug(`Redirecting to `, routePath);
            RouteService.setRoute( routePath );
            return
        }
        LOG.debug(`Redirecting to `, redirect);
        RouteService.setRoute( redirect );
        return;
    }

    if (isActionDTO(redirect)) {
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

            const location = (nextResponse as any)?.meta?.location;
            if (isString(location)) {
                LOG.debug(`Redirecting to: `, location);
                RouteService.setRoute(location);
                return;
            }

            if (redirect.successRedirect) {
                return await handleRedirect(redirect.successRedirect, nextResponse);
            }

            if (isViewDTO(nextResponse)) {
                return await handleRedirect(nextResponse, undefined);
            }

            LOG.warn(`Warning! Could not handle response: `, nextResponse);
            return;
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
    const style = props?.style;
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

                const location = (response as any)?.meta?.location;
                if (isString(location)) {
                    LOG.debug(`Redirecting to: `, location);
                    RouteService.setRoute(location);
                    return;
                }

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
            css={ StyleEntity.createFromDTO(style).getCssStyles() }
            click={clickCallback}
            className={HYPER_ARTICLE_CLASS_NAME + (className ? ` ${className}` : "")}
        >{children}</Button>
    );

}
