import Land from "./Land.js"

export default class Environment {
    /** Environment comprises the atmosphere and the land. */

    #airVolume = JSON.parse(process.env.NEXT_PUBLIC_AIR_VOLUME)

    constructor() {
        // this.temperature = JSON.parse(process.env.NEXT_PUBLIC_TEMPERATURE_START)
        this.co2 = JSON.parse(process.env.NEXT_PUBLIC_C_START) // g
        this.land = new Land()
    }

    computeAirCO2ppm() {
        /** Computes the concentration of CO2 in the air. 
         *  @return: Concentration of CO2 in the atmosphere in
         *           parts per million (ppm).
         */
        // TO DO
    }
}