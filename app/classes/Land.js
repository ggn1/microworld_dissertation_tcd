import Big from 'big.js'
import Tree from './Tree'
import * as utils from '../utils.js'

let initSowPositions = []

export default class Land {
    /** 
     * This class models the land that is 
     * available for the user to manage.
     */

    #updateCarbon
    #getAirCO2ppm
    #getCarbon
    #timestepOrder

    constructor(updateCarbon, getCarbon, getAirCO2ppm) {
        /**
         * Constructor for object of this class.
         * @param updateCarbon: Function that can be used to update the amount of carbon
         *                      in the atmosphere. Needed to pass onto tree objects.
         * @param getAirCO2ppm: Function that gets current concentration of CO2 in the
         *                      atmosphere. Needed to pass onto tree objects.
         */
        this.#updateCarbon = updateCarbon
        this.#getAirCO2ppm = getAirCO2ppm
        this.#getCarbon = getCarbon
        this.size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        this.#timestepOrder = []// Shuffle order.
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.columns; j++) {
                this.#timestepOrder.push([i, j])
            }
        }
        this.#timestepOrder = utils.shuffle(this.#timestepOrder)
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
             *                  If a position is defined, then this is where
             *                  the plant is sown.
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

        // For each entry in the composition definition, 
        // sow a plant of the desired type.
        const numSpots = Math.round(
            (this.size.rows * this.size.columns) * 
            (1 - JSON.parse(process.env.NEXT_PUBLIC_LAND_FREE_PC_START))
        )
        const compDef = Object.entries(JSON.parse(
            process.env.NEXT_PUBLIC_SPECIES_COMPOSITION_START
        ))
        let spotIdx = 0
        for (const [typeName, typePc] of compDef) {
            const numType = Math.round(typePc * numSpots)
            for (let i=0; i<numType; i++) {
                let spot = null
                if (initSowPositions.length <= spotIdx) {
                    spot = this.#getRandomFreeSpot()
                    if (typeof(spot) == "number") return // No more space on land.
                    initSowPositions.push(spot)
                } else spot = initSowPositions[spotIdx]
                this.sow(typeName, spot)
                console.log(`Sowed a ${typeName} tree at position ${spot}.`)
                spotIdx += 1
            }
        }

        // Compute latest biodiversity score.
        this.#updateBiodiversity()

        // Soil releases a portion of the carbon stored in it.
        this.#releaseCarbonFromSoil()

        // // Let the forest grow for some years.
        // for (let i = 0; i < JSON.parse(process.env.NEXT_PUBLIC_INIT_NUM_YEARS); i++) {
        //     this.takeTimeStep()
        // }
    }

    #releaseCarbonFromSoil() {
        /** 
         * Each time step, a certain amount of the carbon 
         * in the soil is released back into the atmosphere.
         */
        const carbonSoil = this.#getCarbon().soil
        const soilCarbonReleasePc = JSON.parse(process.env.NEXT_PUBLIC_SOIL_RELEASE_PC)
        const releasedWeight = carbonSoil.mul(soilCarbonReleasePc)
        this.#updateCarbon({"soil":releasedWeight.mul(-1), "air":releasedWeight})
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

        // Each tree gets older by 1 time unit.
        for (const pos of this.#timestepOrder) {
            const entity = this.content[pos[0]][pos[1]]
            if (entity != null) {
                const stillExists = entity.getOlder() // Entity ages by 1 time unit.
                if (!stillExists) {
                    // After aging, if this entity no longer
                    // exists on land, then set corresponding
                    // position on land to null to reflect this.
                    this.content[pos[0]][pos[1]] = null
                }
            }
        }

        // Soil releases a portion of the carbon stored in it.
        this.#releaseCarbonFromSoil()

        // Update biodiversity.
        this.#updateBiodiversity()

        // Print ratios.
        const carbon = this.#getCarbon()
        if (carbon.vegetation > 0 && carbon.air > 0) {
            console.log(
                "soil / vegetation =", 
                carbon.soil.div(carbon.vegetation).toNumber().toFixed(2),
                "[ideally 2.54]\n",
                "soil / air =", 
                carbon.soil.div(carbon.air).toNumber().toFixed(2),
                "[ideally 1.87]"
            )
        }
    }
}