// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { ObserverCallback, ObserverDestructor } from "../../../hg/core/Observer";
import { Disposable } from "../../../hg/core/types/Disposable";

export enum HyperServiceEvent {
    UPDATE_APP = "HyperService:updateApp",
    UPDATE_VIEW = "HyperService:updateView",
    ACTIVATE_VIEW = "HyperService:activateView",
    DEACTIVATE_VIEW = "HyperService:deactivateView",
}

export type HyperServiceDestructor = ObserverDestructor;

/**
 * Service which keeps track of state of the Hyper frontend components on the
 * frontend side.
 *
 * This interface describes the static public interface for the `HyperServiceImpl`.
 */
export interface HyperService extends Disposable {

    /**
     *
     */
    Event : HyperServiceEvent;

    /**
     *
     * @param name
     * @param callback
     */
    on (
        name: HyperServiceEvent,
        callback: ObserverCallback<HyperServiceEvent>
    ): HyperServiceDestructor;

    /**
     *
     * @param name
     */
    updateApp (name : string) : void;

    /**
     *
     * @param name
     */
    updateView (name : string) : void;

    /**
     *
     * @param name
     */
    activateView (name : string) : void;

    /**
     *
     * @param name
     */
    deactivateView (name : string) : void;

    /**
     * Returns `true` if the view by name is active.
     *
     * @param name
     */
    isViewActive (name : string) : boolean;

}
