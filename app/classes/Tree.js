import * as utils from '../utils.js'
import Tolerance from "./Tolerance.js"

export default class Tree {
    /** This class embodies a tree. */

    #cPercent = JSON.parse(process.env.NEXT_PUBLIC_C_PC_TREE)
    
    constructor(position, treeType) {
        /** 
         * Constructor.
         * @param position: The index of the row and column corresponding to the 
         *                  position of this tree as a list [x, y].
         * @param treeType: The type of this tree ["coniferous", "deciduous"].
         */
        this.treeType = treeType
        this.position = position
        this.height = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_START_SEEDLING)
        this.diameter = this.getDiameterFromHeight(this.height, this.treeType)
        this.stress = 0
        this.age = 0
        this.lifeStages = JSON.parse(process.env.NEXT_PUBLIC_LIFE_STAGE_TREE)[this.treeType]
        this.biodiversityReductionFactor = JSON.parse(process.env.NEXT_PUBLIC_BD_REDUCTION)
        this.heightMax = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_MAX)[this.treeType]
        this.diameterMax = this.getDiameterFromHeight(this.heightMax, this.treeType)
        const ageMax = this.lifeStages.senescent
        this.ageMax = utils.getRandomIntegerBetween(ageMax[0], ageMax[1])
        this.reproductionInterval = JSON.parse(
            process.env.NEXT_PUBLIC_REPRODUCTION_INTERVAL
        )[this.treeType]
        this.woodDensity = JSON.parse(process.env.NEXT_PUBLIC_WOOD_DENSITY)[this.treeType]
        this.rgr = JSON.parse(process.env.NEXT_PUBLIC_RGR)[this.treeType]
        const tolerance_co2 = JSON.parse(process.env.NEXT_PUBLIC_TOLERANCE_CO2)
        this.tolerance = {"co2": {
            "mature": new Tolerance(tolerance_co2.mature),
            "premature": new Tolerance(tolerance_co2.premature)
        }}
    }

    isAlive() {
        /** 
         * Function to check whether this tree is still alive.
         * @return: True if the tree is alive and False otherwise.
         */
        return this.stress < 1
    }

    getDiameterFromHeight(height, treeType) {
        /** Computes diameter of this tree. 
         *  @param height: Height of the tree in meters.
         *  @param treeType: Type of tree ["coniferous", "deciduous"].
         *  @return: Diameter of the tree in meters.
        */
        return height * JSON.parse(process.env.NEXT_PUBLIC_HDR)[treeType].diameter
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
        /**
         * Returns the stage of life that this tree is currently in.
         * @return: The string that identifies the current 
         *          life stage of this tree.
         */

        // Check if this tree is dead.
        let lifeStage = "dead"
        if (this.isAlive()) {
            for (const [stageName, stageAgeLimit] of Object.entries(this.lifeStages)) {
                if (typeof(stageAgeLimit) != "number") lifeStage = stageName
                if (this.age < stageAgeLimit) {
                    lifeStage = stageName
                    break
                }
            }
        }
        return lifeStage
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