"use client"

import Veil from './Veil.jsx'
import Button from './Button.jsx'
import Switch from './Switch.jsx'
import TextInput from './TextInput.jsx'
import YearActions from './YearActions.jsx'
import { useEffect, useState } from 'react'
import ActionSelector from './ActionSelector.jsx'
import TreeTypeSelector from './TreeTypeSelector.jsx'

let yearActions = {}
let rotationYears = []

const ActionManager = ({
    rotationPeriod, getPlan, addAction, 
    deleteAction, onSave, onLoad, updateTrigger,
    incDep, setIncDep=null
}) => {
    /**
     * Provides an interface using which learners
     * may add, remove or filter management actions.
     * @param rotationPeriod: Current rotation period.
     * @param getPlan: Fetches current plan.
     * @param addAction: Adds a new action to the plan. 
     * @param onSave: Function that triggers saving of 
     *                current starting world and plan.
     * @param onLoad: Function that triggers loading of 
     *                a previously saved microworld state.
     * @param updateTrigger: A 0/1 value that is updated
     *                       to trigger plan refreshing.
     * @param incDep: Latest income dependency values.
     * @param setIncDep: Sets income dependency values.
     */

    const colorBad = "#F44A4A"
    const colorDefaultText = "#232323"
    const placeholderTreeCount = 1
    const placeholderYear = 0
    const incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
    
    const [yearActionObjects, setYearActionsObjects] = useState([])
    const [selectedAction, setSelectedAction] = useState("none")
    const [selectedTreeType, setSelectedTreeType] = useState("none")
    const [selectedTreeLifeStage, setSelectedTreeLifeStage] = useState("none")
    const [selectedYear, setSelectedYear] = useState(placeholderYear) 
    const [treeCount, setTreeCount] = useState(placeholderTreeCount)
    const [repeat, setRepeat] = useState(false)
    const [isCountInvalid, setIsCountInvalid] = useState(false)
    const [isYearInvalid, setIsYearInvalid] = useState(false)
    const [incomeDependency, setIncomeDependency] = useState(incDep)
    const [incDepSwitches, setIncDepSwitches] = useState([])
    const [triggerSwitchUpdate, setTriggerSwitchUpdate] = useState(0)

    const sanityCheckTreeCount = (val) => {
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
        return !isNaN(num) && num > 0 && num <= (landSize.rows * landSize.columns)
    }

    const sanityCheckYear = (val) => {
        /** 
         * Checks if this year input is valid.
         * A year input is considered valid only
         * if it is one of the rotation years
         * as per current rotation period.
         * @param val: New year entered by the user.
         * @return: True if the input was deemed valid and
         *          false otherwise.
        */

        const num = parseInt(val)
        // return !isNaN(num) && rotationYears.includes(num)
        return (
            !isNaN(num) &&
            (num >= 0) &&
            (num < JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)) 
        )
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

    const updateYearActions = () => {
        /**
         * Initializes actions for years of interest based
         * on current set rotation interval.
         */
        
        // Get years of interest based on latest rotation period.
        let years = new Set(Object.keys(getPlan()))
        const maxTime = JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)
        let t = 0
        rotationYears = []

        // for (let t = 0; t < maxTime; t++) {
        //     years.add(t)
        //     if (t % rotationPeriod == 0) {
        //         rotationYears.push(t)
        //     }
        // }

        while (t >= 0 && t < maxTime) {
            rotationYears.push(t)
            years.add(t)
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
        for (let [year, actions] of Object.entries(yearActions)) {
            year = parseInt(year)
            objs.push(<YearActions 
                year={year} 
                isRotationYear={rotationYears.includes(year)}
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
         * @param val: New tree count.
         */
        if (val == "") { // Invalid / empty value.
            val = 1
            setIsCountInvalid(true)
        } else { // Valid value.
            val = parseInt(val)
            setIsCountInvalid(false)
        }
        setTreeCount(val)
    }

    const handleYearChange = (val) => {
        /**
         * Handles a change in the year text box.
         * @param val: New year value.
         */
        if (val == "") { // Invalid / empty value.
            val = rotationPeriod
            setIsYearInvalid(true)
        } else { // Valid value.
            val = parseInt(val)
            setIsYearInvalid(false)
        }
        setSelectedYear(val)
    }

    const handleDelete = () => {
        /** 
         * Updates data and UI to reflect the user's
         * choice to delete selected action tags.
         */

        // Determine actions to delete.
        let actionsToKeep = []
        for (let [year, actions] of Object.entries(yearActions)) {
            year = parseInt(year)
            actionsToKeep = []
            for (let i=0; i<yearActions[year].length; i++) {
                if (!actions[i].selected) { // Keep unselected actions only.
                    actionsToKeep.push(JSON.parse(JSON.stringify(actions[i])))
                } else {
                    if ("setTagSelectionState" in actions[i]) {
                        actions[i].setTagSelectionState(false)
                    }
                    deleteAction(
                        year, actions[i].actionType, actions[i].treeType, 
                        "treeLifeStage" in actions[i] ? actions[i].treeLifeStage : ""
                    )
                }
            }
            yearActions[year] = actionsToKeep
            if (
                yearActions[year].length == 0
                && !(rotationYears.includes(year))
            ) delete(yearActions[year])
        }

        // Update UI.
        setYearActionsObjects(getYearActionsObjects())
    }

    const handleDeleteAll = (e) => {
        /**
         * Deletes all currently planned actions.
         */

        const actionsToKeep = [] // Will be empty. No actions are kept.
        for (let [year, actions] of Object.entries(yearActions)) {
            year = parseInt(year)
            for (let i=0; i<yearActions[year].length; i++) {
                // Keep no actions.
                if ("setTagSelectionState" in actions[i]) {
                    actions[i].setTagSelectionState(false)
                }
                deleteAction(
                    year, actions[i].actionType, actions[i].treeType, 
                    "treeLifeStage" in actions[i] ? actions[i].treeLifeStage : ""
                )
            }
            yearActions[year] = actionsToKeep
            if (
                yearActions[year].length == 0
                && !(rotationYears.includes(year))
            ) delete(yearActions[year])
        }

        // Update UI.
        setYearActionsObjects(getYearActionsObjects())
    }

    const handleActionSelection = (selection) => {
        /**
         * Changes data and UI to reflect a new action that
         * was selected by the user.
         * @param selection: The action that was selected 
         *                        by the user.
         */
        setSelectedAction(selection)
    }

    const handleTreeSelection = (selection) => {
        /**
         * Changes data and UI to reflect a new tree
         * type and life stage that was selected by the user.
         * @param selection: User's latest selection.
         */
        selection = selection.split("_")
        setSelectedTreeType(selection.pop())
        setSelectedTreeLifeStage(selection.join("_"))
    }

    const handleAdd = () => {
        /**
         * Facilitates addition of selected action to the plan.
         */
        if (!isCountInvalid && !isYearInvalid) {
            let years = []
            let y = selectedYear
            while (y < JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)) {
                years.push(y)
                if (!repeat) break
                y += rotationPeriod
            }
            for (const year of years) {
                addAction(
                    year, selectedAction, treeCount,
                    selectedTreeType, selectedTreeLifeStage 
                )
            }
            updateYearActions()
            setYearActionsObjects(getYearActionsObjects())
        }
    }

    const toggleDependence = (stream) => {
        /**
         * Function that turns an income 
         * stream off or on.
         * @param stream: Name of income stream.
         */
        const newVal = JSON.parse(JSON.stringify(incomeDependency))
        newVal[stream] = 1 - newVal[stream]
        setIncDep(newVal)
        setIncomeDependency(newVal)
    }

    useEffect(() => {
        updateYearActions()
        setYearActionsObjects(getYearActionsObjects())
    }, [rotationPeriod, updateTrigger])

    useEffect(() => {
        let switches = []
        for(const [stream, dependence] of Object.entries(incomeDependency)) {
            if (stream != "timber") {
                switches.push(
                    <div 
                        key={`switch-${stream}`} 
                        className='
                            p-2 bg-[#FFF] flex flex-col 
                            justify-center rounded-lg
                            items-center gap-1
                        '
                    >
                        <div className='font-bold text-[#888] text-sm text-center'>{
                            incomeSources[stream].label.toUpperCase()
                        }</div>
                        <div className='flex gap-3 justify-center items-center'>
                            <img src={`${stream}.png`} className='h-12' />
                            <Switch 
                                isOnStart={dependence == 1} 
                                onToggle={() => toggleDependence(stream)}
                                onColor="#32BE51"
                                offColor="#6E6E6E"
                            />
                        </div>
                    </div>
                )
            }
        }
        setIncDepSwitches(switches)
        setTriggerSwitchUpdate(prevVal => 1 - prevVal)
    }, [incomeDependency])

    useEffect(() => {
        setIncomeDependency(incDep)
    }, [incDep])

    useEffect(() => {
        updateYearActions()
        setYearActionsObjects(getYearActionsObjects())
    }, [])

    return (
        <div className='action-manager grid grid-cols-2 gap-5 max-w-5xl'>
            {/* VIEWER */}
            <div className='mb-5 col-span-1 row-span-1'>
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
                            onDoubleClick={handleDeleteAll}
                        ><img src="bin.png" className='max-h-8 p-1 w-auto'/></Button>
                        <Button // SAVE BUTTON
                            outlineColor='#9FCBFF' bgColor='#C5E0FF'
                            onClick={onSave}
                        ><img src="save.png" className='max-h-8 p-1 w-auto'/></Button>
                        <Button // UPLOAD BUTTON
                            outlineColor='#F0BDFE' bgColor='#F7D9FF'
                            onClick={()=>{document.getElementById('file-input').click()}}
                        >
                            <img src="upload.png" className='max-h-8 p-1 w-auto'/>
                            <input
                                type="file"
                                accept="application/json"
                                onChange={onLoad}
                                style={{ display: 'none' }}
                                id="file-input"
                            ></input>
                        </Button>
                    </div>
                </div>
                {/* YEAR & ACTION TAGS */}
                <div 
                    className="bg-[#FFFFFF] rounded-lg p-3"
                    style={{height: "200px"}}
                >
                    <div className='
                        flex w-full h-full gap-5 overflow-hidden
                        hover:overflow-x-scroll
                    '>{[yearActionObjects]}</div>
                </div>
            </div>

            {/* ACTION & TREE TYPE SELECTION */}
            <div className='
                grid grid-rows-1 grid-cols-3 justify-between gap-3 
                rounded-lg bg-[#AAAAAA] p-3 col-span-1 row-span-2
            '>
                {/* ACTION BUTTONS */}
                <div className='col-span-1 row-span-1'>
                    <ActionSelector handleSelection={handleActionSelection}/>
                </div>
                
                {/* TREE TYPE BUTTONS */}
                <div className='col-span-2 row-span-1'>
                    <Veil 
                        borderRadius={8} 
                        isVeiled={selectedAction == "none"}
                        veilColor='#101626'
                    >
                        <TreeTypeSelector handleSelection={handleTreeSelection}/>
                    </Veil>
                </div>
                
                {/* COUNT, YEAR, REPEAT SETTERS + BUTTONS */}
                <div className='col-span-3 row-span-1 h-[105px]'>
                    <Veil
                        borderRadius={8} 
                        isVeiled={selectedAction == "none" || selectedTreeType == "none"}
                        veilColor='#101626'
                    >
                        <div className='grid grid-cols-3 gap-2 p-3'>
                            <div className='flex gap-5 justify-between col-span-2'>
                                <div className='flex flex-col justify-between gap-2'>
                                    {/* YEAR SELECTOR */}
                                    <TextInput 
                                        label='YEAR:'
                                        placeholder={placeholderYear}
                                        textColor={isYearInvalid ? colorBad : colorDefaultText}
                                        sanityCheck={sanityCheckYear} 
                                        handleVal={handleYearChange}
                                        maxWidth="30px"
                                        bgColor='#EEEEEE'
                                        borderColor='#EEEEEE'
                                    />
                                    {/* COUNT SELECTOR */}
                                    <TextInput 
                                        label='COUNT:'
                                        placeholder={placeholderTreeCount}
                                        textColor={isCountInvalid ? colorBad : colorDefaultText}
                                        sanityCheck={sanityCheckTreeCount} 
                                        handleVal={handleTreeCountChange}
                                        maxWidth="30px"
                                        bgColor='#EEEEEE'
                                        borderColor='#EEEEEE'
                                    />
                                </div>
                                {/* REPEAT SELECTOR */}
                                <div>
                                    <div className='
                                        flex flex-col items-center justify-between 
                                        gap-2 p-3 bg-[#EEEEEE] rounded-lg
                                    '>
                                        <b>REPEAT</b>
                                        <Switch 
                                            isOnStart={repeat} 
                                            onToggle={(val) => setRepeat(val)}
                                            onColor="#32BE51"
                                            offColor="#6E6E6E"
                                        />
                                    </div>
                                </div>
                            </div>
                        
                            {/* ADD BUTTON */}
                            <div className='
                                flex flex-wrap gap-3 justify-center
                                place-content-center h-full w-full
                            '>
                                <Button
                                    outlineColor='#B9DEB5' bgColor='#99cc93'
                                    onClick={handleAdd}
                                ><img src="plus.png" className='max-h-8 p-1 w-auto'/></Button>
                            </div>
                        </div>
                    </Veil>
                </div>
            </div>

            {/* INCOME STREAM SETTER */}
            {setIncDep != null && 
                <div className='col-span-1 row-span-1 flex gap-3 justify-evenly items-center -mt-6'>
                    <div className='text-right flex flex-col justify-center items-right'>
                        <b>OTHER</b>
                        <b>INCOME</b>
                        <b>STREAMS</b>
                    </div>
                    <b>:</b>
                    {triggerSwitchUpdate >= 0 && incDepSwitches}
                </div>
            }
        </div>
    )
}

export default ActionManager
