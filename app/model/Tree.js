import Big from 'big.js'
import * as utils from '../utils.js'
import Tolerance from "./Tolerance.js"

export default class Tree {
    /** This class embodies a tree. */

    #getBiodiversityCategory
    #updateCarbon
    #isLandFree
    #ageLastReproduced = 0
    #plantTree
    #lifeStages
    #getAirCO2ppm
    #volumeDecay
    
    constructor(
        position, treeType, 
        getBiodiversityCategory, 
        isLandFree, updateCarbon, 
        plantTree, getAirCO2ppm
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
         * @param plantTree: Function that can be used to sow a new seedling to reproduce.
         * @param getAirCO2ppm: Function that gets current concentration of CO2 in the
         *                      atmosphere. 
         */
        this.treeType = treeType
        this.position = position
        this.height = 0
        this.diameter = 0
        this.stress = 0
        this.age = 0 // years
        this.#getBiodiversityCategory = getBiodiversityCategory
        this.#updateCarbon = updateCarbon
        this.#isLandFree = isLandFree
        this.#plantTree = plantTree
        this.#getAirCO2ppm = getAirCO2ppm
        this.stressEnv = 0
        this.stressAge = 0
        this.cAbsorbed = Big(0)
        this.airCO2ppm = getAirCO2ppm()
        this.lifeStage = "seedling"
        this.#lifeStages = JSON.parse(process.env.NEXT_PUBLIC_LIFE_STAGE_TREE)[this.treeType]
        this.heightMax = JSON.parse(process.env.NEXT_PUBLIC_HEIGHT_MAX)[this.treeType]
        this.diameterMax = this.#getDiameterFromHeight(this.heightMax)
        this.#volumeDecay = -1
        this.ageMax = this.#lifeStages.senescent
        this.reproductionInterval = JSON.parse(
            process.env.NEXT_PUBLIC_REPRODUCTION_INTERVAL
        )[this.treeType]
        this.woodDensity = JSON.parse(process.env.NEXT_PUBLIC_WOOD_DENSITY)[this.treeType]
        this.ghMax = this.heightMax/(this.#lifeStages.mature)
        this.gdMax = this.diameterMax/(this.#lifeStages.mature)
        const toleranceCO2 = JSON.parse(process.env.NEXT_PUBLIC_TOLERANCE_CO2)
        this.tolerance = {"co2": {
            "mature": new Tolerance(toleranceCO2.mature),
            "premature": new Tolerance(toleranceCO2.premature)
        }}
        this.#processCarbon(utils.volumeCylinder(
            this.height, this.diameter/2
        ), "air", "vegetation")
        this.updateStress = (change) => {
            /**
             * Changes stress on this tree.
             * @param change: The amount by which stress is to be
             *                changed (in either positive or negative
             *                directions).
             */
            this.stress = Math.min(1, this.stress + change)
            this.lifeStage = this.#computeLifeStage()
        }
        this.updateHeight = (change) => {
            /**
             * Updates height value by given amount.
             * @param change: The amount by which the height of
             *                the tree changes.
             */
            this.height += change
            this.diameter = this.#getDiameterFromHeight(this.height)
        }
        this.getOlder()
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
        if (this.#isAlive()) {
            for (const [stageName, stageAgeLimit] of Object.entries(this.#lifeStages)) {
                if (this.age <= stageAgeLimit) {
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
        return (height ** (3/2)) / 100
    }

    #getStressEnv() {
        /**
         * Computes and returns stress due to environmental 
         * conditions.
         * @return: Stress due to current environment.
         */
        let stressEnv = 0
        const availabilityCO2 = this.#getAirCO2ppm()
        this.airCO2ppm = availabilityCO2 // DEBUG
        const stressLifestage = (
            this.lifeStage == "seedling" || 
            this.lifeStage == "sapling"
        ) ? "premature" : "mature"
        stressEnv += this.tolerance.co2[stressLifestage].getStress(availabilityCO2)
        return stressEnv
    }

    #getStressAge() {
        /**
         * Computes and returns age related stress.
         */
        let stressAge = 0
        // If this tree has reached max age, then stess is 100%.
        if (this.age >= this.ageMax) stressAge = 1.0
        // Upon reaching the senescence stage, stress increases by 
        // x amount every year. This models how health declines slowly 
        // when a tree is old and close to death.
        if (this.lifeStage == 'senescent') stressAge += JSON.parse(
            process.env.NEXT_PUBLIC_STRESS_AGING
        )
        return stressAge
    }

    #recover() {
        /**
         * Models how when conditions are ideal, healthy plants
         * recover from past stress. By how much they recover, 
         * depends on their remaining health.
         */
        const health = (1 - this.stress)
        this.stress = Math.max(0, this.stress - (JSON.parse(
            process.env.NEXT_PUBLIC_STRESS_RECOVERY_FACTOR
        ) * health))
    }

    #computeCarbonInTreeVolume(volume) {
        /** 
         * Compute amount of carbon in given tree volume. 
         * @return: Weight of carbon in given tree volume.
         */
        const weight = this.woodDensity * volume // g
        return utils.computeCarbonInWoodWeight(weight)
    }

