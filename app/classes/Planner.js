const dummyPlan = {
    "40": {
        "fell": [{count: 1, type:"coniferous", stage:"mature", success:0}],
        "plant": [{count:1, type:"coniferous", success:1}, {count:1, type:"deciduous", success:0}]
    },
    "80": {
        "fell": [
            {count: 1, type:"coniferous", stage:"mature", success:-1}, 
            {count: 1, type:"deciduous", stage:"old_growth", success:-1}],
        "plant": []
    }
}


export default class Planner {
    /** This class facilitates storing,
     *  updating and saving of management plans. 
     */

    #plan = dummyPlan
    
    #targets = {
        co2: JSON.parse(process.env.NEXT_PUBLIC_TARGET_CO2_START), // Atmospheric PPM
        income: JSON.parse(process.env.NEXT_PUBLIC_TARGET_INCOME_START) // x Barcons
    }
    
    constructor() {
        this.rotationPeriod = JSON.parse(process.env.NEXT_PUBLIC_ROTATION_START)
        this.incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
        this.getTargets = () => {
            /** 
             * Returns current value of targets. 
             * @return: Target values.
            */
            return this.#targets
        }
        this.setTargets = (targets) => {
            /** 
             * Sets new values for targets.
             * @param targets: New value for targets.
            */
            for (const [key, val] of Object.entries(targets)) {
                if (key in this.#targets) this.#targets[key] = val
            }
        }
        this.getPlan = (year=null) => {
            /** 
             * Returns actions planned for a given year,
             * or all years if no specific year is given or
             * if the year given is invalid.
             * @param year: The year associated to which, plans are to be
             *              returned.
             * @return: Latest plan.
             */
            let toReturn = this.#plan
            if (year != null) {
                toReturn = []
                if (year in this.#plan) {
                    const actionTypes = ["plant", "fell"]
                    let actionToReturn = null
                    for (const actionType of actionTypes){
                        for (const action of this.#plan[year][actionType]) {
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
        this.addAction = (
            year, actionType, count, 
            treeType, treeLifeStage=""
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
            let action = {type: treeType, count: count, stage: treeLifeStage, success:false}
    
            // If a similar action (same action type on same
            // tree type with different count) exists already,
            // then just change the count in that action.
            let existingAction = null
            if (year in this.#plan) {
                const plannedActions = this.#plan[year][actionType]
                for (let i = 0; i < plannedActions.length; i++) {
                    existingAction = plannedActions[i]
                    if (
                        treeType == existingAction.type && (
                            actionType == "plant" || 
                            actionType == "fell" && 
                            treeLifeStage == existingAction.treeLifeStage
                        ) && count != existingAction.count
                    ) {
                        // Remove old instance of the action.
                        this.#plan[year][actionType].splice(i, 1) 
                        break
                    }
                }          
            } else {
                // If the year does not exist yet, create it.
                this.#plan[year] = {"plant":[], "fell":[]}
            }
    
            // Add new action to the list.
            this.#plan[year][actionType].push(action)
        }
        this.deleteAction = (year, actionType, treeType, treeLifeStage="") => {
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
            if (year in this.#plan) {
                const actions = this.#plan[year][actionType]
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
                this.#plan[year][actionType].splice(toDeleteIdx, 1)
                if (
                    this.#plan[year]["plant"].length == 0 &&
                    this.#plan[year]["fell"].length == 0
                ) delete(this.#plan[year])
            }
        }
        
        this.executeAction = (year, actionType, treeType, treeLifeStage="") => {
            /** 
             * Executes given action and records 
             * whether or not it was possible to carry
             * through with that action. No effect if
             * given action does not exist.
             * @param year: The year that the action is associated with.
             * @param actionType: The type of this action.
             * @param treeType: The type of tree that this action targets.
             * @param treeLifeStage: The lifestage of the targeted tree.
             */
            // TO DO
        }
    }

    updateIncomeDep() {
        // TO DO ...
    }
}