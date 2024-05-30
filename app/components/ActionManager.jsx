"use client"

import * as d3 from "d3"
import Button from './Button.jsx'
import Switch from './Switch.jsx'
import TextInput from './TextInput.jsx'
import YearActions from './YearActions.jsx'
import { useEffect, useState } from 'react'

let yearActions = {}

const ActionManager = ({rotationPeriod, getPlan, addAction}) => {
    /**
     * Provides an interface using which learners
     * may add, remove or filter management actions.
     * @param rotationPeriod: Current rotation period.
     * @param getPlan: Fetches current plan.
     * @param addAction: Adds a new action to the plan. 
     */

    const colorBad = "#F44A4A"
    const colorDefault = "#FFFFFF"
    
    const [yearActionObjects, setYearActionsObjects] = useState([])
    const [treeCount, setTreeCount] = useState(0)
    const [textColorTreeCount, setTextColorTreeCount] = useState(colorDefault)
    const [repeat, setRepeat] = useState(false)

    const sanityCheckInt = (val) => {
        /** 
         * Here, input is considered valid only if
         * it is a positive number (integer) >= 1 and 
         * <= max no. of years.
         * @param val: Input as a string.
         * @return: True if the input was deemed valid and
         *          false otherwise.
        */

        // Parse the string to a number
        const num = parseInt(val);
    
        // Check if the parsed number is a positive 
        // number >= 0, <= size of land and not NaN.
        const landSize = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
        return !isNaN(num) && num >= 0 && num <= (landSize.rows * landSize.columns)
    }

    const handleActionTagClick = (
        tagSelectionState, setTagSelectionState, year, actionIdx
    ) => {
        /** 
         * Updates data and UI to reflect the user
         * having selected a specific action tag.
         * @param tagSelectionState: Latest selection state of clicked tag.
         * @param setTagSelectionState: Function that can be used to change
         *                              the tag's selection state.
         * @param year: Year associated with the tag that was clicked.
         * @param actionIdx: The index of the action that was clicked.
         * @param isSelected: Whether this tag is selected or not.
         */
        yearActions[year][actionIdx].selected = tagSelectionState
        yearActions[year][actionIdx]["setTagSelectionState"] = setTagSelectionState
    }

    const initYearActions = () => {
        /**
         * Initializes actions for years of interest based
         * on current set rotation interval.
         */
        
        // Get years of interest based on latest rotation period.
        const maxTime = JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)
        let t = rotationPeriod
        let years = []
        while (t >= 0 && t <= maxTime) {
            years.push(t)
            t += rotationPeriod
        }
        
        // Get actions for each year of interest.
        yearActions = {}
        for (const year of years) {
            yearActions[year] = []
            for (const action of getPlan(year)) {
                yearActions[year].push({selected: false, ...action})
            }
        }
    }

    const getYearActionsObjects = () => {
        /**
         * Generates a list of year actions objects from 
         * latest yearActions.
         * @return: A list of rotation years as renderable tags.
         */

        // Returns renderable tags to visualize actions.
        const objs = []
        for (const [year, actions] of Object.entries(yearActions)) {
            objs.push(<YearActions 
                year={year} 
                actions={actions}
                maxHeight="120px"
                onActionTagClick={handleActionTagClick}
            />)
        }
        
        return objs
    }

    const handleTreeCountChange = (val) => {
        /**
         * Handles a change in the tree count value text box.
         */
        if (val == "") { // Invalid / empty value.
            setTextColorTreeCount(colorBad)
            val = 0
        } else { // Valid value.
            setTextColorTreeCount(colorDefault)
            val = parseInt(val)
        }
        setTreeCount(val)
    }

    const handleRepeatChange = (val) => {
        /** 
         * Handles a change in the repeat setting. 
         * @param val: New repeat setting value (true / false).
         */
        console.log("Repeat Change =", val)
    }

    const handleDelete = () => {
        /** 
         * Updates data and UI to reflect the user's
         * choice to delete selected action tags.
         */

        // Delete selections actions from yearActions.
        let actions = []
        let action = null
        for (const year of Object.keys(yearActions)) {
            actions = yearActions[year]
            for (let i=0; i<actions.length; i++) {
                action = actions[i]
                if (action.selected) {
                    // Deselect selected tag.
                    if ("setTagSelectionState" in action) {
                        action.setTagSelectionState(false)
                    }
                    // Remove this action
                    yearActions[year].splice(i, 1)
                }
            }
        }

        // Update UI.
        // setYearActionsObjects([])
        setYearActionsObjects(getYearActionsObjects())
    }

    useEffect(() => {
        initYearActions()
        setYearActionsObjects(getYearActionsObjects())
    }, [rotationPeriod])

    return (
        <div>
            {/* VIEWER */}
            <div className='mb-5 -mt-2'>
                {/* LABELS & DELETE, SAVE, UPLOAD BUTTONS */}
                <div className='flex justify-between gap-5 mb-3 items-center flex-wrap'>
                    <div className='flex gap-5 justify-evenly'>
                        <b>{"Years ->"}</b>
                        <b>{"Actions ↓"}</b>
                    </div>
                    <div className='flex gap-3 jusify-center'>
                        <Button // DELETE BUTTON
                            outlineColor='#D28282' bgColor='#FFC5C5'
                            onClick={handleDelete}
                        ><img src="bin.png" className='max-h-8 p-1 w-auto'/></Button>
                        <Button // SAVE BUTTON
                            outlineColor='#9FCBFF' bgColor='#C5E0FF'
                            onClick={() => {console.log("SAVE button clicked.")}}
                        ><img src="save.png" className='max-h-8 p-1 w-auto'/></Button>
                        <Button // UPLOAD BUTTON
                            outlineColor='#F0BDFE' bgColor='#F7D9FF'
                            onClick={() => {console.log("UPLOAD button clicked.")}}
                        ><img src="upload.png" className='max-h-8 p-1 w-auto'/></Button>
                    </div>
                </div>
                {/* YEAR & ACTION TAGS */}
                <div 
                    className="bg-[#FFFFFF] rounded-lg p-3"
                    style={{height: "200px"}}
                >
                    <div className='
                        flex max-w-full gap-5 overflow-hidden
                        hover:overflow-scroll
                    '>{[yearActionObjects]}</div>
                </div>
            </div>
            {/* ACTION & TREE TYPE SELECTION */}
            <div className='
                flex justify-between gap-3 items-center 
                rounded-lg bg-[#AAAAAA] p-3 box-border
            '>
                {/* ACTION BUTTONS */}
                <div className='py-2 px-5 bg-[#D0D0D0] rounded-lg text-center'>
                    <p className='mb-2 font-bold'>ACTIONS</p>
                    <div className='mb-2'>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("PLANT button clicked.")}}
                        ><img src="shovel.png" className='max-h-16 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("FELL button clicked.")}}
                        ><img src="axe.png" className='max-h-16 w-auto'/></Button>
                    </div>
                </div>
                
                {/* TREE TYPE BUTTONS */}
                <div className='py-2 px-5 bg-[#D0D0D0] rounded-lg text-center'>
                    <p className='mb-2 font-bold'>TREE TYPES</p>
                    {/* DECIDUOUS */}
                    <div className='flex justify-center gap-2'> 
                        <div className='mb-2'>
                            <Button 
                            outlineColor='#DDDDDD' bgColor='#F1F1F1'
                                onClick={() => {console.log("MATURE DECIDUOUS button clicked.")}}
                            ><img src="mature_deciduous.png" className='max-h-16 w-auto'/></Button>
                        </div>
                        <div>
                            <Button 
                            outlineColor='#DDDDDD' bgColor='#F1F1F1'
                                onClick={() => {console.log("OLD GROWTH DECIDUOUS button clicked.")}}
                            ><img src="old_growth_deciduous.png" className='max-h-16 w-auto'/></Button>
                        </div>
                        <div>
                            <Button 
                            outlineColor='#DDDDDD' bgColor='#F1F1F1'
                                onClick={() => {console.log("SENESCENT DECIDUOUS button clicked.")}}
                            ><img src="senescent_deciduous.png" className='max-h-16 w-auto'/></Button>
                        </div>
                    </div>
                    {/* CONIFEROUS */}
                    <div className='flex justify-center gap-2'> 
                        <div className='mb-2'>
                            <Button 
                            outlineColor='#DDDDDD' bgColor='#F1F1F1'
                                onClick={() => {console.log("MATURE CONIFEROUS button clicked.")}}
                            ><img src="mature_coniferous.png" className='max-h-16 w-auto'/></Button>
                        </div>
                        <div>
                            <Button 
                            outlineColor='#DDDDDD' bgColor='#F1F1F1'
                                onClick={() => {console.log("OLD GROWTH CONIFEROUS button clicked.")}}
                            ><img src="old_growth_coniferous.png" className='max-h-16 w-auto'/></Button>
                        </div>
                        <div>
                            <Button 
                            outlineColor='#DDDDDD' bgColor='#F1F1F1'
                                onClick={() => {console.log("SENESCENT CONIFEROUS button clicked.")}}
                            ><img src="senescent_coniferous.png" className='max-h-16 w-auto'/></Button>
                        </div>
                    </div>
                </div>
                
                {/* COUNT & REPEAT SETTINGS */}
                <div className='flex flex-col gap-3 justify-center'>
                    <div className='flex items-center p-2 bg-[#D0D0D0] rounded-lg'>
                        <b className='mr-2'>COUNT:</b>
                        <TextInput 
                            placeholder="0"
                            textColor={textColorTreeCount}
                            startVal={0}
                            sanityCheck={sanityCheckInt} 
                            handleVal={handleTreeCountChange}
                            maxWidth="30px"
                        />
                    </div>
                    <div className='
                        flex items-center justify-between 
                        gap-2 p-2 bg-[#D0D0D0] rounded-lg
                    '>
                        <b>REPEAT:</b>
                        <Switch 
                            isOnStart={repeat} 
                            onToggle={handleRepeatChange}
                            onColor="#32BE51"
                            offColor="#6E6E6E"
                        />
                    </div>
                    
                    {/* ADD, FILTER BUTTONS */}
                    <div className='flex flex-wrap gap-3 justify-center'>
                        <Button 
                            outlineColor='#B9DEB5' bgColor='#99cc93'
                            onClick={() => {console.log("ADD button clicked.")}}
                        ><img src="plus.png" className='max-h-8 p-1 w-auto'/></Button>
                        <Button 
                            outlineColor='#e0dd87' bgColor='#faf8c5'
                            onClick={() => {console.log("FILTER button clicked.")}}
                        ><img src="filter.png" className='max-h-8 p-1 w-auto'/></Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActionManager
