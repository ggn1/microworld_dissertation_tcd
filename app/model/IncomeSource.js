import Big from 'big.js'
import * as utils from '../utils.js'

export default class IncomeSource {
    /** Class that represents one source of income
     *  from the forest. */

    #pricePerUnit
    #unit

    constructor(type) {
        /**
         * Constructor.
         * @param type: Type of resource.
         */
        this.type = type
        const resourceDef = JSON.parse(
            process.env.NEXT_PUBLIC_INCOME_SOURCES
        )[type]
        this.color = "#"+resourceDef.color
        this.#unit = resourceDef.unit
        this.#pricePerUnit = resourceDef.price_per_unit
        this.label = resourceDef.label
        this.image = resourceDef.image
        this.available = 0
        this.salesTarget = Big(JSON.parse( // per rotation
            process.env.NEXT_PUBLIC_TARGET_INCOME_START
        )).mul(JSON.parse(
            process.env.NEXT_PUBLIC_INCOME_SOURCES
        )[this.type].dependency)
        this.setSalesTarget = (incomeTarget, dependency) => {
            /**
             * Computes how much of funds should be obtained from
             * this income source per rotation as per current 
             * income target and dependency settings.
             * @param incomeTarget: The total amount of funds currently held
             *                      by the user.
             * @param dependency: The amount of dependency placed upon
             *                    this income stream for funds [0, 1].
             */
            this.salesTarget = incomeTarget.mul(dependency)
        }
    }

    sell() {
        /**
         * Sells available amount of the resource
         * and returns funds received.
         * @return: Income from sales.
         */
        let fundsReceived = Big(0)
        if (this.type == "timber") {
            // Because wood weight is in grams and
            // price is per kg, wood weight must be 
            // divided by 1000.
            fundsReceived = Big((this.available/1000) * this.#pricePerUnit)
            this.useWood(this.available)
        } else {
            fundsReceived = Big(this.available * this.#pricePerUnit)
        }
        this.available = 0
        return fundsReceived
    }
}

export class Timber extends IncomeSource {
    /** Class embodies income that the means of income
     *  that wood presents. */

    #updateCarbon

    constructor(type, updateCarbon) {
        /** 
         * Constructor.
         * @param type: Type of resource.
         * @param updateCarbon: Function that can be used to 
         *                      update levels of carbon in 
         *                      each reservoir.
         */
        super(type)
        this.#updateCarbon = updateCarbon
        this.usage = JSON.parse(process.env.NEXT_PUBLIC_TIMBER_USAGE)
    }

    #moveCarbon(carbonWeight, srcReservoir, dstReservoir) {
        /** 
         * Moves carbon from one reservoir to another. 
         * @param carbonWeight: The amount of carbon to be moved.
         * @param srcReservoir: The source that the carbon is drawn from.
         * @param dstReservoir: The destination to which carbon is added.
        */

        // Compute weight of carbon that must be pulled from the source reservoir.
        carbonWeight = Big(carbonWeight)
        const scaleFactor = Big(JSON.parse(process.env.NEXT_PUBLIC_C_WEIGHT_SCALE_FACTOR))

        // Reduce carbon in source and move to destination.
        let update = {}
        update[srcReservoir] = scaleFactor.mul(carbonWeight).mul(-1)
        update[dstReservoir] = scaleFactor.mul(carbonWeight)
        this.#updateCarbon(update)
    }

    useWood(woodWeight) {
        /** 
         * Given the amount of wood, uses it for 
         * energy and lumber based on set usage %.
         * @param woodWeight: Weight of the wood in grams.
        */

        let usedWeight = 0
        let carbonWeight = 0
        for (const use of Object.keys(this.usage)) {
            usedWeight = woodWeight * this.usage[use] // g
            carbonWeight = utils.computeCarbonInWoodWeight(usedWeight)
            if (use == "lumber") {
                this.#moveCarbon(carbonWeight, "vegetation", "lumber")
            }
            else if (use == "energy") {
                this.#moveCarbon(carbonWeight, "vegetation", "air")
            }
        }
    }
}

export class NTFP extends IncomeSource {
    /** Class embodies income that non-timber forest
     *  products like mushrooms, berries and honey presents. */

    #getBiodiversityPc
    #getDeadWoodPc

    constructor(type, getBiodiversityPc, getDeadWoodPc) {
        /**
         * Constructor.
         * @param type: Type of resource.
         * @param getBiodiversityPc: Function that fetches latest 
         *                           biodiversity score.
         * @param getDeadWoodPc: Function that fetchest current 
         *                       percent of the land with dead wood.
         */
        super(type)
        this.#getBiodiversityPc = getBiodiversityPc
        this.#getDeadWoodPc = getDeadWoodPc
        this.updateAvailability = () => {
            /** 
             * Updates how much of this resource is available.
             * Considers costs related to foraging/harvesting.
             */
            const def = JSON.parse(
                process.env.NEXT_PUBLIC_INCOME_SOURCES
            ).ntfp.availability
            let availabilityMax = utils.randomNormalSample(def.mean, def.sd)
            const biodiversityPc = this.#getBiodiversityPc()
            let availabilityBd = Math.max(
                0, availabilityMax - (availabilityMax * (1 - biodiversityPc))
            )
            const deadwoodPc = this.#getDeadWoodPc()
            let availabilityDw = Math.max(
                0, availabilityMax - (availabilityMax * (1 - deadwoodPc))
            )
            this.available = (availabilityBd + availabilityDw) / 2
        }
    }

    #forage() {
        /**
         * Handles the behaviour and all costs related to foraging
         * required to make this resource available.
         */
        const maintenanceCost = JSON.parse(
            process.env.NEXT_PUBLIC_INCOME_SOURCES
        ).ntfp.cost.maintenance
        // TO DO
    }
}

export class RecreationalActivities extends IncomeSource {
    /** Class embodies income that hunting and fishing
     *  activities present. */

    #getBiodiversityPc

    constructor(type, getBiodiversityPc) {
        /**
         * Constructor.
         * @param type: Type of resource.
         * @param getBiodiversityPc: Function that fetches latest 
         *                           biodiversity score.
         */
        super(type)
        this.isBuitUp = false // Whether facilities have been established yet.
        this.#getBiodiversityPc = getBiodiversityPc
        this.updateAvailability = () => {
            /** 
             * Updates how much of this resource is available.
             * Handles payment of one time fixed amount as well
             * as maintainance costs.
             */
            const def = JSON.parse(
                process.env.NEXT_PUBLIC_INCOME_SOURCES
            ).recreation.availability
            let availabilityMax = utils.randomNormalSample(def.mean, def.sd)
            const biodiversityPc = this.#getBiodiversityPc()
            let availabilityBd = Math.max(
                0, availabilityMax - (availabilityMax * (1 - biodiversityPc))
            )
            this.available = availabilityBd
        }
    }

    #buildMaintain() {
        /**
         * Handles the behaviour and all costs related to building
         * infrastructure as well as maintaining it,
         */
        const costs = JSON.parse(
            process.env.NEXT_PUBLIC_INCOME_SOURCES
        ).ntfp.cost
        
        if (!this.isBuitUp) {
            const initialCost = costs.initial
            // TO DO
        }
        
        const maintenanceCost = costs.maintenance
        // TO DO
    }
}