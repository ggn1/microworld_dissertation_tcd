import Planner from "./Planner.js"
import Environment from "./Environment.js"
import { Timber, RecreationalActivities, NTFP } from "./IncomeSource.js"

export default class Simulation {
    /** This class shall encapsulate the
     *  entire simulated world. */

    #mgmtActionCosts = JSON.parse(process.env.NEXT_PUBLIC_COST_MGMT_ACTION)
    
    constructor(updateSimUI) {
        /**
         * Constructor.
         * @param updateSimUI: Function that may be called after each
         *                     time step update with latest simulation
         *                     state to update the UI.
         */
        this.#createFreshWorld()
        this.planner = new Planner()
        this.updateSimUI = updateSimUI
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
                this.updateSimUI()
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
        this.updateResourceSalesTargets = () => {
            /**
             * Updates target incomes per rotation 
             * for each income stream based on latest 
             * income target and dependency settings.
             */
            for(const resource of Object.keys(this.resources)) {
                this.resources[resource].setSalesTarget(
                    this.income.total, this.planner.incomeDependency[resource]
                )
            }
        }
        this.getResourceSalesTargets = () => {
            /**
             * Returns current per rotation sales
             * target for each income stream.
             * @return: Sales targets.
             */
            let salesTargets = {}
            for(const resource of Object.keys(this.resources)) {
                salesTargets[resource] = this.resources[resource].salesTarget
            }
            return salesTargets
        }
    }

    #executeAction = (
        year, actionType, actionIdx, 
        treeType, treeLifeStage="none"
    ) => {
        /** 
         * Executes given action and records 
         * whether or not it was possible to carry
         * through with that action. No effect if
         * given action does not exist. Only trees that
         * are at least old enough to have matured, can
         * be chopped.
         * @param year: Year associated with this action.
         * @param actionIdx: Index of this action.
         * @param actionType: The type of this action.
         * @param treeType: The type of tree that this action targets.
         * @param treeLifeStage: The lifestage of the targeted tree.
         */
        let status = -1
        if(actionType == "fell") {
            // Select a tree to fell.
            const pos = this.env.land.getTree(treeType, treeLifeStage)
            if ( // Suitable tree found.
                pos[0] >= 0 && 
                treeLifeStage != "seedling" &&
                treeLifeStage != "sapling"
            ) { 
                // Pay the price for felling.
                this.funds -= this.#mgmtActionCosts.fell
                // Fell the tree.
                const [success, woodHarvested] = this.env.land.fellTree(
                    pos, treeType, treeLifeStage
                ) // g
                status = success
                // Add harvested wood to available timber resource.
                this.resources.timber.available += woodHarvested
            } else {
                // No suitable tree found.
                status = 0
            }
        } else { // actionType == "plant"
            // Select a spot on the land wherein to plant.
            let pos = this.env.land.getFreeSpaces()
            if (pos.length > 0) { // Suitable spot found.
                pos = pos[0]
                // Pay the price for planting.
                this.funds -= this.#mgmtActionCosts.plant
                // Plant the tree seedling.
                status = this.env.land.plantTree(treeType, pos)
                if (typeof(status) != "number") status = 1
                else status = 0
            } else {
                // No suitable spot found.
                status = 0
            }
        }
        this.planner.updateActionStatus(year, actionType, actionIdx, status)
    }

    #executePlans(year) {
        /** 
         * Executes all plans for given year if possible.
         * @param year: The year for which all plans are to be executed.
         */
        let action = null
        if (year in this.planner.plan) {
            const actions = this.planner.plan[year]
            // First execute fell actions, then plant actions.
            for (const actionType of ["fell", "plant"]) {
                for (let i = 0; i < actions[actionType].length; i++) {
                    action = actions[actionType][i]
                    for (let c = 0; c < action.count; c++) {
                        this.#executeAction(
                            year, actionType, i, action.type, 
                            "stage" in action ? action.stage : "none"
                        )
                    }
                }
            }
        }
    }

    #generateIncome() {
        /**
         * Sells resources available at the end of
         * this time step and updates income
         * generated from them.
         */

        let incomeTotal = 0
        let incomeResource = 0
        // Sell and/or use all available resources.
        for (const [resource, incomeSource] of Object.entries(this.resources)) {
            incomeResource = incomeSource.sell()
            this.income[resource] += incomeResource
            incomeTotal += incomeResource
        }
        this.income["total"] += incomeTotal
        this.funds += incomeTotal
    } 

    #takeTimeStep() {
        /** Step forward in time by one step. */
        this.time += 1
        this.#updateRotation()
        this.#executePlans(this.time)
        this.env.land.takeTimeStep()
        this.updateSimUI()
        this.#generateIncome()
    } 

    #updateRotation() {
        /**
         * Computes which rotation it is based on
         * current time. When new rotation starts,
         * resets income targets.
         */
        let newRotation = Math.floor(this.time/(this.planner.rotationPeriod - 1))
        if (newRotation != this.rotation) {
            // Update rotation count.
            this.rotation = newRotation
            // Reset income for this rotation.
            for (const resource of Object.keys(this.income)) {
                this.income[resource] = 0
            }
        }
        
    }

    #createFreshWorld() {
        /** Initializes the simulation with starting world state. */
        this.time = 0
        this.env = new Environment()
        this.rotation = 0
        this.funds = JSON.parse(process.env.NEXT_PUBLIC_FUNDS_START)
        this.resources = {
            timber: new Timber("timber", this.env.updateCarbon),
            ntfp: new NTFP("ntfp"),
            recreational_activities: new RecreationalActivities("recreational_activities")
        }
        this.income = { "total": 0 }
        for (const resource of Object.keys(this.resources)) this.income[resource] = 0
    }
}