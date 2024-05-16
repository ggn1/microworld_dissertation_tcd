import Planner from "./Planner.js"
import Environment from "./Environment.js"
import { Timber, HuntingFishing, EcosystemServices, NTFP } from "./IncomeSource.js"

export default class Simulation {
    /** This class shall encapsulate the
     *  entire simulated world. */

    constructor() {
        this.time = 0
        this.funds = JSON.parse(process.env.NEXT_PUBLIC_FUNDS_BASE)
        const income_sources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
        this.resources = {
            timber: new Timber(
                income_sources.timber.unit,
                income_sources.timber.price_per_unit
            ),
            ntfp: new NTFP(
                income_sources.ntfp.unit,
                income_sources.ntfp.price_per_unit
            ),
            hunting_fishing: new HuntingFishing(
                income_sources.hunting_fishing.unit,
                income_sources.hunting_fishing.price_per_unit
            )
        }
        this.env = new Environment()
        this.planner = new Planner()
    }

    #initialize() {
        // TO DO ...
    }

    play() {
        // TO DO ...
    }

    pause() {
        // TO DO ...
    }

    reset() {
        // TO DO ...
    }

    goto() {
        // TO DO ...
    }
}