// Copyright (c) 2022-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { PropsWithChildren, ReactNode } from "react";
import { ScrollToHere } from "../../../../hg/frontend/components/common/scrollToHere/ScrollToHere";
import { HYPER_VIEW_CLASS_NAME } from "../../../hyperstack/constants/classNames";
import { getCssStyles, HyperStyleDTO } from "../../../hyperstack/dto/HyperStyleDTO";
import { SEO } from "../seo/SEO";
import { useLocation } from "react-router-dom";
import { PropsWithClassName } from "../types/PropsWithClassName";
import { PropsWithLanguage } from "../types/PropsWithLanguage";
import { PropsWithPublicUrl } from "../types/PropsWithPublicUrl";
import { PropsWithRoute } from "../types/PropsWithRoute";
import "./HyperView.scss";

export interface HyperViewProps
    extends
        PropsWithRoute,
        PropsWithClassName,
        PropsWithChildren,
        PropsWithPublicUrl,
        PropsWithLanguage
{
    readonly publicUrl       : string;
    readonly routePath       : string;
    readonly children       ?: ReactNode;
    readonly style          ?: HyperStyleDTO;
    readonly className      ?: string;
    readonly seoTitle       ?: string;
    readonly seoDescription ?: string;
    readonly seoSiteName    ?: string;
}

export function HyperView (props: HyperViewProps) {
    const className = props?.className;
    const publicUrl : string = props.publicUrl;
    const language : string = props.language;
    const routePath : string = props.routePath;
    const style : HyperStyleDTO = props.style ?? {};
    const seoTitle : string = props?.seoTitle ?? '';
    const seoDescription : string = props?.seoDescription ?? '';
    const seoSiteName : string = props?.seoSiteName ?? '';
    const children = props?.children ?? null;
    const location = useLocation();
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
