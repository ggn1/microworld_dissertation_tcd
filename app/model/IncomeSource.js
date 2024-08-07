import Big from 'big.js'
import * as utils from '../utils.js'

export default class IncomeSource {
    /** 
     * Class that represents a source
     * of income from the forest. 
    */

    constructor(type) {
        /**
         * Constructor.
         * @param type: Type of resource.
         */
        const resourceDef = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)[type]
        this._price = resourceDef.price
        this.type = type
        this.color = "#" + resourceDef.color
        this.label = resourceDef.label
        this.image = resourceDef.image
        this.available = 0
        this.salesTarget = Big(JSON.parse( // per rotation
            process.env.NEXT_PUBLIC_TARGET_INCOME_START
        )).mul(JSON.parse(
            process.env.NEXT_PUBLIC_INCOME_SOURCES
        )[this.type].dependency)
    }

    setSalesTarget = (incomeTarget, dependency) => {
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

    sell() {
        /**
         * Sells available amount of the resource
         * and returns funds received.
         * @param amount: Amount of resources sold.
         * @return: Income from sales.
         */
        const fundsReceived = Big(this.available * this._price.per_unit)
        this.available = 0
        return fundsReceived
    }
}

export class Timber extends IncomeSource {
    /** Class embodies income that the means of income
     *  that wood presents. */

    #updateCarbon
    constructor(updateCarbon) {
        /** 
         * Constructor.
         * @param updateCarbon: Function that can be used to 
         *                      update levels of carbon in 
         *                      each reservoir.
         */
        super("timber")
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

    sell() {
        // Because wood weight is in grams and
        // price is per kg, wood weight
        // must be divided by 1000 before selling.
        const fundsReceived = Big((this.available/1000) * this._price.per_unit)
        this.useWood(this.available)
        this.available = 0
        return fundsReceived
    }
}

export class NTFP extends IncomeSource {
    /** Class embodies income that non-timber forest
     *  products like mushrooms, berries and honey presents. */
    #getBiodiversityPc
    #getDeadWoodPc
    #updateFunds
    #getIncomeDependency
    #getFunds
    #updateExpenses
    #availabilityScaleFactor
    constructor(
        getBiodiversityPc, getDeadWoodPc, updateFunds, 
        getIncomeDependency, getFunds, updateExpenses
    ) {
        /**
         * Constructor.
         * @param getBiodiversityPc: Function that fetches latest 
         *                           biodiversity score.
         * @param getDeadWoodPc: Function that fetchest current 
         *                       percent of the land with dead wood.
         * @param updateFunds: Function that can be called to update
         *                     the user's bank balance.
         * @param getIncomeDependency: Function that can be used to fetch
         *                             current income dependency setting
         *                             for the NTFP income stream.
         * @param getFunds: Function that returns current bank balance.
         * @param updateExpenses: Function that can be used to update expenditure values.
         */
        super("ntfp")
        this.#getIncomeDependency = getIncomeDependency
        this.#getBiodiversityPc = getBiodiversityPc
        this.#getDeadWoodPc = getDeadWoodPc
        this.#updateFunds = updateFunds
        this.#getFunds = getFunds
        this.#updateExpenses = updateExpenses
        this.#availabilityScaleFactor = JSON.parse(
            process.env.NEXT_PUBLIC_AVAILABILITY_SCALE_FACTOR
        )
    }

    #forage() {
        /**
         * Handles the behaviour and all costs related to foraging
         * required to make this resource available.
         * @return: True if there was enough money to pay for this
         *          and false otherwise.
         */
        const dependency = this.#getIncomeDependency("ntfp")
        if (dependency > 0) {
            const cost = JSON.parse(
                process.env.NEXT_PUBLIC_INCOME_SOURCES
            ).ntfp.cost.maintenance
            const curFunds = this.#getFunds()
            if (curFunds.lt(cost)) return false
            this.#updateFunds(-1 * cost)
            this.#updateExpenses("ntfp", cost)
            return true
        } 
        return false
    }

    updateAvailability = () => {
        /** 
         * Updates how much of this resource is available.
         * Considers costs related to foraging/harvesting.
         */
        const foragingSuccessful = this.#forage()
        if (foragingSuccessful) {
            const def = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES).ntfp.availability
            let availabilityMax = utils.randomNormalSample(def.mean, def.sd)
            const biodiversityPc = this.#getBiodiversityPc()
            let availabilityBd = Math.max(0, availabilityMax - (
                this.#availabilityScaleFactor * availabilityMax * (1 - biodiversityPc)
            ))
            const deadwoodPc = this.#getDeadWoodPc()
            let availabilityDw = availabilityBd + (
                this.#availabilityScaleFactor * availabilityMax * deadwoodPc
            )
            this.available = availabilityDw
        } else {
            this.available = 0
        }
    }
}

