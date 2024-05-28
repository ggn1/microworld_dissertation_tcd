export default class Planner {
    /** This class facilitates storing,
     *  updating and saving of management plans. 
     */

    #targets = {
        co2: JSON.parse(process.env.NEXT_PUBLIC_TARGET_CO2_START), // Atmospheric PPM
        income: JSON.parse(process.env.NEXT_PUBLIC_TARGET_INCOME_START) // x Barcons
    }
    
    constructor() {
        this.rotationPeriod = JSON.parse(process.env.NEXT_PUBLIC_ROTATION_START)
        this.incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
        this.plan = {}
        for (let i = 0; i<=JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX); i+=this.rotationPeriod) {
            this.plan[`${i}`] = []
        }
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
    }

    getPlan() {
        // TO DO ...
    }

    addAction() {
        // TO DO ...
    }

    deleteAction() {
        // TO DO ...
    }

    editAction() {
        // TO DO ...
    }

    updateIncomeDep() {
        // TO DO ...
    }
}