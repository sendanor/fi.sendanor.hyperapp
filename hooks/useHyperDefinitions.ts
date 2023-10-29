// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { useCallback } from "react";
import { HttpService } from "../../../hg/core/HttpService";
import { isString } from "../../../hg/core/types/String";
import { RefreshCallback, useAsyncResource } from "../../../hg/frontend/hooks/useAsyncResource";
import { explainHyperDTO, HyperDTO, isHyperDTO } from "../../hyperstack/dto/HyperDTO";

export function useHyperDefinitions (
    definitions : HyperDTO | string
) : [HyperDTO | null | undefined, RefreshCallback] {
    const callback = useCallback( async () => {
        if (!isString(definitions)) {
            return definitions;
        }
        const result = await HttpService.getJson(definitions);
        if (!isHyperDTO(result)) {
            throw new TypeError(`The response was not HyperDTO: ${explainHyperDTO(result)}`)
        }
        return result;
    }, [
        definitions
    ]);
    return useAsyncResource<HyperDTO>( callback );
}