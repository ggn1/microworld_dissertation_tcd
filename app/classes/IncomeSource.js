// References: 
// * https://openknowledge.fao.org/items/930b98d1-9172-4582-aeb3-0b65be35a5a2
// * https://holdenfg.org/blog/profit-from-the-woods/

export default class IncomeSource {
    /** Class that represents one source of income
     *  from the forest. */
    
    constructor(unit, price_per_unit) {
        this.demand = 0
        this.available = 0
        this.unit = unit
        this.price_per_unit = price_per_unit
    }

    getIncome() {
        // TO DO ...
    }
}

export class Timber extends IncomeSource {
    /** Class embodies income that the means of income
     *  that wood presents. */

    constructor(unit, price_per_unit) {
        super(unit, price_per_unit)
        const timber_usage = JSON.parse(process.env.NEXT_PUBLIC_TIMBER_USAGE)
        this.usage = {
            lumber: timber_usage.lumber,
            energy: timber_usage.energy
        }
    }

    getIncome(wood_weight, wood_type) {
        /** Given the amount and type of wood, 
         *  returns income.
         *  @param wood_weight: Weight of the wood in Kgs.
         *  @param wood_type: Type of wood (hard/soft).
         *  @return income: Earning from given wood in Barcons.
        */
       // TO DO ...
    }
}

export class NTFP extends IncomeSource {
    /** Class embodies income that non-timber forest
     *  products like mushrooms, berries and honey presents. */

    getIncome() {
        // TO DO ...
    }
}

export class RecreationalActivities extends IncomeSource {
    /** Class embodies income that hunting and fishing
     *  activities present. */

    getIncome(biodiversity) {
        // TO DO ...
    }
}

export class EcosystemServices extends IncomeSource {
    /** Class embodies income that can be earned 
     *  due to funds for ecosystem services. */
    
    getIncome(biodiversity) {
        // TO DO ...
    }
}