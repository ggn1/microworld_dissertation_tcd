import Tolerance from "./Tolerance.js"

export default class Tree {
    /** This class encompases a tree object. */
    
    constructor(position, tree_type) {
        /** Constructor.
         *  @param position: The index of the row and column 
         *                   corresponding to the position of this tree.
         *  @param tree_type: The type of this tree ["coniferous", "deciduous"].
         */
        this.tree_type = tree_type
        this.position = position
        this.height = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_START_SEEDLING)
        this.diameter = this.getDiameterFromHeight(this.height, this.tree_type)
        this.stress = 0
        this.age = 0
        this.biodiversityReductionFactor = JSON.parse(process.env.NEXT_PUBLIC_BD_REDUCTION)
        this.maxHeight = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_MAX)[this.tree_type]
        this.maxDiameter = this.getDiameterFromHeight(this.maxHeight, this.tree_type)
        this.maxAge = 0 // TO DO ...
        this.reproductionInterval = JSON.parse(
            process.env.NEXT_PUBLIC_REPRODUCTION_INTERVAL
        )[this.tree_type]
        this.woodDensity = JSON.parse(process.env.NEXT_PUBLIC_WOOD_DENSITY)[this.tree_type]
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
        /** Constructor. 
         *  @param position: The index of the row and column of this tree.
        */
        super(position, "coniferous")
        this.stressors = {
            temperature: {
                premature: new Tolerance(), // TO DO ...
                mature: new Tolerance() // TO DO ...
            },
            co2: {
                premature: new Tolerance(), // TO DO ...
                mature: new Tolerance() // TO DO ...
            }
        }
    }
}

export class Deciduous extends Tree {
    /** This class embodies a coniferous tree. 
     *  @param position: The index of the row and column of this tree.
    */
    constructor(position) {
        super(position, "deciduous")
        this.stressors = {
            temperature: {
                premature: new Tolerance(), // TO DO ...
                mature: new Tolerance() // TO DO ...
            },
            co2: {
                premature: new Tolerance(), // TO DO ...
                mature: new Tolerance() // TO DO ...
            }
        }
    }
}