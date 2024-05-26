import { createInterpolationFunction } from '../utils.js'

export default class Tolerance {
    /** Models tolerance of different trees for
     *  environmental stressors. */
    #availabilityToStressMapping
    
    constructor(avail2stress) {
        /** Constructor. 
         *  @param avail2stress: Maps availability of resource
         *                       to stress it induces (must have 
         *                       at least 3 key value pairs).
        */
        // getStress is a function that returns stress given availability.
        this.#availabilityToStressMapping = avail2stress
        this.getStress = (availability) => {
            /** 
             * Given availability of the resource, returns the
             * corresponding stress that the tree would be under.
             * @param availability: Availability of this resource.
             * @return: Stress induced.
             */
            const avail2stress = Object.entries(this.#availabilityToStressMapping)
            for(let i = 0; i < avail2stress.length; i++) {
                let [key, value] = avail2stress[i]
                key = Number.parseFloat(key)
                if (availability == key) {
                    return value
                } else if (availability < key) {
                    if (i == 0) {
                        return value
                    } else {
                        return avail2stress[i-1][1]
                    }
                } else { // (availability > key)
                    if (i == (avail2stress.length-1)) {
                        return avail2stress[i]
                    }
                }
            }
        }
    }
}