export default class Tolerance {
    /** Models tolerance of different trees for
     *  environmental stressors. */
    
    constructor(avail2stress) {
        /** Constructor. 
         *  @param avail2stress: Maps availability of resource
         *                                 to stress it induces in the tree.
        */
       this.avail2stress = avail2stress
    }

    interpolate() {
        // TO DO ...
    }
}