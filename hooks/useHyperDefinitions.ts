// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { useCallback } from "react";
import { HttpService } from "../../../hg/core/HttpService";
import { ReadonlyJsonAny } from "../../../hg/core/Json";
import { LogService } from "../../../hg/core/LogService";
import { isString } from "../../../hg/core/types/String";
import { RefreshCallback, useAsyncResource } from "../../../hg/frontend/hooks/useAsyncResource";
import { explainHyperDTO, HyperDTO, isHyperDTO } from "../../hyperstack/dto/HyperDTO";
import { populateHyperDTO } from "../../hyperstack/utils/populateHyperDTO";

const LOG = LogService.createLogger( 'useHyperDefinitions' );

/**
 *
 * @param definitions
 */
export function useHyperDefinitions (
    definitions : HyperDTO | string
) : [HyperDTO | null | undefined, RefreshCallback] {
    const callback = useCallback( async () : Promise<HyperDTO> => {

        if (!isString(definitions)) {
            LOG.debug(`Refreshing DTO object:`, definitions);
            return await populateHyperDTO(definitions);
        }

        LOG.debug(`Fetching definition from URL:`, definitions);
        const result : ReadonlyJsonAny | undefined = await HttpService.getJson(definitions);
        if (!isHyperDTO(result)) {
            throw new TypeError(`The response was not HyperDTO: ${explainHyperDTO(result)}`)
        }

        LOG.debug(`Refreshing received DTO object:`, result);
        return await populateHyperDTO(result, result?.publicUrl ?? definitions);

    }, [
        definitions
    ]);
    return useAsyncResource<HyperDTO>( callback );
}
