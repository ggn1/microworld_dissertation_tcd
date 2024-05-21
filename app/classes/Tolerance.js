import { createInterpolationFunction } from '../utils.js'

export default class Tolerance {
    /** Models tolerance of different trees for
     *  environmental stressors. */
    
    constructor(avail2stress) {
        /** Constructor. 
         *  @param avail2stress: Maps availability of resource
         *                       to stress it induces in the tree.
        */
        // getStress is a function that returns stress given availability.
        this.getStress = createInterpolationFunction(Object.entries(avail2stress))
    }
}