// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReactNode } from "react";
import { explain, explainNot, explainOk, explainOr, explainProperty } from "../../../../hg/core/types/explain";
import { explainNoOtherKeysInDevelopment, hasNoOtherKeysInDevelopment } from "../../../../hg/core/types/OtherKeys";
import { explainRegularObject, isRegularObject } from "../../../../hg/core/types/RegularObject";
import { explainString, explainStringOrUndefined, isString, isStringOrUndefined } from "../../../../hg/core/types/String";
import { isUndefined } from "../../../../hg/core/types/undefined";

export interface HyperRoute {
    readonly path        : string;
    readonly language   ?: string;
    readonly publicUrl  ?: string;
    readonly redirect   ?: string;
    readonly element    ?: ReactNode;
}

export function createHyperRoute (
    path      : string,
    language  : string | undefined,
    publicUrl : string | undefined,
    redirect  : string | undefined,
    element   : ReactNode,
) : HyperRoute {
    return {
        path,
        language,
        publicUrl,
        redirect,
        element,
    };
}

export function isHyperRoute (value: unknown) : value is HyperRoute {
    return (
        isRegularObject(value)
        && hasNoOtherKeysInDevelopment(value, [
            'path',
            'language',
            'publicUrl',
            'redirect',
            'element',
        ])
        && isString(value?.path)
        && isStringOrUndefined(value?.language)
        && isStringOrUndefined(value?.publicUrl)
        && isStringOrUndefined(value?.redirect)
    );
}

export function explainHyperRoute (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeysInDevelopment(value, [
                'path',
                'language',
                'publicUrl',
                'redirect',
                'element',
            ])
            , explainProperty("path", explainString(value?.path))
            , explainProperty("language", explainStringOrUndefined(value?.language))
            , explainProperty("publicUrl", explainStringOrUndefined(value?.publicUrl))
            , explainProperty("redirect", explainStringOrUndefined(value?.redirect))
        ]
    );
}

export function stringifyHyperRoute (value : HyperRoute) : string {
    return `HyperRoute(${value})`;
}

export function parseHyperRoute (value: unknown) : HyperRoute | undefined {
    if (isHyperRoute(value)) return value;
    return undefined;
}

export function isHyperRouteOrUndefined (value: unknown): value is HyperRoute | undefined {
    return isUndefined(value) || isHyperRoute(value);
}

export function explainHyperRouteOrUndefined (value: unknown): string {
    return isHyperRouteOrUndefined(value) ? explainOk() : explainNot(explainOr(['HyperRoute', 'undefined']));
}