    #processCarbon(volume, srcReservoir, dstReservoir) {
        /** 
         * Pulls and fixes carbon needed to build given amount of volume. 
         * @param volume: The amount of growth required.
         * @param srcReservoir: The sources that the carbon is to be drawn from.
         * @param dstReservoir: The destination to which carbon is to be added to.
        */

        // Compute weight of carbon that must be pulled from the source reservoir.
        const carbonWeight = Big(this.#computeCarbonInTreeVolume(volume))
        const scaleFactor = Big(JSON.parse(process.env.NEXT_PUBLIC_C_WEIGHT_SCALE_FACTOR))

        // Reduce carbon in given volume of the tree
        // from the source reservoir and add it to the
        // destination reservoir.
        let update = {}
        update[srcReservoir] = scaleFactor.mul(carbonWeight).mul(-1)
        update[dstReservoir] = scaleFactor.mul(carbonWeight)
        this.#updateCarbon(update)

        if (dstReservoir == "vegetation") {
            this.cAbsorbed = scaleFactor.mul(carbonWeight)
        }
    }

    #grow() {
        /**
         * Facilitates physical growth of a plant.
        */
       
        // Compute volume by which this tree grows to 
        // to maintain it's current biomass (damage repair, shedding, etc.)
        const volumeOld = utils.volumeCylinder(this.height, this.diameter/2)
        let volumeMaintenance = volumeOld * JSON.parse(
            process.env.NEXT_PUBLIC_TREE_MAINTENANCE_PC
        )[this.treeType]
        
        // Compute volume by which this tree grows in height.
        const bdRed = this.#computeBiodiversityReductionFactor()
        const growthRate = (1 - Math.max(0, this.stress - bdRed))
        const growthHeight = growthRate * this.ghMax
        const growthDiameter = growthRate * this.gdMax
        const heightNew = Math.min(this.heightMax, this.height + growthHeight) // Grow until max height.
        let diameterNew = Math.min(this.diameterMax, this.diameter + growthDiameter) // Grow until max diameter.
        const volumeNew = utils.volumeCylinder(heightNew, diameterNew/2)
        let volumeGrowth = Math.max(0, volumeNew - volumeOld)
        if (volumeGrowth == 0) { // Secondary growth.
            // Unlike height, diameter keeps growing throughout lifespan
            // of a tree. It slows down as the tree ages. This reduction
            // with age need not be explicitly modelled as stress due to 
            // aging shall cause this.
            const gvMax = utils.volumeCylinder(this.ghMax, this.gdMax)
            const volumeGrowthSec = (
                gvMax * process.env.NEXT_PUBLIC_SEC_GROWTH_PC
            )
            let growthDiameterSec = 2 * Math.sqrt(
                volumeGrowthSec/(Math.PI * this.height)
            )
            diameterNew = this.diameter + growthDiameterSec
            volumeGrowth = volumeGrowthSec
        }

        // Process carbon needed for maintenance.
        if (volumeMaintenance > 0) {
            this.#processCarbon(volumeMaintenance, "air", "soil")
        }
        
