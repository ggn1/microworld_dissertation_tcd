import Big from 'big.js'
import Land from "./Land.js"

export default class Environment {
    /** Environment comprises the atmosphere and the land. */

    #airVolume = JSON.parse(process.env.NEXT_PUBLIC_AIR_VOLUME)

    constructor() {
        this.annualEmissionCO2 = JSON.parse(process.env.NEXT_PUBLIC_CO2_ANNUAL_EMISSION_START)
        this.land = new Land()
        this.envScale = JSON.parse(process.env.NEXT_PUBLIC_ENV_SCALE)
        const carbonAmounts = JSON.parse(process.env.NEXT_PUBLIC_C_START)
        this.carbon = {} // g
        for (const [reservoir, carbonAmount] of Object.entries(carbonAmounts)) {
            this.carbon[reservoir] = Big(carbonAmount)
        }
        this.updateCarbon = (amount) => {
            /** 
             * Updates carbon levels in the air and 
             * soil by the given amount. 
             * @param amount: An object that specifies the amount of 
             *                carbon to add/remove to/from specific 
             *                reservoirs.
            */
            for (const [reservoir, change] of Object.entries(amount)) {
                this.carbon[reservoir] = this.carbon[reservoir].plus(change)
            }
        }
    }

    getCarbon() {
        /** Returns current amount of carbon in the world. */
        return this.carbon
    }

    computeAirCO2ppm(airC) {
        /** Computes the concentration of CO2 in the air given
         *  mass of Carbon in the Air. 
         *  @param airC: Amount of carbon in the air gC.
         *  @return: Concentration of CO2 in the atmosphere in
         *           parts per million (ppm).
         */

        // 1. Compute moass of CO2 in the air.
        const c_atomic_mass = 12 // u = g/mol
        const o_atomic_mass = 16 // u = g/mol
        const molar_mass_co2 = c_atomic_mass + (2 * o_atomic_mass) // g/mol
        const ratio_mass_co2_c = molar_mass_co2 / c_atomic_mass
        const mass_co2_air = airC * ratio_mass_co2_c // gCO2

        // 2. Compute molar mass.
        const num_moles_co2 = mass_co2_air / molar_mass_co2 // moles

        // 3. Compute volume of CO2 in air.
        const volume_1mole_gas_stp = 22.414 // L/mole
        let co2_volume = num_moles_co2 * volume_1mole_gas_stp // L
        co2_volume = co2_volume * 1e-3 // m^3
        
        // 4. Compute CO2 concentration.
        const ppm = (co2_volume / this.#airVolume) * 1e6

        return ppm
    }

    computeCfromCO2(massCO2) {
        /**
         * Computes g C from g CO2.
         * @param massCO2: Amount of CO2 in g.
         * @return: Equivalent amount of C in g.
         */
        const molecularMassC = 12 // g/mol
        const molecularMassCO2 = 44 // g/mol
        return massCO2 * (12/44)
    }
}