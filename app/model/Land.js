import Tree from './Tree'
import * as utils from '../utils.js'

let initSowPositions = [] // Initial positions wherein plants were sown.
let timeStepOrder = [] // The which each spot on land is visited.

export default class Land {
    /** 
     * This class models the land that is 
     * available for the user to manage.
     */

    #updateCarbon
    #getAirCO2ppm
    #getCarbon

    constructor(
        updateCarbon, getCarbon, getAirCO2ppm, 
        sowPositions=null, timeOrder=null
    ) {
        /**
         * Constructor for object of this class.
         * @param updateCarbon: Function that can be used to update the amount of carbon
         *                      in the atmosphere. Needed to pass onto tree objects.
         * @param getCarbon: Gets the carbon in each reservoir.
         * @param getAirCO2ppm: Function that gets current concentration of CO2 in the
         *                      atmosphere. Needed to pass onto tree objects.
         * @param sowPositions: Initial land sow positions.
         * @param timeOrder: The order in which to visit trees at 
         *                   each position on land.
         */
        this.#updateCarbon = updateCarbon
        this.#getAirCO2ppm = getAirCO2ppm
        this.#getCarbon = getCarbon
        if (sowPositions != null) initSowPositions = sowPositions
        if (timeOrder != null) timeStepOrder = timeOrder
        this.size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        if (timeStepOrder.length == 0) {
            for (let i = 0; i < this.size.rows; i++) {
                for (let j = 0; j < this.size.columns; j++) {
                    timeStepOrder.push([i, j])
                }
            }
            timeStepOrder = utils.shuffle(timeStepOrder)
        }
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
        this.plantTree = (treeType, position) => {
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
             * @return: The tree that was planted or 0 if it was 
             *          not possible to sow.
             */

            // Can only plant at a position if it is free.
            const landFree = this.isLandFree(position[0], position[1])
            if (!landFree) return 0
            
            const newTree = new Tree(
                position, treeType,
                this.getBiodiversityCategory,
                this.isLandFree, this.#updateCarbon,
                this.plantTree, this.#getAirCO2ppm
            )
            this.content[position[0]][position[1]] = newTree
            return newTree
        }
        this.fellTree = (position, treeType, treeLifeStage) => {
            /**
             * Fells one or more trees on the land.
             * @param position: Position of the tree to fell
             * @param treeType: The type of tree to fell (deciduous/coniferous).
             * @param treeLifeStage: The stage of life at which the tree to be 
             *                       felled must be at.
             * @return: Whether it was possible to execute this action 
             *          (1) or not (0).
             */ 
            const tree = this.content[position[0]][position[1]]
            if (
                tree == null ||
                tree.treeType != treeType ||
                tree.lifeStage != treeLifeStage
            ) return [0, 0]
            
            // Tree is chopped. So, it's stress levels 
            // are set to 1.
            tree.updateStress((1-tree.stress))

            // Get volume of the tree that will be harvested.
            const heightHarvested = tree.height * (1 - JSON.parse(
                process.env.NEXT_PUBLIC_TREE_VOLUME_REMAINS_AFTER_FELL
            ))
            const radius = tree.diameter/2
            const volumeHarvested = utils.volumeCylinder(heightHarvested, radius)

            // Remove harvested portion of the tree.
            tree.updateHeight(-1*heightHarvested)

            // Compute weight of the tree that is harvested.
            const weightHarvested = volumeHarvested * tree.woodDensity
            return [1, weightHarvested]
        }
        this.#initialize()
        this.getInitSowPositions = () => {
            /**
             * Returns initial sowing positions as currently saved.
             * @return: Initial sow positions.
             */
            return initSowPositions
        }
        this.getTimeStepOrder = () => {
            /**
             * Returns current random order in which to
             * visit each spot on the land.
             * @return: Time step order.
             */
            return timeStepOrder
        }
        this.setInitSowPositions = (sowPositions) => {
            /**
             * Updates initial sowing positions.
             * @param sowPositions: New positions.
             */
            initSowPositions = sowPositions
        }
        this.setTimeStepOrder = (order) => {
            /**
             * Updates time step order.
             * @param order: New order.
             */
            timeStepOrder = order
        }
        this.getDeadWoodPc = () => {
            /**
             * Computes percent of the land that has deadwood.
             * @return: Percent of the land with deadwood.
             */
            const landSpotsTotal = this.size.rows * this.size.columns
            let landSpotsDeadWood = 0
            for (let i = 0; i < this.size.rows; i++) {
                for (let j = 0; j < this.size.columns; j++) {
                    if (
                        this.content[i][j] != null &&
                        this.content[i][j].lifeStage == "dead"
                    ) landSpotsDeadWood += 1
                }
            }
            return landSpotsDeadWood/landSpotsTotal
        } 
        this.getBiodiversityPc = () => {
            /**
             * Returns biodiversity score.
             * @return: Biodiversity score [0, 1].
             */
            return this.biodiversityScore
        }
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
                this.plantTree(typeName, spot)
                spotIdx += 1
            }
        }

        // Compute latest biodiversity score.
        this.#updateBiodiversity()

        // Soil releases a portion of the carbon stored in it.
        this.#releaseCarbonFromSoil()

        // Let the forest grow for some years.
        for (let i = 0; i < JSON.parse(process.env.NEXT_PUBLIC_INIT_NUM_YEARS); i++) {
            this.takeTimeStep()
        }
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

    #getRandomFreeSpot() {
        /**
         * Returns a random free spot on land.
         * @return: Returns [x, y] coordinates of a random spot
         *          on the forest floor where there are not entities.
         *          If no such spot exists, then -1 is returned.
         */
        const freeSpots = this.getFreeSpaces()
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

    getFreeSpaces() {
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

    takeTimeStep() {
        /**
         * Step forward in time by one step.
         * All trees on the land age by 1 time unit.
         * If any of the trees that did exist no longer
         * exist after the aging, then they are removed
         * from the land.
         */

        // Each tree gets older by 1 time unit.
        for (const pos of timeStepOrder) {
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

        // // Print ratios.
        // const carbon = this.#getCarbon()
        // if (carbon.vegetation > 0 && carbon.air > 0) {
        //     console.log(
        //         "soil / vegetation =", 
        //         carbon.soil.div(carbon.vegetation).toNumber().toFixed(2),
        //         "[ideally 2.54]\n",
        //         "soil / air =", 
        //         carbon.soil.div(carbon.air).toNumber().toFixed(2),
        //         "[ideally 1.87]"
        //     )
        // }
    }

    getTree (treeType, treeLifeStage) {
        /** 
         * Returns the position of a given type of tree
         * if available.
         * @param treeType: Type of the tree.
         * @param treeLifeStage: Life stage of the tree.
         * @return: Position [x, y] of the tree or [-1, -1]
         *          if no such tree is present on land.
         */
        let entity = null
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.columns; j++) {
                entity = this.content[i][j]
                if (
                    entity != null // Entity is a tree.
                    && entity.treeType == treeType
                    && entity.lifeStage == treeLifeStage
                ) return [i, j]
            }
        }
        return [-1, -1]
    }
}