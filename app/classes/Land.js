import Tree from './Tree'
import * as utils from '../utils.js'

export default class Land {
    /** This class models the land that is 
     *  available for the user to manage.
     */

    #updateCarbon
    #getAirCO2ppm

    constructor(updateCarbon, getAirCO2ppm) {
        /**
         * Constructor for object of this class.
         * @param updateCarbon: Function that can be used to update the amount of carbon
         *                      in the atmosphere. Needed to pass onto tree objects.
         * @param getAirCO2ppm: Function that gets current concentration of CO2 in the
         *                      atmosphere. Needed to pass onto tree objects.
         */
        this.#updateCarbon = updateCarbon
        this.#getAirCO2ppm = getAirCO2ppm
        this.size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        this.content = []
        for (let i = 0; i < this.size.rows; i++) {
            const row = [];
            for (let j = 0; j < this.size.columns; j++) row.push(null)
            this.content.push(row);
        }
        this.biodiversityCategory = "Unforested"
        this.biodiversityScore = 0
        this.getBiodiversityCategory = () => {
            /** 
             * Returns classification of this land that was 
             * computed using the biodiversity score. 
             */
            return this.biodiversityCategory
        }
        this.isLandFree = (row, column) => {
            /**
             * Checks if a given spot on the land is free.
             * @param row: Land grid row.
             * @param column: Land grid column.
             * @return: True if [row, column] is free and false otherwise.
             */
            // If the given position falls outside the size of the
            // land, then it is invalid and hence not free.
            if (
                row < 0 || row >= this.size.rows || 
                column < 0 || column >= this.size.columns
            ) return false
            return this.content[row][column] == null
        }
        this.sow = (treeType, position=null) => {
            /**
             * Function that adds a new seedling onto the land.
             * This action is successful only if there is a free
             * space available on the land.
             * @param treeType: The type of tree that is born.
             * @param position: The position at which the new plant is 
             *                  to grow. This is null by default, in which
             *                  case, the position is a random free spot.
             *                  If a position is defined, then 
             * @return: The tree that was planted or null if it was 
             *          not possible to sow.
             */

            let spot = position
            if (spot == null) {
                spot = this.#getRandomFreeSpot()
            }

            // If no free spot then cannot sow.
            if (typeof(spot) == 'number') {
                return null
            }
            
            const newTree = new Tree(
                spot, treeType,
                this.getBiodiversityCategory,
                this.isLandFree, this.#updateCarbon,
                this.sow, this.#getAirCO2ppm
            )
            this.content[spot[0]][spot[1]] = newTree
            
            return newTree
        }
        this.#initialize()
    }

