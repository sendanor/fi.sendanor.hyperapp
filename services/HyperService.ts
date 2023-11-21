// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { LogService } from "../../../hg/core/LogService";
import { Observer, ObserverCallback, ObserverDestructor } from "../../../hg/core/Observer";

const LOG = LogService.createLogger( 'HyperService' );

export enum HyperServiceEvent {
    UPDATE_APP = "HyperService:updateApp",
    UPDATE_VIEW = "HyperService:updateView",
}

export type HyperServiceDestructor = ObserverDestructor;

export class HyperService {

    private static _observer: Observer<HyperServiceEvent> = new Observer<HyperServiceEvent>( "HyperService" );

    public static Event = HyperServiceEvent;

    public static on (
        name: HyperServiceEvent,
        callback: ObserverCallback<HyperServiceEvent>
    ): HyperServiceDestructor {
        return this._observer.listenEvent( name, callback );
    }

    public static destroy (): void {
        this._observer.destroy();
    }

    public static updateApp (name : string) : void {
        this._observer.triggerEvent(HyperServiceEvent.UPDATE_APP, name);
    }

    public static updateView (name : string) : void {
        this._observer.triggerEvent(HyperServiceEvent.UPDATE_VIEW, name);
    }

}
