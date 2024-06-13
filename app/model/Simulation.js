import Big from 'big.js'
import Planner from "./Planner.js"
import Environment from "./Environment.js"
import { Timber, RecreationalActivities, NTFP } from "./IncomeSource.js"

export default class Simulation {
    /** This class shall encapsulate the
     *  entire simulated world. */

    #mgmtActionCosts = JSON.parse(process.env.NEXT_PUBLIC_COST_MGMT_ACTION)
    #runData = []
    
    constructor(updateSimUI, updatePlanUI) {
        /**
         * Constructor.
         * @param updateSimUI: Function that may be called after each
         *                     time step update with latest simulation
         *                     state to update the UI.
         * @param updatePlanUI: Function that when called, refreshes the
         *                      plan displayed in the plan viewer
         *                      as per latest changes.
         */
        this.updateResourceSalesTargets = () => {
            /**
             * Updates target incomes per rotation 
             * for each income stream based on latest 
             * income target and dependency settings.
             */
            let targetIncome = this.planner.getTargets()
            targetIncome = targetIncome.income
            for(const resource of Object.keys(this.resources)) {
                this.resources[resource].setSalesTarget(
                    targetIncome, this.planner.incomeDependency[resource]
                )
            }
        }
        this.planner = new Planner(this.updateResourceSalesTargets)
        this.updateSimUI = updateSimUI
        this.updatePlanUI = updatePlanUI
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
            salesTargets["total"] = this.planner.getTargets().income
            return salesTargets
        }
        this.updateFunds = (change) => {
            /**
             * Facilitates changing of bank balance by 
             * given amount.
             */
            this.funds = this.funds.plus(change)
        }
        this.getFunds = () => {
            /** 
             * Returns current bank balance.
             * @return: Current funds.
             */
            return this.funds
        }
        this.#createFreshWorld()
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

