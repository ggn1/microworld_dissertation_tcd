import Planner from "./Planner.js"
import Environment from "./Environment.js"
import { Timber, HuntingFishing, EcosystemServices, NTFP } from "./IncomeSource.js"

export default class Simulation {
    /** This class shall encapsulate the
     *  entire simulated world. */

    #income_sources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
    #updateSimUI

    constructor(updateSimUI) {
        /**
         * Constructor.
         * @param updateSimUI: Function that may be called after each
         *                   time step update with latest simulation
         *                   state to update the UI.
         */
        this.#createFreshWorld()
        this.planner = new Planner()
        this.#updateSimUI = updateSimUI
        this.goto = (time) => {
            /** 
             * Given a point in time, runs the simulation
             * up to that point in time. 
             */

            // Get the no. of steps from given 
            // time step, computations must be made.
            let timesteps = time - this.time
            if (timesteps < 0) {
                timesteps = time
                this.#createFreshWorld() // Reset world.
                this.#updateSimUI()
            }

            // For as manu timesteps as required, 
            // compute forward in time.
            // If the given time was in the past,
            // then, start fresh and start computing
            // forward from there for desired no.
            // of steps.
            if (timesteps > 0) {
                for (let t=0; t<timesteps; t++) {
                    this.#takeTimeStep()
                }
            }
        }
    }

    #takeTimeStep() {
        /** Step forward in time by one step. */
        this.time += 1
        this.env.land.takeTimeStep()
        this.#updateSimUI()
        // this.plan.takeTimeStep()
    } 

    #createFreshWorld() {
        /** Initializes the simulation with starting world state. */
        this.time = 0
        this.funds = JSON.parse(process.env.NEXT_PUBLIC_FUNDS_START)
        this.resources = {
            timber: new Timber(
                this.#income_sources.timber.unit,
                this.#income_sources.timber.price_per_unit
            ),
            ntfp: new NTFP(
                this.#income_sources.ntfp.unit,
                this.#income_sources.ntfp.price_per_unit
            ),
            hunting_fishing: new HuntingFishing(
                this.#income_sources.hunting_fishing.unit,
                this.#income_sources.hunting_fishing.price_per_unit
            )
        }
        this.env = new Environment()
    }
}