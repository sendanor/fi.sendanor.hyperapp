// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { filter } from "../../../hg/core/functions/filter";
import { LogService } from "../../../hg/core/LogService";
import { Observer, ObserverCallback } from "../../../hg/core/Observer";
import { HyperServiceDestructor, HyperServiceEvent } from "./HyperService";

const LOG = LogService.createLogger( 'HyperServiceImpl' );

export class HyperServiceImpl {

    private static _activeViews : string[] = [];

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
        LOG.debug(`App updated: `, name);
        this._observer.triggerEvent(HyperServiceEvent.UPDATE_APP, name);
    }

    public static updateView (name : string) : void {
        LOG.debug(`View updated: `, name);
        this._observer.triggerEvent(HyperServiceEvent.UPDATE_VIEW, name);
    }

    public static isViewActive (name : string) : boolean {
        return this._activeViews.includes(name);
    }

    public static activateView (name : string) : void {
        LOG.debug(`View activated: `, name);
        this._activeViews.push(name);
        this._observer.triggerEvent(HyperServiceEvent.ACTIVATE_VIEW, name);
        this.updateView(name);
    }

    public static deactivateView (name : string) : void {

        LOG.debug(`View deactivated: `, name);

        // Remove the last occurrence of the name (there might be multiple stacked)
        const removeIndex : number = this._activeViews.lastIndexOf(name);
        this._activeViews = filter(
            this._activeViews,
            (_item: string, i : number) : boolean => i !== removeIndex
        );

        this._observer.triggerEvent(HyperServiceEvent.DEACTIVATE_VIEW, name);

    }

}
