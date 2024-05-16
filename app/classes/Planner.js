export default class Planner {
    /** This class facilitates storing,
     *  updating and saving of management plans. 
     */

    constructor() {
        this.rotation_period = JSON.parse(process.env.NEXT_PUBLIC_ROTATION_BASE)
        this.targets = {
            co2: 0.0, // % available
            income: 0 // x Barcons
        }
        this.income_dependency = {}
        for (const [key, value] of Object.entries(
            JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
        )) {
            this.income_dependency[key] = value.dependency_base
        }
        this.plan = {}
        for (let i=0; i<=JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX); i+=this.rotation_period) {
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