        // Process carbon needed for growth & grow.
        this.#processCarbon(volumeGrowth, "air", "vegetation")
        this.height = heightNew
        this.diameter = diameterNew
    }

    #isAlive() {
        /** 
         * Function to check whether this tree is still alive.
         * @return: True if the tree is alive and False otherwise.
         */
        return this.stress < 1
    }

    #live() {
        /**
         * Models life activities that a plant does.
         * @param reproduce: Whether or not reproduction is enabled.
         *                   This is enabled by default. There is a
         *                   need to allow for this to be disabled
         *                   in the situation wherein the land is being
         *                   initialized to achive a desired tree age 
         *                   and tree type composition.
         */
        // Update lifestage and proceed if not dead.
        this.lifeStage = this.#computeLifeStage()
        if (this.lifeStage != "dead") {
            this.#recover()  // Recover from past stress.
            this.#grow() // Grow physically.
            if (utils.reproductionEnabled) this.#reproduce() // Reproduce if possible.
        }
    }

    #decay() {
        /** 
         * Plants that are dead and remain in the soil, decay.
        */
        
        if (this.height > 0 && this.diameter > 0) {
            // 15 % of the carbon in the remains of this plant 
            // right before death shall be the fixed amount of carbon
            // that this tree decays by each time step henceforth.
            // This carbon is released back into the atmosphere and soil.
            const volume = utils.volumeCylinder(this.height, this.diameter/2)
            if (this.#volumeDecay == -1) {
                const weightCarbon = this.#computeCarbonInTreeVolume(volume)
                const decayPc = JSON.parse(process.env.NEXT_PUBLIC_C_PC_DECAY)
                const weightCarbonDecay = decayPc * weightCarbon
                const carbonPc = JSON.parse(process.env.NEXT_PUBLIC_C_PC_TREE)
                const weightDecay = weightCarbonDecay/carbonPc
                this.#volumeDecay = weightDecay/this.woodDensity
            }
    
            // If the volume of tree to be decayed is more
            // or equal to current volume, then all of the
            // tree decays and it ceases to exist.
            // Of the amount of carbon decayed, x% ends up in the soil
            // and (1-x)% ends up back in the atmosphere.
            const decayPcSoil = JSON.parse(process.env.NEXT_PUBLIC_DECAY_PC_SOIL)
            const volumeDecayed = Math.min(this.#volumeDecay, volume)
            const volumeDecayedSoil = volumeDecayed * decayPcSoil
            const volumeDecayedAir = volumeDecayed - volumeDecayedSoil
            this.#processCarbon(volumeDecayedSoil, "vegetation", "soil")
            this.#processCarbon(volumeDecayedAir, "vegetation", "air")
    
            // Reduce the volume of the tree.
            // For simplicity, let radius of the cylinder
            // that represents the tree be fixed.
            const volumeRemaining = volume - volumeDecayed
            const heightRemaining = volumeRemaining/(Math.PI * ((this.diameter/2)**2))
            this.height = heightRemaining
        }
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
        if (this.stress > JSON.parse(
            process.env.NEXT_PUBLIC_REPRODUCTION_STRESS_THRESHOLD
        )) return -1

        // If all above checks are false, then the tree
        // is eligible to reproduce.

        // A tree may only reproduce if it's own position or
        // a position adjacent to it (vertical, horizontal, 
        // diagonal), is free.
        const adjacentPositions = utils.getAdjacentPositions(
            this.position[0], this.position[1], this.treeType == "deciduous"
        )
        const positionsFree = []
        for (const pos of adjacentPositions) {
            if (this.#isLandFree(pos[0], pos[1])) {
                positionsFree.push(pos)
            }
        }
        if (positionsFree.length == 0) return -1

        // If it is indeed possible to reproduce,
        // add a sapling to the first available space.
        this.#plantTree(this.treeType, positionsFree[0])
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

        // Check if tree is alive.
        if (this.#isAlive()) { // Alive => try to live.
            // Update stress due to environmental conditions.
            this.stressEnv = this.#getStressEnv()
            this.stress = Math.min(1, this.stress + this.stressEnv)
            // Increment age and update stress due to age.
            this.age += 1
            this.stressAge = this.#getStressAge()
            this.stress += Math.min(1, this.stress + this.stressAge)           
            this.#live()
        } else { // Dead => decay.
            this.#decay()
        }

        // Return whether this tree still exists in the world.
        if (this.height <= 0 || this.diameter <= 0) return false
        return true
    }
}