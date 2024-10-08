import Tree from './Tree'
import * as utils from '../utils.js'

let initSowPositions = [] // Initial positions wherein plants were sown.
let timeStepOrder = [] // The order in which each spot on land is visited.

export default class Land {
    /** 
     * This class models the land that is 
     * available for the user to manage.
     */

    #updateCarbon
    #getAirCO2ppm
    #getCarbon
    constructor(updateCarbon, getCarbon, getAirCO2ppm) {
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
        let row = []
        for (let i = 0; i < this.size.rows; i++) {
            row = []
            for (let j = 0; j < this.size.columns; j++) row.push([])
            this.content.push(row)
        }
        this.biodiversityCategory = "Unforested"
        this.biodiversityScore = 0
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
        let spot = null
        for (const [typeName, typePc] of compDef) {
            const numType = Math.round(typePc * numSpots)
            for (let i = 0; i < numType; i++) {
                spot = null
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
    }

    #countTrees = () => {
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
   
        let spotContent = []
        let entity = null
        for (let x = 0; x < this.size.rows; x++) {
            for (let y = 0; y < this.size.columns; y++) {
                spotContent = this.content[x][y]
                if (spotContent.length > 0) { // Count only latest tree on land.
                    entity = spotContent[spotContent.length-1]
                    counts[entity.treeType] += 1
                    counts[entity.lifeStage] += 1
                }
            }
        }

        return counts
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

    #computeBiodiversityScore() {
        /** 
         * Calculate the biodiversity score of the land. 
         * @return: Biodiversity score.
         */
        
        let bSpecies = 0
        let bAge = 0
        let b = 0
        const ageComp = JSON.parse(process.env.NEXT_PUBLIC_LAND_AGE_COMP)

        const treeCounts = this.#countTrees()

        // Rule: Mixed forests with more trees => more biodiversity.
        const more = Math.max(treeCounts.coniferous, treeCounts.deciduous)
        const less = Math.min(treeCounts.coniferous, treeCounts.deciduous)
        const diff = more - less
        const sim = less
        bSpecies += 1 * sim * 2
        if (diff%2 == 0) bSpecies += 0.3 * diff
        else bSpecies += (0.5 * (diff - 1)) + 0.05
        bSpecies = bSpecies/(this.size.rows * this.size.columns) // scale

        // Rule: Healthy forest = Mix of different ages.
        let count = {
            "seedling-sapling":0, "mature":0, 
            "old_growth-senescent":0, "dead":0,
            "total": 0
        }
        for (const group of Object.keys(ageComp)) {
            for (const lifeStage of group.split("-")) {
                count[group] += treeCounts[lifeStage]
                count.total += treeCounts[lifeStage]
            }
        }

        let prop = {}
        for (const group of Object.keys(ageComp)) {
            prop[group] = count[group]/count.total
        }

        let errorMax = {}
        for (const group of Object.keys(ageComp)) {
            errorMax[group] = Math.max(
                1 - ageComp[group], 
                ageComp[group] - 0
            )
        }
        
        for (const group of Object.keys(ageComp)) {
            let error = Math.abs(prop[group] - ageComp[group])
            bAge += 1 - (error/errorMax[group])
        }
        bAge = bAge/Object.keys(ageComp).length

        // Avg. biodiversity score.
        b = ((bSpecies+bAge)/2).toFixed(2)
        
        return b
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
                this.biodiversityScore > scoreRange[0] &&
                this.biodiversityScore <= scoreRange[1]
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
                if (this.isLandFree(i, j)) {
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
        let spotContent = []
        let entity = null
        let stillExists = false
        for (const pos of timeStepOrder) {
            spotContent = this.content[pos[0]][pos[1]]
            for (let i = 0; i < spotContent.length; i++) {
                entity = spotContent[i]
                stillExists = entity.getOlder() // Entity ages by 1 time unit.
                if (!stillExists) {
                    // After aging, if this entity no longer
                    // exists on land, then remove tree object
                    // from the land to reflect this.
                    this.content[pos[0]][pos[1]].splice(i, 1)
                }
            }
        }

        // Soil releases a portion of the carbon stored in it.
        this.#releaseCarbonFromSoil()

        // Update biodiversity.
        this.#updateBiodiversity()
    }

    getTree (treeType, treeLifeStage) {
        /** 
         * Returns the position of a given type of active
         * tree (latest tree on land) if available.
         * @param treeType: Type of the tree.
         * @param treeLifeStage: Life stage of the tree.
         * @return: Position [x, y] of the tree or [-1, -1]
         *          if no such tree is present on land.
         */
        let spotContent = []
        let entity = null
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.columns; j++) {
                spotContent = this.content[i][j]
                for (let k = 0; k < spotContent.length; k++) {
                    entity = spotContent[k]
                    if (
                        entity.treeType == treeType &&
                        entity.lifeStage == treeLifeStage
                    ) return [i, j]
                }
            }
        }
        return [-1, -1]
    }

