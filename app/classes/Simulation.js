import Planner from "./Planner.js"
import Environment from "./Environment.js"
import { Timber, HuntingFishing, EcosystemServices, NTFP } from "./IncomeSource.js"

export default class Simulation {
    /** This class shall encapsulate the
     *  entire simulated world. */

    #income_sources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)

    constructor() {
        this.#createFreshWorld()
        this.planner = new Planner()
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
        console.log("Took time step. Now, year =", this.time)
        // TO DO
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