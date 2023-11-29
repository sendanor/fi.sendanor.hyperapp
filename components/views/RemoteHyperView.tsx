// Copyright (c) 2022-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { ReactNode, useState } from "react";
import { startsWith } from "../../../../hg/core/functions/startsWith";
import { HttpService } from "../../../../hg/core/HttpService";
import { ReadonlyJsonObject } from "../../../../hg/core/Json";
import { LogService } from "../../../../hg/core/LogService";
import { HyperDTO } from "../../../hyperstack/dto/HyperDTO";
import { HyperStyleDTO } from "../../../hyperstack/dto/HyperStyleDTO";
import { explainHyperViewDTO, HyperViewDTO, isHyperViewDTO } from "../../../hyperstack/dto/HyperViewDTO";
import { PropsWithClassName } from "../types/PropsWithClassName";
import { HyperView } from "./HyperView";
import "./RemoteHyperView.scss";

const LOG = LogService.createLogger( 'RemoteHyperView' );

export interface RemoteHyperViewProps
    extends
        PropsWithClassName
{
    readonly children       ?: ReactNode;
    readonly className      ?: string;
    readonly publicUrl      ?: string;
    readonly routePath       : string,
    readonly view            : HyperViewDTO;
    readonly definitions     : HyperDTO,

}

export function RemoteHyperView (props: RemoteHyperViewProps) {
    const className = props?.className;
    const origView : HyperViewDTO = props.view;
    const routePath : string = props.routePath;
    const definitions : HyperDTO = props.definitions;
    const children = props?.children ?? null;
    const publicUrl : string = props?.publicUrl ?? origView?.publicUrl ?? definitions.publicUrl ?? '';

    const [view, setView] = useState<HyperViewDTO>(origView);

    let viewName : string = view.name;
    if (startsWith(viewName, '/')) {
        viewName = `${publicUrl}${viewName}`;
    }

    if (startsWith(viewName, 'http://') || startsWith(viewName, 'https://')) {
        HttpService.getJson(viewName).then((result) => {
            if (isHyperViewDTO(result)) {
                setView(result);
            } else {
                LOG.debug(`RemoteHyperView: result = `, result);
                LOG.error(`RemoteHyperView: Invalid result from "${viewName}": ${explainHyperViewDTO(result)}`);
            }
        }).catch((err) => {
            LOG.error(`RemoteHyperView: Failed to fetch resource "${viewName}": `, err);
        });
    }

    const language  : string             = view?.language  ?? definitions.language  ?? 'en';
    const style     : HyperStyleDTO      = view?.style     ?? {};
    const meta      : ReadonlyJsonObject = view?.meta      ?? {};
    return (
        <HyperView
            className={className}
            name={viewName}
            language={language}
            publicUrl={publicUrl}
            routePath={routePath}
            style={style}
            meta={meta}
        >{children}</HyperView>
    );
}
