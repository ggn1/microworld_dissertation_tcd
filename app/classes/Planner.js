export default class Planner {
    /** This class facilitates storing,
     *  updating and saving of management plans. 
     */

    constructor() {
        this.rotationPeriod = JSON.parse(process.env.NEXT_PUBLIC_ROTATION_START)
        this.targets = {
            co2: 0.0, // % available
            income: 0 // x Barcons
        }
        this.incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
        this.plan = {}
        for (let i = 0; i<=JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX); i+=this.rotationPeriod) {
            this.plan[`${i}`] = []
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