    #initialize() {
        /**
         * Initializes the land to have a forest of 
         * predefined starting composition. 
        */
        let comp = JSON.parse(process.env.NEXT_PUBLIC_FOREST_COMPOSITION_START)
        comp = this.#getForestComposition(
            Object.values(this.size), comp.type, comp.age
        )
            
        // For each entry in the composition, sow a plant
        // of the desired type and and let it grow without reproducing 
        // until it reaches the resired age category.
        for (let i = 0; i < comp.length; i++) {
            const typeAge = comp[i]
            const tree = this.sow(typeAge.type)
            
            // No more space on land to plant.
            if (tree == null) break 
            
            // If it was indeed possible to plant a 
            // new tree, then disable reproduction
            // so as to achivve desired composition without
            // alterations introduced due to reproduction.
            tree.reproduction = false
            
            // Update timestep until this seedling 
            // grows to the desired age.
            let j = 0 // Infinite loop check.
            const loopLimit = 1000
            while (tree.lifeStage != typeAge.age && j < loopLimit) {
                tree.getOlder()
                j += 1
            }
            if (j >= loopLimit) console.log("infinite loop")

            // Reset reproduction to true as normal.
            tree.reproduction = true
        }

        // Compute latest biodiversity score.
        this.#updateBiodiversity()
    }

    #getForestComposition(landSize, typeComp, ageComp) {
        /**  
         * Computes how many spaces should have each type and age combination
         * of a tree.
         * @param landSize: The size of the land [rows, columns].
         * @param typeComp: Desired % of each type of tree {"type": %, ...}.
         * @param ageComp: Desired % of each age category of trees {"category": %, ...}.
         * @return composition: A list containing objects that specify tree
         *                      type and age combinations as many times as needed to 
         *                      meet given composition proportions.
        */
        const composition = []
        const numLandSpots = landSize[0] * landSize[1]
        for (const [typeName, typePc] of Object.entries(typeComp)) {
            for (const [ageCatName, ageCatPc] of Object.entries(ageComp)) {
                const numType = Math.round(typePc * numLandSpots)
                const numTypeAgeCat =  Math.round(ageCatPc * numType)
                for (let i=0; i<numTypeAgeCat; i++) {
                    composition.push({'type': typeName, 'age': ageCatName})
                }
            }
        }
        return composition
    }

    #countTrees() {
        /** 
         * Returns a count of no. of tree of each 
         * lifestage category on land. 
         * @return: No. of each type (species, life stage) of tree
         *          currently on the land.
         */
        let counts = {
            deciduous: 0, coniferous: 0,
            seedling: 0, sapling: 0, mature: 0, 
            old_growth: 0, senescent: 0, dead: 0
        }
   
        for (let x = 0; x < this.size.rows; x++) {
            for (let y = 0; y < this.size.columns; y++) {
                let entity = this.content[x][y]
                if (entity != null) {
                    counts[entity.treeType] += 1
                    counts[entity.lifeStage] += 1
                }
            }
        }

        return counts
    }

    #computeBiodiversityScore() {
        /** 
         * Calculate the biodiversity score of the land. 
         * @return: Biodiversity score.
         */
        
        let biodiversity = 0;

        const treeCounts = this.#countTrees();

        // Rule = Mixed forests with more trees => more biodiversity.
        // MIN = 0
        // MAX = num_rows * num_columns * 3
        const more = Math.max(treeCounts.coniferous, treeCounts.deciduous)
        const less = Math.min(treeCounts.coniferous, treeCounts.deciduous)
        const diff = more - less
        const sim = less
        biodiversity += 3 * (sim * 2)
        if (diff%2 == 0) biodiversity += 2 * diff
        else biodiversity += (2 * (diff - 1)) + 1

        // Rule = More old growth => more biodiversity.
        // MIN = 0
        // MAX = num_rows * num_columns * 3
        biodiversity += 0.5 * treeCounts.seedling
        biodiversity += 0.8 * treeCounts.sapling
        biodiversity += 2 * treeCounts.mature
        biodiversity += 3 * treeCounts.old_growth
        biodiversity += 1 * treeCounts.dead

        // MIN = 0
        // MAX = 2 * num_rows * num_columns * 3
        return (biodiversity/(2 * this.size.rows * this.size.columns * 3)).toFixed(2)
    }

    #computeBiodiversityCategory() {
        /** 
         * Computes the category ("unforested", "plantation", 
         * "forest", or "ecosystem") that this land currently
         * may be classified as.
         * @return: Land classification based on biodiveristy score.
        */
        const categoryScoreRanges = JSON.parse(
            process.env.NEXT_PUBLIC_BIODIVERSITY_CATEGORIES
        )
        for (const [category, scoreRange] of Object.entries(categoryScoreRanges)) {
            if (
                this.biodiversityScore >= scoreRange[0] &&
                this.biodiversityScore < scoreRange[1]
            ) {
                return category
            }
        }
    }

    #getFreeSpaces() {
        /**
         * Returns an array of spaces that are free.
         * @return: List of [x, y] spots on the land with no entities.
         */
        let freeSpaces = []
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.columns; j++) {
                if (this.content[i][j] == null) {
                    freeSpaces.push([i, j])
                }
            }
        }
        return freeSpaces
    }

    #getRandomFreeSpot() {
        /**
         * Returns a random free spot on land.
         * @return: Returns [x, y] coordinates of a random spot
         *          on the forest floor where there are not entities.
         *          If no such spot exists, then -1 is returned.
         */
        const freeSpots = this.#getFreeSpaces()
        const numFreeSpots = freeSpots.length
        if (numFreeSpots == 0) return -1 
        const randomSpotIdx = utils.getRandomIntegerBetween(0, numFreeSpots-1)
        return freeSpots[randomSpotIdx]
    }

    #updateBiodiversity() {
        /** 
         * Computes and updates biodiversity of the land
         * based on current land content.
         */
        this.biodiversityScore = this.#computeBiodiversityScore()
        this.biodiversityCategory = this.#computeBiodiversityCategory()
    }

    takeTimeStep() {
        /**
         * Step forward in time by one step.
         * All trees on the land age by 1 time unit.
         * If any of the trees that did exist no longer
         * exist after the aging, then they are removed
         * from the land.
         */

        // Shuffle order.
        let contentPositions = []
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.columns; j++) {
                contentPositions.push([i, j])
            }
        }
        contentPositions = utils.shuffle(contentPositions) 

        // Age each tree by 1 timestep.
        for (const pos of contentPositions) {
            const entity = this.content[pos[0]][pos[1]]
            if (entity != null) {
                const stillExists = entity.getOlder() // Entity ages by 1 time unit.
                if (!stillExists) {
                    // After aging, if this entity no longer
                    // exists on land, then set corresponding
                    // position on land to null to reflect this.
                    this.content[pos[0]][pos[1]] = null
                    console.log("Entity at position (", pos, ") no longer exists.")
                }
            }
        }

        // Update biodiversity.
        this.#updateBiodiversity()
    }
}