    isLandFree = (row, column) => {
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
        
        // A spot on the land is considered free for
        // planting if it is empty.
        const spotContent = this.content[row][column]
        if (spotContent.length == 0) return true
        
        // It is also considered to be free if there is
        // only one decayed tree on it with a fraction of
        // original max height remaining.
        if (spotContent.length == 1) {
            const spotContentLatest = spotContent[0]
            if (
                spotContentLatest.lifeStage == "dead" &&
                spotContentLatest.height <= JSON.parse(
                    process.env.NEXT_PUBLIC_HEIGHT_MAX
                )[spotContentLatest.treeType] * JSON.parse(
                    process.env.NEXT_PUBLIC_DECAY_HEIGHT_THRESHOLD
                )
            ) return true
        }
        return false
    }
    
    plantTree = (treeType, position) => {
        /**
         * Function that adds a new seedling onto the land.
         * This action is successful only if there is a free
         * space available on the land.
         * @param treeType: The type of tree that is born.
         * @param position: The [x, y] position at which the new plant is 
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
            () => {return this.biodiversityCategory},
            this.isLandFree, this.#updateCarbon,
            this.plantTree, this.#getAirCO2ppm
        )
        this.content[position[0]][position[1]].push(newTree)
        return newTree
    }

    fellTree = (position, treeType, treeLifeStage) => {
        /**
         * Fells one or more trees on the land.
         * @param position: Position of the tree to fell
         * @param treeType: The type of tree to fell (deciduous/coniferous).
         * @param treeLifeStage: The stage of life at which the tree to be 
         *                       felled must be at.
         * @return: Whether it was possible to execute this action 
         *          (1) or not (0).
         */ 
        const landSpot = this.content[position[0]][position[1]]
        if (landSpot.length == null) return [0, 0]
        const tree = landSpot[landSpot.length - 1]
        if (
            tree.treeType != treeType ||
            tree.lifeStage != treeLifeStage
        ) return [0, 0]
        
        // Tree is chopped. So, it's stress levels 
        // are set to 1.
        tree.updateStress((1-tree.stress))

        // Get volume of the tree that will be harvested.
        const heightHarvested = tree.height * (1 - JSON.parse(
            process.env.NEXT_PUBLIC_TREE_REMAINS_AFTER_FELL
        ))
        const radius = tree.diameter/2
        const volumeHarvested = utils.volumeCylinder(heightHarvested, radius)

        // Remove harvested portion of the tree.
        tree.updateHeight(-1*heightHarvested)

        // Compute weight of the tree that is harvested.
        const weightHarvested = volumeHarvested * tree.woodDensity
        return [1, weightHarvested]
    }

    getInitSowPositions = () => {
        /**
         * Returns initial sowing positions as currently saved.
         * @return: Initial sow positions.
         */
        return initSowPositions
    }

    setInitSowPositions = (sowPositions) => {
        /**
         * Updates initial sowing positions.
         * @param sowPositions: New positions.
         */
        initSowPositions = sowPositions
    }

    getTimeStepOrder = () => {
        /**
         * Returns current random order in which to
         * visit each spot on the land.
         * @return: Time step order.
         */
        return timeStepOrder
    }

    setTimeStepOrder = (order) => {
        /**
         * Updates time step order.
         * @param order: New order.
         */
        timeStepOrder = order
    }

    getDeadWoodPc = () => {
        /**
         * Computes percent of the land that has deadwood.
         * @return: Percent of the land with deadwood.
         */
        const landSpotsTotal = this.size.rows * this.size.columns
        let spotContent = []
        let landSpotsDeadWood = 0
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.columns; j++) {
                spotContent = this.content[i][j]
                for (let k = 0; k < spotContent.length; k++) {
                    if (
                        this.content[i][j] != null &&
                        this.content[i][j].lifeStage == "dead"
                    ) {
                        landSpotsDeadWood += 1
                        break
                    }
                }
            }
        }
        return landSpotsDeadWood/landSpotsTotal
    }

    getBiodiversityPc = () => {
        /**
         * Returns biodiversity score.
         * @return: Biodiversity score [0, 1].
         */
        return this.biodiversityScore
    }

    getActiveLandContent = () => {
        /**
         * Gets latest land content (last added
         * tree to the list of trees on each land spot).
         * If a spot has no trees, then null is returned
         * for this position.
         * @return: 2D list of positions on land and its
         *          latest tree / null if empty.
         */
        let activeContent = []
        let spotContent = []
        let row = []
        for (let i = 0; i < this.size.rows; i++) {
            row = []
            for (let j = 0; j < this.size.columns; j++) {
                spotContent = this.content[i][j]
                if (spotContent.length == 0) row.push(null)
                else row.push(spotContent[spotContent.length-1])
            }
            activeContent.push(row)
        }
        return activeContent
    }
}