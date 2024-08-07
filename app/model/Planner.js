import Big from 'big.js'

export default class Planner {
    /** This class facilitates creation,
     *  and editing of management plans
     *  and other learner decisions 
     *  (CO2, income targets, rotation period). 
     */

    #targets = {
        co2: JSON.parse(process.env.NEXT_PUBLIC_TARGET_CO2_START), // Atmospheric PPM
        income: Big(JSON.parse(process.env.NEXT_PUBLIC_TARGET_INCOME_START)), // x coins
        funds: 1 // x coins
    }
    #updateUISalesTargets
    #lastYear = 0
    #rotIncTargetMet = false
    
    constructor(updateUISalesTargets) {
        /**
         * Logical planner that allows learns to draft forest management plans.
         * @param updateUISalesTargets: Function used to update
         *                              sales targets for each income stream
         *                              based on latest total income target.
         * @param updateUIPlan: Function used to update the UI with latest plan.
         */
        this.#updateUISalesTargets = updateUISalesTargets
        this.plan = {}
        this.rotationPeriod = JSON.parse(process.env.NEXT_PUBLIC_ROTATION_START)
        this.incomeDependency = {}
        for (const [resource, value] of Object.entries(JSON.parse(
            process.env.NEXT_PUBLIC_INCOME_SOURCES
        ))) this.incomeDependency[resource] = value.dependency
        this.targetFailYear = {
            // Keep track of the first year in which 
            // a target failed. -1 implies it has not failed.
            co2:-1, funds:-1, income:-1
        }
    }

    updateActionStatus(year, actionType, actionIdx, successStatus) {
        /** 
         * Update the status of whether it was possible to 
         * execute this action (if such an action exists).
         * @param year: The year of the action.
         * @param actionType: The kind of action that was attempted
         *                    to be executed.
         * @param actionIdx: The index of the specific action that was executed.
         * @param successStatus: The new status of that action. Meaning of 
         *                       status codes are as follows:
         *                       # -1 => Not yet attempted to execute
         *                       # 1 => Planned no. of trees planted/felled.
         *                       # 0 => Failed to plant/fell any tree.
         *                       # 0.5 => Few trees were planted/felled, but 
         *                                not the number originally planned.
         */
        if (year in this.plan && this.plan[year][actionType].length > actionIdx) {
            this.plan[year][actionType][actionIdx].success = successStatus
        }
    }

    getTargets = () => {
        /** 
         * Returns current value of targets. 
         * @return: Target values.
        */
        return this.#targets
    }

    setTargets = (targets) => {
        /** 
         * Sets new values for targets.
         * @param targets: New value for targets.
        */
        for (const [key, val] of Object.entries(targets)) {
            if (key in this.#targets) this.#targets[key] = val
        }
        this.#updateUISalesTargets()
    }

    getPlan = (year=null) => {
        /** 
         * Returns actions planned for a given year,
         * or all years if no specific year is given or
         * if the year given is invalid.
         * @param year: The year associated to which, plans are to be
         *              returned.
         * @return: Latest plan.
         */
        let toReturn = this.plan
        if (year != null) {
            toReturn = []
            if (year in this.plan) {
                const actionTypes = ["plant", "fell"]
                let actionToReturn = null
                for (const actionType of actionTypes){
                    for (const action of this.plan[year][actionType]) {
                        actionToReturn = {
                            actionType: actionType,
                            count: action.count,
                            treeType: action.type,
                            success: action.success
                        }
                        if ("stage" in action) {
                            actionToReturn["treeLifeStage"] = action.stage
                        }
                        toReturn.push(actionToReturn)
                    }
                }
            }
        }
        return toReturn
    }

    addAction = (
        year, actionType, count, 
        treeType, treeLifeStage="none"
    ) => {
        /**
         * Adds a new action to the plan.
         * @param year: An integer representing the year corresponding
         *              to the new action.
         * @param actionType: The type of new action ("plant"/"fell").
         * @param count: No. of trees affected.
         * @param treeType: The type of tree affected ("coniferous"/"deciduous").
         * @param treeLifeStage: The life stage of the tree 
         *                       (only valid w.r.t the "fell" action).
         */
        let action = {
            type: treeType, 
            count: count, 
            stage: treeLifeStage, 
            success: -1
        }

        // If a similar action (same action type on same
        // tree type type at same lifestage 
        // under same year with different count) exists already,
        // then just change the count in that action.
        let existingAction = null
        if (year in this.plan) {
            const plannedActions = this.plan[year][actionType]
            for (let i = 0; i < plannedActions.length; i++) {
                existingAction = plannedActions[i]
                if (treeType == existingAction.type && (
                    actionType == "plant" || 
                    actionType == "fell" && 
                    treeLifeStage == existingAction.stage
                )) {
                    // Remove old instance of the action.
                    this.plan[year][actionType].splice(i, 1) 
                    break
                }
            }          
        } else {
            // If the year does not exist yet, create it.
            this.plan[year] = {"plant":[], "fell":[]}
        }

        // Add new action to the list.
        this.plan[year][actionType].push(action)
    }

    deleteAction = (year, actionType, treeType, treeLifeStage="none") => {
        /** 
         * Deletes an existing action.
         * No effect if
         * given action does not exist.
         * @param year: The year that the action is associated with.
         * @param actionType: The type of this action.
         * @param treeType: The type of tree that this action targets.
         * @param treeLifeStage: The lifestage of the targeted tree.
         */
        let toDeleteIdx = -1

        // Find matching action to delete.
        let action = null
        if (year in this.plan) {
            const actions = this.plan[year][actionType]
            for (let i = 0; i < actions.length; i++) {
                action = actions[i]
                if (
                    action.type == treeType &&
                    actionType == "plant" ||
                    actionType == "fell" &&
                    action.stage == treeLifeStage
                ){
                   toDeleteIdx = i
                   break
                }
            }
        }

        // If found, then delete.
        if (toDeleteIdx >= 0) {
            this.plan[year][actionType].splice(toDeleteIdx, 1)
            if (
                this.plan[year]["plant"].length == 0 &&
                this.plan[year]["fell"].length == 0
            ) delete(this.plan[year])
        }
    }

    setIncDep = (newIncDep) => {
        /**
         * Sets income dependency values.
         * @param newIncDep: Values to set as an object
         *                   {resource: new value}.
         * 
         */
        for (const [key, value] of Object.entries(newIncDep)) {
            if (key in this.incomeDependency) {
                this.incomeDependency[key] = value
            }
        }
    }

    getIncDep = (resource) => {
        /**
         * Returns the income rependency currently associated
         * with given resource or all resources if nothing is
         * given.
         * @param resource: The resource for whih income 
         *                  dependency setting is to be fetched.
         * @return: Income dependency score (float) or object with
         *          income dependency associated with every resource.
         */
        if (resource != null && resource in this.incomeDependency) {
            return this.incomeDependency[resource]
        }
        return this.incomeDependency 
    }

    checkTargetMet = (co2, income, funds, year, rotation) => {
        /**
         * Checks if the target is met or not.
         * @param co2: Current co2 value.
         * @param income: Current total income.
         * @param funds: Current bank balance.
         * @param year: This year.
         * @param rotation: Current rotation.
         * @return: Latest target met status.
         */
        if (year == 0 || year <= this.#lastYear) {
            this.targetFailYear.co2 = -1
            this.targetFailYear.income = -1
            this.targetFailYear.funds = -1
        }
        if (this.targetFailYear.co2 < 0) { // CO2 target has not failed yet.
            if (co2 <= this.#targets.co2) this.targetFailYear.co2 = -2 // CO2 target met.
            else this.targetFailYear.co2 = year // CO2 target failed.      
        }
        if (year%this.rotationPeriod == (this.rotationPeriod - 1)) {
            this.#rotIncTargetMet = (this.targetFailYear.income == -2)
        }
        if (this.targetFailYear.income < 0) { // Income target has not failed yet.
            // Reset and evaluate at the starting of a new rotation.
            if (year != 0 && year%this.rotationPeriod == 0) { // New rotation.
                // Income target was met the last rotation.
                if (this.#rotIncTargetMet) {
                    this.targetFailYear.income = -1
                    this.#rotIncTargetMet = false
                } 
                // Income target was not met the last rotation.
                else { // Income target has not failed.
                    this.targetFailYear.income = rotation - 1
                }
            }
            if (income.gte(this.#targets.income)) {
                this.targetFailYear.income = -2 // Income target met.
            }    
        }
        if (this.targetFailYear.funds < 0) { // Funds target has not failed yet.
            if (funds.gte(this.#targets.funds)) this.targetFailYear.funds = -2 // Funds target met.
            else this.targetFailYear.funds = year - 1  // CO2 target failed.      
        }
        this.#lastYear = year
        return this.targetFailYear
    }
}