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
    #updateFunds
    #getIncomeDependency

    constructor(
        type, getBiodiversityPc, getDeadWoodPc, 
        updateFunds, getIncomeDependency
    ) {
        /**
         * Constructor.
         * @param type: Type of resource.
         * @param getBiodiversityPc: Function that fetches latest 
         *                           biodiversity score.
         * @param getDeadWoodPc: Function that fetchest current 
         *                       percent of the land with dead wood.
         * @param updateFunds: Function that can be called to update
         *                     the user's bank balance.
         * @param getIncomeDependency: Function that can be used to fetch
         *                             current income dependency setting
         *                             for the NTFP income stream.
         */
        super(type)
        this.#getIncomeDependency = getIncomeDependency
        this.#getBiodiversityPc = getBiodiversityPc
        this.#getDeadWoodPc = getDeadWoodPc
        this.#updateFunds = updateFunds
        this.updateAvailability = () => {
            /** 
             * Updates how much of this resource is available.
             * Considers costs related to foraging/harvesting.
             */
            this.#forage()
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
        const cost = JSON.parse(
            process.env.NEXT_PUBLIC_INCOME_SOURCES
        ).ntfp.cost.maintenance
        // console.log(`Foraging to gather NTFPs cost Bc ${cost}.`)
        const dependency = this.#getIncomeDependency("ntfp")
        this.#updateFunds(-1 * cost * dependency)
    }
}

export class RecreationalActivities extends IncomeSource {
    /** Class embodies income that hunting and fishing
     *  activities present. */

    #getBiodiversityPc
    #updateFunds
    #getIncomeDependency

    constructor(type, getBiodiversityPc, updateFunds, getIncomeDependency) {
        /**
         * Constructor.
         * @param type: Type of resource.
         * @param getBiodiversityPc: Function that fetches latest 
         *                           biodiversity score.
         * @param updateFunds: Function that can be called to update
         *                     the user's bank balance.
         * @param getIncomeDependency: Function that can be used to fetch
         *                             current income dependency setting
         *                             for the NTFP income stream.
         */
        super(type)
        this.isBuilt = false // Whether infrastructure has been established yet.
        this.#getIncomeDependency = getIncomeDependency
        this.#updateFunds = updateFunds
        this.#getBiodiversityPc = getBiodiversityPc
        this.updateAvailability = () => {
            /** 
             * Updates how much of this resource is available.
             * Handles payment of one time fixed amount as well
             * as maintainance costs.
             */
            this.#buildMaintain()
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
        ).recreation.cost
        const dependency = this.#getIncomeDependency("recreation")
        
        if (!this.isBuilt && dependency > 0) {
            const initialCost = costs.initial
            // console.log(`Building infrastructure for recreational activities in the forest cost Bc ${initialCost}.`)
            this.#updateFunds(-1 * initialCost)
            this.isBuilt = true
        }
        
        const maintenanceCost = costs.maintenance
        // console.log(`Maintaining forest recreational cost Bc ${maintenanceCost}.`)
        this.#updateFunds(-1 * maintenanceCost * dependency)
    }
}