export default class Land {
    /** This class models the land that is 
     *  available for the user to manage.
     */
    #size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
    constructor() {
        this.biodiversityScore = 0
        this.content = {}
        for (let i = 0; i < this.#size.rows; i++) {
            for (let j = 0; j < this.#size.columns; j++) {
                this.content[`${i},${j}`] = null
            }
        }
    }
}