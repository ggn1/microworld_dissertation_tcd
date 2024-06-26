import Big from 'big.js'
import Land from "./Land.js"
import * as utils from '../utils.js'

let fossilFuelEmission =  Big(JSON.parse(
    process.env.NEXT_PUBLIC_CO2_FOSSIL_FUEL_ANNUAL_EMISSION_START
))

export default class Environment {
    /** Environment comprises the atmosphere and the land. */

    #airVolume = Big(JSON.parse(process.env.NEXT_PUBLIC_AIR_VOLUME))

    constructor(ffEmission=null) {
        /**
         * Constructor.
         * @param ffEmission: Fossil fuel emissions start value.
         */
        if (ffEmission != null) fossilFuelEmission = ffEmission
        const carbonStart = JSON.parse(process.env.NEXT_PUBLIC_C_START)
        this.carbon = {} // g
        for (const [reservoir, carbonAmount] of Object.entries(carbonStart)) {
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
            co2_volume = Big(co2_volume * 1e-3) // m^3
            
            // 4. Compute CO2 concentration.
            let ppm = co2_volume.div(this.#airVolume)
            ppm = ppm.mul(1e+6)
            ppm = ppm.mul(JSON.parse(process.env.NEXT_PUBLIC_CO2_PPM_COEFFICIENT))
            ppm = ppm.toNumber()
            return ppm
        }
        this.getCarbon = () => {
            /** Returns current amount of carbon in the world. */
            return this.carbon
        }
        this.getFossilFuelEmission = () => {
            /**
             * Returns current annual carbon emissions
             * from fossil fuel usage.
             */
            return fossilFuelEmission
        }
        this.setFossilFuelEmission = (val) => {
            /**
             * Sets current annual carbon emissions
             * from fossil fuel usage.
             * @param val: New value.
             */
            fossilFuelEmission = val
        }
        this.land = new Land(this.updateCarbon, this.getCarbon, this.getAirCO2ppm)
    }

    takeTimeStep(isInit=false) {
        /**
         * Moves one step forward in time.
         * @param isInit: The world is being initialized.
         */
        
        if (!isInit) {
            // Update carbon in air due to fossil fuels.
            let toEmit = fossilFuelEmission
            if (toEmit.gt(this.carbon.fossil_fuels)) {
                // Can only emit as much as is available.
                toEmit = this.carbon.fossil_fuels
            }
            this.updateCarbon({
                "fossil_fuels": toEmit.mul(-1),
                "air": toEmit
            })
        }
        
        // Update carbon in air and water.
        const cExhangeAirWater = utils.computeAirWaterTransferC(
            utils.computePressureCO2("air", this.carbon.air),
            utils.computePressureCO2("water", this.carbon.water)
        )
        let cUpdateAirWater = {}
        if (this.carbon[cExhangeAirWater.source].lt(cExhangeAirWater.carbon)) {
            cExhangeAirWater.carbon = this.carbon[cExhangeAirWater.source]
        }
        cUpdateAirWater[cExhangeAirWater.source] = cExhangeAirWater.carbon.mul(-1)
        cUpdateAirWater[cExhangeAirWater.sink] = cExhangeAirWater.carbon
        this.updateCarbon(cUpdateAirWater)
        
        // Update land content.
        this.land.takeTimeStep()
    }
}