// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { PropsWithChildren, ReactNode } from "react";
import { HYPER_ARTICLE_CLASS_NAME } from "../../../hyperstack/constants/classNames";
import { PropsWithClassName } from "../types/PropsWithClassName";
import "./HyperArticle.scss";

export interface HyperArticleProps
    extends
        PropsWithClassName,
        PropsWithChildren
{
    readonly className ?: string;
    readonly children  ?: ReactNode;
}

export function HyperArticle (props: HyperArticleProps) {
    const className = props?.className;
    const children = props?.children;
    return (
        <article className={HYPER_ARTICLE_CLASS_NAME + (className ? ` ${className}` : "")}>{children}</article>
    );
}
