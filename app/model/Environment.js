import Big from 'big.js'
import Land from "./Land.js"
import * as utils from '../utils.js'

export default class Environment {
    /** Environment comprises the atmosphere and the land. */

    #airVolume = JSON.parse(process.env.NEXT_PUBLIC_AIR_VOLUME)
    #updateResourceAvailability

    constructor(updateResourceAvailability, initSowPositions=null, timeStepOrder=null) {
        /**
         * Constructor.
         * @param updateResourceAvailability: Function that can be used to 
         *                                    set availability of resources.
         * @param initSowPositions: Initial land sow positions.
         * @param timeStepOrder: The order in which to visit trees at 
         *                       each position on land.
         */
        const carbonAmounts = JSON.parse(process.env.NEXT_PUBLIC_C_START)
        this.#updateResourceAvailability = updateResourceAvailability
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
        this.getAirCO2ppm = (airC=null) => {
            /** Computes the concentration of CO2 in the air given
             *  mass of Carbon in the Air. 
             *  @param airC: Amount of carbon in the air gC. If this is
             *               null, current concentration of CO2 in
             *               the air is returned.
             *  @return: Concentration of CO2 in the atmosphere in
             *           parts per million (ppm).
             */
    
            if (airC == null) airC = this.carbon.air
    
            // 1. Compute mass of CO2 in the air.
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
        this.getCarbon = () => {
            /** Returns current amount of carbon in the world. */
            return this.carbon
        }
        this.land = new Land(
            this.updateCarbon, 
            this.getCarbon, 
            this.getAirCO2ppm,
            initSowPositions,
            timeStepOrder
        )
    }

    computeCfromCO2(massCO2) {
        /**
         * Computes g C from g CO2.
         * @param massCO2: Amount of CO2 in g.
         * @return: Equivalent amount of C in g.
         */
        const molecularMassC = 12 // g/mol
        const molecularMassCO2 = 44 // g/mol
        return massCO2 * (molecularMassC/molecularMassCO2)
    }

    #updateNTFPAvailability() {
        /**
         * Computes and sets resource availability for non-timber forest products
         * like mushrooms, honey and berries based on current conditions.
         */
        const def = JSON.parse(process.env.NEXT_PUBLIC_AVAILABILITY_NTFP)
        let availabilityMax = utils.randomNormalSample(def.mean, def.sd)
        const biodiversityPc = this.land.biodiversityScore
        let availabilityBd = Math.max(
            0, availabilityMax - (availabilityMax * (1 - biodiversityPc))
        )
        const deadwoodPc = this.land.getDeadWoodPc()
        let availabilityDw = Math.max(
            0, availabilityMax - (availabilityMax * (1 - deadwoodPc))
        )
        const availability = (availabilityBd + availabilityDw) / 2
        this.#updateResourceAvailability("ntfp", availability)
    }

    #updateRecActAvailability() {
        /**
         * Computes and sets availability of people for
         * recereational activities in the forest.
         */
        const def = JSON.parse(process.env.NEXT_PUBLIC_AVAILABILITY_RECACT)
        let availabilityMax = utils.randomNormalSample(def.mean, def.sd)
        const biodiversityPc = this.land.biodiversityScore
        let availabilityBd = Math.max(
            0, availabilityMax - (availabilityMax * (1 - biodiversityPc))
        )
        const availability = availabilityBd
        this.#updateResourceAvailability("recreational_activities", availability)
    }

    takeTimeStep() {
        /**
         * Executes all functions/activities that take 
         * place with each passing year.
         */
        this.land.takeTimeStep()
        this.#updateNTFPAvailability()
        this.#updateRecActAvailability()
    }
}