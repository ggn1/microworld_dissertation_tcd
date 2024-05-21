import * as utils from '../utils.js'
import Tree from './Tree';

export default class Land {
    /** This class models the land that is 
     *  available for the user to manage.
     */

    #biodiversityScore = 0

    constructor() {
        this.size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        this.content = []
        for (let i = 0; i < this.size.rows; i++) {
            const row = [];
            for (let j = 0; j < this.size.columns; j++) {
                row.push(null)
            }
            this.content.push(row);
        }
        this.biodiversityCategory = "unforested"
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
        return freeSpots[utils.getRandomIntegerBetween(0, numFreeSpots)]
    }

    updateBiodiversity() {
        /** 
         * Computes and updates biodiversity of the land
         * based on current land content.
         */
        this.#biodiversityScore = this.#computeBiodiversityScore()
        this.biodiversityCategory = this.#computeBiodiversityCategory()
    }

    getBiodiversityCategory() {
        /** 
         * Returns classification of this land that was 
         * computed using the biodiversity score. 
         */
        return this.biodiversityCategory
    }

    germinate(treeType) {
        /**
         * Function that adds a new seedling onto the land.
         * This action is successful only if there is a free
         * space available on the land.
         * @param treeType: The type of tree that is born.
         * @return position: The position at which the new plant has
         *                   germinated or -1 if the action was not
         *                   possible.
         */
        const spot = this.#getRandomFreeSpot()

        // If no free spot then cannot germinate.
        if (typeof(spot) == 'number') return -1
        
        const newTree = new Tree(spot, treeType)
        this.content[spot[0]][spot[1]] = newTree
        return spot
    }
}