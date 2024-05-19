import * as utils from '../utils.js'
import Tree from './Tree';

export default class Land {
    /** This class models the land that is 
     *  available for the user to manage.
     */
    constructor() {
        this.size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        this.biodiversityScore = 0
        this.content = []
        for (let i = 0; i < this.size.rows; i++) {
            const row = [];
            for (let j = 0; j < this.size.columns; j++) {
                row.push(null)
            }
            this.content.push(row);
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