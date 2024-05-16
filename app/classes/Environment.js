import Land from "./Land.js"

export default class Environment {
    /** Environment comprises the atmosphere and the land. */

    constructor() {
        this.temperature = JSON.parse(process.env.NEXT_PUBLIC_TEMPERATURE_BASE)
        this.co2 = {
            available: 1.0,
            bound: 0.0
        }
        this.land = new Land()
    }
}