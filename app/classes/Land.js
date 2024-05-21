import Tree from './Tree'
import * as utils from '../utils.js'

export default class Land {
    /** This class models the land that is 
     *  available for the user to manage.
     */

    #biodiversityScore = 0
    #updateCarbon

    constructor(updateCarbon) {
        /**
         * Constructor for object of this class.
         * @param updateCarbon: Function that can be used to update the amount of carbon
         *                      in the atmosphere. Needed to pass onto tree objects.
         */
        this.#updateCarbon = updateCarbon
        this.size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        this.content = []
        for (let i = 0; i < this.size.rows; i++) {
            const row = [];
            for (let j = 0; j < this.size.columns; j++) row.push(null)
            this.content.push(row);
        }
        this.biodiversityCategory = "unforested"
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
                row < 0 || row >= this.size[0] || 
                column < 0 || column >= this.size[1]
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
                this.sow
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

        console.log(comp)
            
        // For each entry in the composition, sow a plant
        // of the desired type and and let it grow without reproducing 
        // until it reaches the resired age category.
        for (let i = 0; i < comp.length; i++) {
            const typeAge = comp[i]
            const seedling = this.sow(typeAge.type)
            
            if (seedling == null) break // No more space on land to plant.
            
            // If it was indeed possible to plant a 
            // new tree, then disable reproduction
            // so as to achivve desired composition without
            // alterations introduced due to reproduction.
            seedling.reproduction = false
            
            // Update timestep until this seedling 
            // grows to the desired age.
            let j = 0 // Infinite loop check.
            while (seedling.lifeStage != typeAge.age && j < 110) {
                seedling.getOlder()
                j += 1
            }
            if (j >= 110) {
                console.log("infinite loop")
            }
        }
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

        for (let x = 0; x <= this.size[0]; x++) {
            for (let y = 0; y <= this.size[1]; x++) {
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
        // MAX = (num_rows/2) * (num_columns/2) * 3
        const more = Math.max(treeCounts.coniferous, treeCounts.deciduous)
        const less = Math.min(treeCounts.coniferous, treeCounts.deciduous)
        const different = more - less
        const similar = less
        biodiversity += 3 * (similar * 2)
        if (different%2 == 0) biodiversity += 2 * different
        else biodiversity += (2 * (different - 1)) + 1

        // Rule = More old growth => more biodiversity.
        // MIN = 0
        // MAX = (num_rows/2) * (num_columns/2) * 3
        biodiversity += 0.5 * treeCounts.seedling
        biodiversity += 0.8 * treeCounts.sapling
        biodiversity += 2 * treeCounts.mature
        biodiversity += 3 * treeCounts.old_growth
        biodiversity += 1 * treeCounts.dead

        return biodiversity
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
        for (const [category, scoreRange] in categoryScoreRanges) {
            if (
                this.#biodiversityScore >= scoreRange[0] &&
                this.#biodiversityScore < scoreRange[1]
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

    updateBiodiversity() {
        /** 
         * Computes and updates biodiversity of the land
         * based on current land content.
         */
        this.#biodiversityScore = this.#computeBiodiversityScore()
        this.biodiversityCategory = this.#computeBiodiversityCategory()
    }
}