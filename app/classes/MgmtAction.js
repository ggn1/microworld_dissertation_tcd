export default class MgmtAction {
    /** This class embodies the type of forest management
     *  actions that users can take.
     */
    
    constructor(time, treeType, treeCount) {
        this.time = time
        this.treeType = treeType
        this.treeCount = treeCount
    }
}

export class Plant extends MgmtAction {
    /** This class embodies the "plant" action that
     *  users can take.
     */

    constructor(time, treeType, treeCount) {
        super(time, treeType, treeCount)
        this.costPerTree = JSON.parse(process.env.NEXT_PUBLIC_COST_MGMT_ACTION).plant
    }

    execute() {
        // TO DO ...
    }
}

export class Fell extends MgmtAction {
    /** This class embodies the "plant" action that
     *  users can take.
     */

    constructor(time, treeType, treeCount) {
        super(time, treeType, treeCount)
        this.costPerTree = JSON.parse(process.env.NEXT_PUBLIC_COST_MGMT_ACTION).fell
    }

    execute() {
        // TO DO ...
    }
}