            // For as many timesteps as required, 
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
        this.loadState = (state) => {
            /**
             * Loads a saved state and restores it.
             */
            this.planner.plan = state.plan
            this.planner.incomeDependency = state.incomeDependency
            state.targetSettings.income = Big(state.targetSettings.income)
            state.targetSettings.funds = Big(state.targetSettings.funds)
            this.planner.setTargets(state.targetSettings)
            this.env.setFossilFuelEmission(Big(state.fossilFuelEmission))
            this.env.land.setInitSowPositions(state.initSowPositions)
            this.env.land.setTimeStepOrder(state.timeStepOrder)
            this.planner.rotationPeriod = state.rotationPeriod
            // Force land reset.
            this.goto(10)
            this.goto(0)
        }
        this.getRunData = () => {
            /**
             * Fetches recorded run parameter values.
             */
            return this.#runData
        }
    }

    #executeAction = (actionType, treeType, treeLifeStage="none") => {
        /** 
         * Executes given action and records 
         * whether or not it was possible to carry
         * through with that action. No effect if
         * given action does not exist. Only trees that
         * are at least old enough to have matured, can
         * be chopped. Felling preceeds planting.
         * @param actionType: The type of this action.
         * @param treeType: The type of tree that this action targets.
         * @param treeLifeStage: The lifestage of the targeted tree.
         * @return: Action status code meanings:
         *          # -1 => Not yet tried to execute.
         *          # 0 => Action could not be executed.
         *          # 1 => Action was executed. 
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
                const tree = this.env.land.content[pos[0]][pos[1]][0]
                const fellingCost = this.#mgmtActionCosts.fell * (
                    tree.height/tree.heightMax
                )
                // If not enough money to pay for planiting,
                // then the action cannot be executed.
                if (this.funds < fellingCost) return 0
                // Pay the price for felling.
                this.funds = this.funds.minus(fellingCost)
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
                // If not enough money to pay for planiting,
                // then the action cannot be executed.
                if (this.funds < this.#mgmtActionCosts.plant) return 0
                // Pay the price for planting.
                this.funds = this.funds.minus(this.#mgmtActionCosts.plant)
                // Plant the tree seedling.
                status = this.env.land.plantTree(treeType, pos)
                if (typeof(status) != "number") status = 1
                else status = 0
            } else {
                // No suitable spot found.
                status = 0
            }
        }
        return status
    }

    #executePlans(year) {
        /** 
         * Executes all plans for given year if possible.
         * @param year: The year for which all plans are to be executed.
         */
        let status = []
        let action = null
        let statusSum = 0
        if (year in this.planner.plan) {
            const actions = this.planner.plan[year]
            // First execute fell actions, then plant actions.
            for (const actionType of ["fell", "plant"]) {
                for (let i = 0; i < actions[actionType].length; i++) {
                    action = actions[actionType][i]
                    status = []
                    statusSum = 0
                    for (let c = 0; c < action.count; c++) {
                        status.push(this.#executeAction(
                            actionType, action.type, 
                            "stage" in action ? action.stage : "none"
                        ))
                    }
                    statusSum = status.reduce((partialSum, value) => partialSum + value, 0)
                    if (statusSum == 0) { 
                        // Could fell/plant no trees at all.
                        this.planner.updateActionStatus(year, actionType, i, 0)
                    } else if (statusSum == action.count) {
                        // Felled/planted all of given no. of trees.
                        this.planner.updateActionStatus(year, actionType, i, 1)
                    } else if (
                        status.includes(1) && 
                        status.includes(0) || 
                        status.includes(-1)
                    ) {
                        // Felled/planted a part of original planned no. of trees.
                        this.planner.updateActionStatus(year, actionType, i, 0.5)
                    }
                    this.updatePlanUI()
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

        let incomeTotal = Big(0)
        let incomeResource = Big(0)
        // Sell and/or use all available resources.
        for (const [resource, incomeSource] of Object.entries(this.resources)) {
            incomeResource = incomeSource.sell()
            this.income[resource] = this.income[resource].plus(incomeResource)
            incomeTotal = incomeTotal.plus(incomeResource)
        }
        this.income["total"] = this.income["total"].plus(incomeTotal)
        this.funds = this.funds.plus(incomeTotal)
    }  

    #updateRotation() {
        /**
         * Computes which rotation it is based on
         * current time. When new rotation starts,
         * resets income targets.
         */
        let newRotation = this.rotation + Number(
            this.time + 1 == (this.rotation + 1) * this.planner.rotationPeriod
        )
        if (newRotation != this.rotation) {
            // Update rotation count.
            this.rotation = newRotation
            // Reset income for this rotation.
            for (const resource of Object.keys(this.income)) {
                this.income[resource] = Big(0)
            }
        }
        
    }

    #createFreshWorld() {
        /** 
         * Initializes the simulation with starting world state. 
         * @param initSowPositions: Initial land sow positions.
         * @param timeStepOrder: The order in which to visit trees at 
         *                       each position on land.
         */
        this.time = 0
        this.env = new Environment(this.updateResourceAvailability)
        this.rotation = 0
        this.funds = Big(JSON.parse(process.env.NEXT_PUBLIC_FUNDS_START))
        this.resources = {
            timber: new Timber("timber", this.env.updateCarbon),
            ntfp: new NTFP(
                "ntfp", this.env.land.getBiodiversityPc, 
                this.env.land.getDeadWoodPc,
                this.updateFunds,
                this.planner.getIncDep,
                this.getFunds
            ),
            recreation: new RecreationalActivities(
                "recreation", 
                this.env.land.getBiodiversityPc,
                this.updateFunds,
                this.planner.getIncDep,
                this.getFunds
            )
        }
        this.income = { "total": Big(0) }
        for (const resource of Object.keys(this.resources)) {
            this.income[resource] = Big(0)
        }
        // Set status of all plans to -1.
        for (const y of Object.keys(this.planner.plan)) {
            for (const actionType of Object.keys(this.planner.plan[y])) {
                let actions = []
                for (let action of this.planner.plan[y][actionType]) {
                    action.success = -1
                    actions.push(action)
                }
                this.planner.plan[y][actionType] = actions
            }
        }

        this.#initRunData() // DEV
    }

    #initRunData() { // DEV
        /**
         * Initializes variable within which simlation run data 
         * is saved so that it may be downloaded as a CSV file later.
         */
        const landSize = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        this.#runData = []
        for (let i = 0; i <= JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX); i++) {
            let d = {time:i, c_air:-1, c_soil:-1, c_veg:-1, co2_ppm:-1} 
            for (let r = 0; r < landSize.rows; r++) {
                for (let c = 0; c < landSize.columns; c++) {
                    d[`p${r}${c}_type`] = "O"
                    d[`p${r}${c}_stage`] = 0
                    d[`p${r}${c}_stress`] = 0
                    d[`p${r}${c}_stress_age`] = 0
                    d[`p${r}${c}_stress_env`] = 0
                    d[`p${r}${c}_co2_ppm`] = 0
                }
            }
            this.#runData.push(d)
        }
        this.#recordData()
    }

    #recordData() { // DEV
        /**
         * Tracks run data so that 
         * it can be saved as a csv file. 
         */
        const landSize = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        const treeLifeStages = [
            "seedling", "sapling", "mature", 
            "old_growth", "senescent", "dead"
        ]
        // Record carbon reservoir data.
        this.#runData[this.time].c_air = this.env.carbon.air.toFixed(2)
        this.#runData[this.time].c_soil = this.env.carbon.soil.toFixed(2)
        this.#runData[this.time].c_veg = this.env.carbon.vegetation.toFixed(2)
        this.#runData[this.time].co2_ppm = this.env.getAirCO2ppm().toFixed(2)
        // Record content at each position on land.
        for (let r = 0; r < landSize.rows; r++) {
            for (let c = 0; c < landSize.columns; c++) {
                const content = this.env.land.content[r][c]
                // Get content type, lifestage and stress.
                let contentType = null
                let contentLifestage = null
                let contentStress = null
                let contentStressAge = null
                let contentStressEnv = null
                let contentCO2Ppm = null
                if (content.length == 0) {
                    contentType = "O"
                    contentLifestage = 0
                    contentStress = 0
                    contentStressAge = 0
                    contentStressEnv = 0
                    contentCO2Ppm = this.#runData[this.time].co2_ppm
                } else {
                    const tree = content[content.length-1]
                    if (tree.treeType == "deciduous") {
                        contentType = "D"
                        contentLifestage = treeLifeStages.indexOf(tree.lifeStage)+1
                        contentStress = tree.stress
                        contentStressAge = tree.stressAge
                        contentStressEnv = tree.stressEnv
                        contentCO2Ppm = tree.airCO2ppm
                    }
                    else if (tree.treeType == "coniferous") {
                        contentType = "C"
                        contentLifestage = treeLifeStages.indexOf(tree.lifeStage)+1
                        contentStress = tree.stress
                        contentStressAge = tree.stressAge
                        contentStressEnv = tree.stressEnv
                        contentCO2Ppm = tree.airCO2ppm
                    }
                }
                // Get content
                this.#runData[this.time][`p${r}${c}_type`] = contentType
                this.#runData[this.time][`p${r}${c}_stage`] = contentLifestage
                this.#runData[this.time][`p${r}${c}_stress`] = contentStress
                this.#runData[this.time][`p${r}${c}_stress_age`] = contentStressAge
                this.#runData[this.time][`p${r}${c}_stress_env`] = contentStressEnv
                this.#runData[this.time][`p${r}${c}_co2_ppm`] = contentCO2Ppm
            }
        }
    }

    #takeTimeStep() {
        /** Step forward in time by one step. */
        this.#updateRotation()
        this.#executePlans(this.time)
        this.time += 1
        this.env.takeTimeStep()
        this.resources.ntfp.updateAvailability()
        this.resources.recreation.updateAvailability()
        this.#generateIncome()
        this.updateSimUI()
        this.#recordData()
    }
}