"use client"

import { useState, useEffect } from "react"
import IncDepSlider from "./IncDepSlider"

const IncDepSetter = ({incDepStart, setIncDep, updateSalesTargets}) => {
    /** 
     * Component used to set income dependency proportions. 
     * @param incDepStart: Starting income dependency values.
     * @param setIncDep: Function that sets new income dependency values.
     * @param updateSalesTargets: Function that sets the income target 
     *                            to be met per rotation for each resource.
     */

    const incDepDef = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
    let incDep = {}

    const [sliders, setSliders] = useState([])

    const updateSliders = () => {
        /**
         * Sets the sliders state to a list of 
         * slider components reflecting latest
         * income dependency values.
         */
        let slidersNew = []
        for (const resource of Object.keys(incDepDef)) {
            slidersNew.push(<IncDepSlider 
                label={incDepDef[resource].label}
                filledColor={"#"+incDepDef[resource].color}
                value={Math.round(incDep[resource].value * 100)}
                onClick={(isDisabled, setIsDisabled) => handleClick(
                    resource, isDisabled, setIsDisabled
                )}
                disabled={incDep[resource].disabled}
                onChange={(value) => {
                    if (incDep[resource].disabled) return () => {} 
                    const otherResources = getOtherResources(resource)
                    const otherUnlockedResources = otherResources[0]
                    return handleChange(resource, value, otherUnlockedResources)
                }}
                getValueSetter={(valueSetter) => {
                    incDep[resource].setSliderValue = valueSetter
                }}
            />)
        }
        setSliders(slidersNew)
    }

    const handleChange = (thisResource, value, unlockedResources) => {
        /** 
         * Handles change to income dependency value
         * of some resource.
         * @param thisResource: Name of the resource whose value
         *                      is being changed.
         * @param value: New income dependency value.
         * @param unlockedResources: Name of other resources that are
         *                        being changed.
         */
        
        let incDepNew = JSON.parse(JSON.stringify(incDep))
        for (const key of Object.keys(incDepNew)) {
            const val = incDepNew[key].value
            incDepNew[key].value = Math.round(val * 100)
        }
        let changeThisResource = value - incDepNew[thisResource].value

        // Subtract change in this resource 
        // from other resources.
        const unitChange = changeThisResource < 0 ? -1 : 1
        let i = 0
        let unlockedResourceChanged = true
        while (i < Math.abs(changeThisResource) && unlockedResourceChanged) {
            unlockedResourceChanged = false
            for (const key of unlockedResources) {
                incDepNew[key].value -= unitChange
                if (incDepNew[key].value > 100) {
                    incDepNew[key].value = 100
                }
                else if (incDepNew[key].value < 0) {
                    incDepNew[key].value = 0
                }
                else {
                    unlockedResourceChanged = true
                    incDepNew[thisResource].value += unitChange
                    i += 1
                }
            }
        }

        for (const key of Object.keys(incDepNew)) {
            const val = Math.round(incDepNew[key].value)
            incDep[key].value = val/100
        }
        
        // Update sliders.
        for (const resource of Object.keys(incDep)) {
            incDep[resource].setSliderValue(
                Math.round(incDep[resource].value * 100)
            )
        }
        
        let sum = 0
        sum += Object.values(incDep).map(value => value.value)
        if (sum > 1) {
            console.log("sum > 1 =", sum)
        }
        if (sum < 1) {
            console.log("sum < 1 =", sum)
        }

        const toSet = {}
        for (const [key, val] of Object.entries(incDep)) {
            toSet[key] = val.value
        }
        setIncDep(toSet)
        updateSalesTargets()
    }

    const getOtherResources = (resource) => {
        /**
         * Will return list of all resources except given one.
         * @param resource: Given resource.
         * @return: List of all resources (locked & unlocked) except this one.
         */
        let lockedResources = []
        let unlockedResources = []
        for (const key of Object.keys(incDepDef)) {
            if (key != resource) {
                if (incDep[key].disabled) lockedResources.push(key)
                else unlockedResources.push(key)
            }
        }
        return [unlockedResources, lockedResources]
    }

    const handleClick = (resource, isDisabled, setIsDisabled) => {
        /**
         * Handles the event where a user has selected on of the 
         * resource sliders. This selected slider shall be the
         * other resource, meaning that changes to any other
         * resources will only change this resource as far as it
         * is selected. The selected resource cannot be changed 
         * when it is selected.
         * @param resource: Clicked resource.
         */
        incDep[resource].disabled = !isDisabled
        setIsDisabled(!isDisabled)
    }

    useEffect(() => {
        for (const key of Object.keys(incDepDef)) {
            incDep[key] = {
                value: incDepStart[key],
                disabled: false
            }
        }
        updateSliders()
    }, [])

    return (
        <div className="flex flex-col gap-3">
            {sliders}
        </div>
    )
}

export default IncDepSetter