export class Recreation extends IncomeSource {
    /** Class embodies income that hunting and fishing
     *  activities present. */

    #getBiodiversityPc
    #updateFunds
    #getIncomeDependency
    #getFunds
    #updateExpenses
    #isBuilt

    constructor(
        getBiodiversityPc, updateFunds, 
        getIncomeDependency, getFunds, updateExpenses
    ) {
        /**
         * Constructor.
         * @param getBiodiversityPc: Function that fetches latest 
         *                           biodiversity score.
         * @param updateFunds: Function that can be called to update
         *                     the user's bank balance.
         * @param getIncomeDependency: Function that can be used to fetch
         *                             current income dependency setting
         *                             for the NTFP income stream.
         * @param getFunds: Function that returns current bank balance.
         * @param updateExpenses: Function that can be used to update expenditure values.
         */
        super("recreation")
        this.#isBuilt = false // Whether infrastructure has been established yet.
        this.#getIncomeDependency = getIncomeDependency
        this.#updateFunds = updateFunds
        this.#getBiodiversityPc = getBiodiversityPc
        this.#getFunds = getFunds
        this.#updateExpenses = updateExpenses
    }

    #buildMaintain() {
        /**
         * Handles the behaviour and all costs related to building
         * infrastructure as well as maintaining it,
         * @return: True if there was enough money to build and/or 
         *          maintain infrastructure and false otherwise.
         */
        const dependency = this.#getIncomeDependency("recreation")
        if (dependency > 0)  {
            const curFunds = this.#getFunds()
            const costs = JSON.parse(
                process.env.NEXT_PUBLIC_INCOME_SOURCES
            ).recreation.cost
            const initialCost = costs.initial
            // const initialCost = 0 // Covered by grants and aids.
            const maintenanceCost = costs.maintenance
            // Build infrastructure if needed.
            if (!this.#isBuilt) {
                if (curFunds < (initialCost + maintenanceCost)) return false
                this.#updateFunds(-1 * initialCost)
                this.#updateExpenses("recreation", initialCost)
                this.#isBuilt = true
            }
            // Pay maintenance costs.
            if (curFunds.lt(maintenanceCost)) return false
            this.#updateFunds(-1 * maintenanceCost)
            this.#updateExpenses("recreation", maintenanceCost)
            return true
        }
        return false
    }

    updateAvailability = () => {
        /** 
         * Updates how much of this resource is available.
         * Handles payment of one time fixed amount as well
         * as maintainance costs.
         */
        const buildMaintainSuccessful = this.#buildMaintain()
        if (buildMaintainSuccessful) {
            const def = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES).recreation.availability
            let availabilityMax = utils.randomNormalSample(def.mean, def.sd)
            const biodiversityPc = this.#getBiodiversityPc()
            let availabilityBd = Math.max(0, availabilityMax - (
                availabilityMax * (1 - biodiversityPc)
            ))
            this.available = availabilityBd
        } else {
            this.available = 0
        }
    }

    sell() {
        /**
         * Income = price fetched for varying no. of visitors
         * + annual income from events that is assumed to be 
         * a fixed amount.
         */
        let fundsReceived = Big(0)
        if (this.available > 0) {
            fundsReceived = Big(
                (this.available - 2) * this._price.per_unit
            ).plus(this._price.per_year)
        }
        this.available = 0
        return fundsReceived
    }
}