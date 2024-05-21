import { max } from 'd3'
import * as utils from '../utils.js'
import Tolerance from "./Tolerance.js"

export default class Tree {
    /** This class embodies a tree. */

    #getBiodiversityCategory
    #updateCarbon
    #isLandFree
    #ageLastReproduced = 0
    #sow
    #lifeStages
    
    constructor(
        position, treeType, 
        getBiodiversityCategory, 
        isLandFree, updateCarbon, sow
    ) {
        /** 
         * Constructor.
         * @param position: The index of the row and column corresponding to the 
         *                  position of this tree as a list [x, y].
         * @param treeType: The type of this tree ["coniferous", "deciduous"].
         * @param getBiodiversityCategory: Function that fetches current classification
         *                                 of the land based on biodiversity.
         * @param updateCarbon: Function that can be used to update the amount of carbon
         *                      in the atmosphere.
         * @param isLandFree: Function that can be used to check if a given spot is free.
         * @param sow: Function that can be used to sow a new seedling to reproduce.
         */
        this.treeType = treeType
        this.position = position
        this.height = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_START_SEEDLING)
        this.diameter = this.#getDiameterFromHeight(this.height)
        this.stress = 0
        this.age = 0 // years
        this.reproduction = true // Reproduction enabled. Disabled for initialization.
        this.#getBiodiversityCategory = getBiodiversityCategory
        this.#updateCarbon = updateCarbon
        this.#isLandFree = isLandFree
        this.#sow = sow
        this.lifeStage = "seedling"
        this.#lifeStages = JSON.parse(process.env.NEXT_PUBLIC_LIFE_STAGE_TREE)[this.treeType]
        this.heightMax = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_MAX)[this.treeType]
        this.diameterMax = this.#getDiameterFromHeight(this.heightMax)
        const ageMax = this.#lifeStages.senescent
        this.ageMax = utils.getRandomIntegerBetween(ageMax[0], ageMax[1])
        this.reproductionInterval = JSON.parse(
            process.env.NEXT_PUBLIC_REPRODUCTION_INTERVAL
        )[this.treeType]
        this.woodDensity = JSON.parse(process.env.NEXT_PUBLIC_WOOD_DENSITY)[this.treeType]
        this.gh_max = JSON.parse(process.env.NEXT_PUBLIC_GROWTH_HEIGHT_MAX)[this.treeType]
        const tolerance_co2 = JSON.parse(process.env.NEXT_PUBLIC_TOLERANCE_CO2)
        this.tolerance = {"co2": {
            "mature": new Tolerance(tolerance_co2.mature),
            "premature": new Tolerance(tolerance_co2.premature)
        }}
    }

    #computeBiodiversityReductionFactor() {
        /** 
         * Computes and returns biodiversity reduction 
         * factor of the land. 
         * @return: Biodiversity reduction factor.
        */
        const b_red_rules = JSON.parse(
            process.env.NEXT_PUBLIC_BIODIVERSITY_STRESS_REDUCTION_FACTOR
        )
        return b_red_rules[this.#getBiodiversityCategory()]
    }

    #computeLifeStage() {
        /**
         * Returns the stage of life that this tree is currently in.
         * @return: The string that identifies the current 
         *          life stage of this tree.
         */

        // Check if this tree is dead.
        let lifeStage = "dead"
        if (this.isAlive()) {
            for (const [stageName, stageAgeLimit] of Object.entries(this.#lifeStages)) {
                if (typeof(stageAgeLimit) != "number") lifeStage = stageName
                if (this.age < stageAgeLimit) {
                    lifeStage = stageName
                    break
                }
            }
        }
        return lifeStage
    }

    #getDiameterFromHeight(height) {
        /** Computes diameter of this tree. 
         *  @param height: Height of the tree in meters.
         *  @return: Diameter of the tree in meters.
        */
        return height ** (3/2)
    }

    #updateStress() {
        // TO DO ...
    }

    #computeCarbonInTreeVolume(volume) {
        /** 
         * Compute amount of carbon in given tree volume. 
         * @return: Weight of carbon in given tree volume.
         */
        const weight = this.woodDensity * volume // g
        return JSON.parse(process.env.NEXT_PUBLIC_C_PC_TREE) * weight
    }

    #processCarbon(volume, srcReservoir, dstReservoir) {
        /** 
         * Pulls and fixes carbon needed to build given amount of volume. 
         * @param volume: The amount of growth required.
         * @param srcReservoir: The sources that the carbon is to be drawn from.
         * @param dstReservoir: The destination to which carbon is to be added to.
        */
        
        // Compute weight of carbon that must be pulled from the air.
        const carbonWeight = this.#computeCarbonInTreeVolume(volume)

        // Reduce carbon in given volume of the tree
        // from the source reservoir and add it to the
        // destination reservoir.
        let update = {}
        update[srcReservoir] = -1 * carbonWeight
        update[dstReservoir] = 1 * carbonWeight
        this.#updateCarbon(update)
    }

    #grow() {
        /**
         * Facilitates physical growth of a plant.
        */
        
        // Compute volume by which this tree grows to 
        // to maintain it's current biomass (damage repair, shedding, etc.)
        const volumeCur = utils.volumeCylinder(this.height, this.diameter/2)
        const volumeMaintenance = volumeCur * JSON.parse(
            process.env.NEXT_PUBLIC_TREE_VOLUME_MAINTENANCE_PC
        )

        // Compute volume by which this tree grows in height.
        const bd_red = this.#computeBiodiversityReductionFactor()
        const growthHeight = (1 - max([0, this.stress - bd_red])) * this.gh_max
        const growthDiameter = this.#getDiameterFromHeight(growthHeight)
        const volumeGrowth = utils.volumeCylinder(growthHeight, growthDiameter/2)

        // Process carbon needed for growth.
        this.#processCarbon(volumeGrowth, "air", "vegetation")

        // Process carbon needed for maintenance.
        this.#processCarbon(volumeMaintenance, "air", "soil")

        // Grow physically.
        this.height += growthHeight
        this.diameter += growthDiameter
    }

    isAlive() {
        /** 
         * Function to check whether this tree is still alive.
         * @return: True if the tree is alive and False otherwise.
         */
        return this.stress < 1
    }

    live() {
        /**
         * Models life activities that a plant does.
         * @param reproduce: Whether or not reproduction is enabled.
         *                   This is enabled by default. There is a
         *                   need to allow for this to be disabled
         *                   in the situation wherein the land is being
         *                   initialized to achive a desired tree age 
         *                   and tree type composition.
         */

        // Compute current stress level.
        this.#updateStress()

        // Grow physically.
        this.#grow()

        // Reproduce if enabled.
        if (this.reproduction) {
            const posSeedling = this.#reproduce()
            if (! typeof(posSeedling) == "number") {
                console.log(`New ${this.treeType} seedling at ${posSeedling}.`)
            }
        } 
    }

    decay() {
        /** 
         * Plants that are dead and remain in the soil, decay.  
        */
        
        // 15 % of the carbon in the remains of this plant is 
        // released back into the athmosphere and soil.
        const volume = utils.volumeCylinder(this.height, this.diameter/2)
        const weight = volume * this.woodDensity
        const weightCarbon = JSON.parse(process.env.NEXT_PUBLIC_C_PC_TREE) * weight
        const decayFactor = JSON.parse(process.env.NEXT_PUBLIC_C_PC_DECAY)
        const weightCarbonDecay = decayFactor * weightCarbon
        const weightDecay = weightCarbonDecay * (1/decayFactor)
        const volumeDecay = weightDecay/this.woodDensity

        // Of the amount of carbon decayed, 35% ends up in the soil
        // and 65% ends up back in the atmosphere.
        this.#processCarbon(
            volumeDecay * JSON.parse(process.env.NEXT_PUBLIC_DECAY_PC_SOIL),
            "vegetation", "soil"
        )
        this.#processCarbon(
            volumeDecay * JSON.parse(process.env.NEXT_PUBLIC_DECAY_PC_AIR),
            "vegetation", "air"
        )

        // Reduce the volume of the tree.
        // For simplicity, let redius of the cylinder
        // that represents the tree be fixed.
        const volumeReduced = volume - volumeDecay
        const radius = this.diameter/2
        const heightReduced = volumeReduced/(Math.PI * (radius**2))
        this.height = heightReduced
    }

    #reproduce() {
        /** 
         * Facilitates reproduction. 
         * Trees may reproduce every this.reproductionInterval 
         * no. of years only if there is a free space adjacent 
         * to this tree and this tree is mature or 
         * old growth with stress <= 50%.
         * @return: Position of the new seedling or -1 if reproduction
         *          was not possible.
        */

        // If the tree is too young or too old, it may not reproduce.
        if (!(
            this.lifeStage == "mature" || 
            this.lifeStage == "old_growth"
        )) return -1

        // If the tree is not due to reproduce again since last
        // reproduction, then it will not do so.
        if (
            (this.age - this.#ageLastReproduced) < 
            this.reproductionInterval
        ) return -1

        // If the tree is too stressed, then it shall not reproduce.
        if (this.stress > 0.5) return -1

        // If all above checks are false, then the tree
        // is eligible to reproduce. However, it remains
        // to be checked as to whether this is possible.

        // A tree may only reproduce if a position adjacent
        // to it (vertical, horizontal, diagonal), is free.
        const adjacentPositions = utils.getAdjacentPositions(
            this.position[0], this.position[1]
        )
        const positionsFree = []
        for (const pos of adjacentPositions) {
            if (this.#isLandFree(pos[0], pos[1])) {
                positionsFree.push(pos)
            }
        }
        if (positionsFree.length == 0) return -1

        // If it is indeed possible to reproduce,
        // pick a random free position to add a 
        // sapling to.
        this.#sow(this.treeType, positionsFree[
            utils.getRandomIntegerBetween(0, positionsFree.length-1)
        ])
    }

    getOlder() {
        /** 
         * Facilitates aging of this tree. 
         * Embodies update by 1 time step.
         * @return: True if the tree still exists after the 
         *          update and false otherwise (if all of the
         *          tree has decayed, then it will no longer
         *          exist).
        */
        
        // Perform activities related to living or decaying.
        if (this.isAlive()) this.live()
        else this.decay()

        // Increment age.
        this.age += 1

        // Update life stage.
        this.lifeStage = this.#computeLifeStage()

        if (this.height <= 0) return false
        return true
    }
}

export class Coniferous extends Tree {
    /** This class embodies a coniferous tree. */
    
    constructor(position) {
        /**
         * Construcor.
         * @param position: The index of the row and column of this tree.
         */
        super(position, "coniferous")
    }
}

export class Deciduous extends Tree {
    /** This class embodies a deciduous tree. */

    constructor(position) {
        /**
         * Construcor.
         * @param position: The index of the row and column of this tree.
         */
        super(position, "deciduous")
    }
}