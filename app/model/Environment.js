import Big from 'big.js'
import Land from "./Land.js"
import * as utils from '../utils.js'

let fossilFuelEmission =  Big(JSON.parse(
    process.env.NEXT_PUBLIC_CO2_FOSSIL_FUEL_ANNUAL_EMISSION_START
))

export default class Environment {
    /** Environment comprises the atmosphere and the land. */

    #airMass = Big(JSON.parse(process.env.NEXT_PUBLIC_AIR_MASS))

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
        this.getAirCO2ppm = () => {
            /** Computes the concentration of CO2 in the air given
             *  mass of Carbon in the Air.
             *  @return: Concentration of CO2 in the atmosphere in
             *           parts per million (ppm).
             */
            const airC = this.carbon.air // Mass of carbon in the atmosphere currently.
    
            // 1. Compute mass of CO2 in the air.
            const massCO2air = utils.co2massFromCmass(airC) // gCO2

            // 2. Compute CO2 concentration.
            const ppm = (massCO2air.div(this.#airMass)).mul(1e+6).toNumber()
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