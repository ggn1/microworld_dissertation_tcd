import * as utils from '../utils.js'
import Tolerance from "./Tolerance.js"

export default class Tree {
    /** This class embodies a tree. */

    #c_percent = JSON.parse(process.env.NEXT_PUBLIC_C_PC_TREE)
    
    constructor(position, tree_type) {
        /** 
         * Constructor.
         * @param position: The index of the row and column corresponding to the 
         *                  position of this tree as a list [x, y].
         * @param tree_type: The type of this tree ["coniferous", "deciduous"].
         */
        this.tree_type = tree_type
        this.position = position
        this.height = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_START_SEEDLING)
        this.diameter = this.getDiameterFromHeight(this.height, this.tree_type)
        this.stress = 0
        this.age = 0
        this.age_stages = JSON.parse(process.env.NEXT_PUBLIC_AGE)[this.tree_type]
        this.biodiversityReductionFactor = JSON.parse(process.env.NEXT_PUBLIC_BD_REDUCTION)
        this.heightMax = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_MAX)[this.tree_type]
        this.diameterMax = this.getDiameterFromHeight(this.heightMax, this.tree_type)
        const ageMax = this.age_stages.senescent
        this.ageMax = utils.getRandomIntegerBetween(ageMax[0], ageMax[1])
        this.reproductionInterval = JSON.parse(
            process.env.NEXT_PUBLIC_REPRODUCTION_INTERVAL
        )[this.tree_type]
        this.woodDensity = JSON.parse(process.env.NEXT_PUBLIC_WOOD_DENSITY)[this.tree_type]
        this.rgr = JSON.parse(process.env.NEXT_PUBLIC_RGR)[this.tree_type]
        const tolerance_co2 = JSON.parse(process.env.NEXT_PUBLIC_TOLERANCE_CO2)
        this.tolerance = {"co2": {
            "mature": new Tolerance(tolerance_co2.mature),
            "premature": new Tolerance(tolerance_co2.premature)
        }}
    }

    getDiameterFromHeight(height, tree_type) {
        /** Computes diameter of this tree. 
         *  @param height: Height of the tree in meters.
         *  @param tree_type: Type of tree ["coniferous", "deciduous"].
         *  @return: Diameter of the tree in meters.
        */
        return height * JSON.parse(process.env.NEXT_PUBLIC_HDR)[tree_type].diameter
    }

    computeBiodiversityReduction() {
        // TO DO ...
    }

    computeVolume() {
        // TO DO ...
    }

    updateStress() {
        // TO DO ...
    }

    computeGrowthRate() {
        // TO DO ...
    }

    grow() {
        // TO DO ...
    }

    absorbCO2() {
        // TO DO ...
    }

    growOlder() {
        // TO DO ...
    }

    getLifeStage() {
        // TO DO ...
    }

    live() {
        // TO DO ...
    }

    decay() {
        // TO DO ...
    }

    reproduce() {
        // TO DO ...
    }
}

export class Coniferous extends Tree {
    /** This class embodies a coniferous tree. */
    
    constructor(position) {
        /**
         * Construcor.
         * @param position: The index of the row and column of this tree.
         */
        super(position, "coniferous")
    }
}

export class Deciduous extends Tree {
    /** This class embodies a deciduous tree. */

    constructor(position) {
        /**
         * Construcor.
         * @param position: The index of the row and column of this tree.
         */
        super(position, "deciduous")
    }
}