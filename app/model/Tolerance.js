export default class Tolerance {
    /** Models tolerance of different trees for
     *  environmental stressors. */
    #availToStressMap
    
    constructor(avail2stress) {
        /** Constructor. 
         *  @param avail2stress: Maps availability of resource
         *                       to stress it induces (must have 
         *                       at least 3 key value pairs).
        */
        // getStress is a function that returns stress given availability.
        this.#availToStressMap = avail2stress
        this.getStress = (availability) => {
            /** 
             * Given availability of the resource, returns the
             * corresponding stress that the tree would be under.
             * @param availability: Availability of this resource.
             * @return: Stress induced.
             */
            for(const [availStr, stress] of Object.entries(
                this.#availToStressMap
            )) {
                const condition = availStr.split("_")[0]
                const availVal = Number.parseFloat(availStr.split("_")[1])
                if (condition == "lt" && availability < availVal) {
                    return stress
                } else if (condition == "gte" && availability >= availVal) {
                    return stress
                }
            }
        }
    }
}