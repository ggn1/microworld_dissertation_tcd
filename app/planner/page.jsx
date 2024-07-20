"use client"

import Link from "next/link"
import { saveAs } from 'file-saver'
import Help from '../components/Help.jsx'
import PopUp from '../components/PopUp.jsx'
import { useRouter } from "next/navigation"
import Button from "../components/Button.jsx"
import { sim, challenge } from "../world/page.jsx"
import React, { useEffect, useState } from "react"
import ActionManager from "../components/ActionManager.jsx"
import RotationPeriod from "../components/RotationPeriod.jsx"

export const PopUpContextPlanner = React.createContext()

const Planner = () => {
    /**
     * This page allows learners to draft forest and 
     * income management plans.
     */

    const helpData = [["heading", "MANAGEMENT ACTION PLANNER"], ["paragraph", "The management action planner enables you to craft forest management plans."], ["image", "help/management_2.png"], ["paragraph", "The action picker facilitates addition of a new action to the plan."], ["image", "help/management_6.png"], ["paragraph", "There are two possible management actions to choose from."], ["paragraph", "1. FELLING: Only mature, old growth, or senescent trees may be felled. Depending on the size of the tree felled, it can cost up to 3000 coins to fell a tree. The income that the felled tree fetches will depend on the wood density of the tree and its size. Nevertheless, felling a tree always leads to some income from timber."], ["paragraph", "2. PLANTING: Irrespective of the life stage chosen from the action picker, upon planting, the tree of chosen type will start out as a seedling. Planting a tree of either type incurs a fixed cost of 277 coins."], ["paragraph", "To add a new action, first, the type of action must be selected. Then, the tree to apply that action to, must be selected. Finally, the maximum no. of trees to be affected as well as the year this action should be executed in, should be set using the text boxes."], ["paragraph", "If invalid numbers are entered into these text boxes, then the change is not applied and the text turns red."], ["If the REPEAT option is turned on, then this means that the picked action will be performed every rotation starting from the year associated with the picked action."], ["paragraph", "Once happy with the settings, clicking the ADD BUTTON adds a new action tag to the plan."], ["paragraph", "The BACK BUTTON can be clicked to return to the world page."], ["paragraph", "Rotation period can be set by changing the value within the ROTATION PERIOD TEXT BOX. Invalid entries (integers ≤ 0, integers ≥ max no. of simulated years = 300, negative numbers, floating point numbers, input containing characters other than numbers) is highlighted in red and will not lead to an update of the rotation period value."], ["The blue year tags represent years at the beginning of each rotation as per set rotation period. This view frame is also horizontally scrollable. ACTION TAGS associated with actions added using the ACTION PICKER will appear under their corresponding year tags. These action tags under each year tag are vertically scrollable in case of view frame overflow."], ["Clicking an action tag, selects it. Clicking a selected action tag, deselects it. Multiple tags may be selected at once. Selected actions may then be deleted by clicking the DELETE BUTTON. Double clicking the DELETE BUTTON deletes all planned actions."], ["paragraph", "Clicking the SAVE BUTTON saves the current state of microworld along with the latest plan and other settings."], ["paragraph", "The UPLOAD BUTTON can be used to load previously saved states."], ["image", "help/management_3.png"], ["paragraph", "If you choose to add an action for a year that falls within a rotation and not at the beginning of one, then such years appear in red to indicate this."], ["image", "help/management_4.png"], ["paragraph", "An action tag displays information about the corresponding action and its execution status. If an action was successfully executed for all no. of the specified type of tree, then execution status is green. If it was only possible to execute this action for a fraction of the originally specified no of trees, then the status is yellow indicating that this action was executed for how many ever trees as was available on land at the time, although that was lesser than the specified count. A red status indicates that the action could not be executed at all (perhaps because there was no instance of the given tree type and age on land)."], ["image", "help/management_5.png"], ["heading", "INCOME STREAMS"], ["paragraph", "Income can be generated from the forest via the timber income stream by selling wood from felled trees. When the fell action gets executed successfully, harvested timber is sold and gets used. Half of all harvested wood gets used as lumber (construction, furniture, etc.) and the other half is burned for heat/to generate power. The lumber use case does not lead to immediate release of carbon stored in the wood because it gets preserved. The energy use case on the other hand, leads to immediate release of carbon in the wood into the atmosphere as CO2."]]

    const router = useRouter()

    const [simNotNull, setSimNotNull] = useState(false)
    const [rotationPeriod, setRotationPeriod] = useState(sim ? sim.planner.rotationPeriod : 0)
    const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0)
    const [incDepRefreshTrigger, setIncDepRefreshTrigger] = useState(0)
    const [incomeDependency, setIncomeDependency] = useState(sim ? sim.planner.incomeDependency : {})

    const [popUpContent, setPopUpContent] = useState("")

    // Component Challenge Wise Visilibility
    const [showIncDep, setShowIncDep] = useState(challenge == 0 || challenge == 5)

    if (showIncDep) {
        helpData.push(["paragraph", "There are more ways of earning from a forest other than the TIMBER INCOME STREAM."])
        helpData.push(["image", "help/management_7.png"])
        helpData.push(["paragraph", "You may harvest and sell other resources found in the forest like honey, mushrooms, and berries. Around 14 kgs of such produce may be available per year, but it may be a bit more or less. This is the NON-TIMBER FOREST PRODUCTS income stream. It is less reliable than the timber income stream. Each kg of produce sells for 170 coins. Maintaining this income stream costs 1620 coins per year to pay workers for harvesting. Switch on the corresponding dependency switch to consider this income stream."])
        helpData.push(["paragraph", "Another option is to open the forest up for public recreational use. You can earn around 465 coins per year this way. However, this too can vary a little depending on no. of visitors and hence is less reliable than timber. This is the FOREST RECREATION income stream. It requires both an initial one-time investment of 40024 coins to establish necessary infrastructure and a yearly maintenance payment of 413 coins in employee wages to sustain it. Switch on the corresponding dependency switch to consider this income stream. In the real world, it may be possible for a portion, or all of the initial investment cost to be paid for using a government grant or other aid money."])
    }

    const handleSave = () => {
        /** 
         * Saves current starting world and plan
         * as JSON data.
         */

        // Gather data to save.
        const data = {
            plan: sim.planner.plan,
            targetSettings: sim.planner.getTargets(),
            initSowPositions: sim.env.land.getInitSowPositions(),
            timeStepOrder: sim.env.land.getTimeStepOrder(),
            incomeDependency: sim.planner.incomeDependency,
            rotationPeriod: sim.planner.rotationPeriod,
            fossilFuelEmission: sim.env.getFossilFuelEmission().toString()
        }

        // Set status of all plans to -1.
        for (const y of Object.keys(data.plan)) {
            for (const actionType of Object.keys(data.plan[y])) {
                let actions = []
                for (let action of data.plan[y][actionType]) {
                    action.success = -1
                    actions.push(action)
                }
                data.plan[y][actionType] = actions
            }
        }
        
        // Convert to JSON and create a BLOB object.
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        
        // Download the data.
        saveAs(blob, "microworld.json")
    }

    const handleLoad = (e) => {
        /**
         * Loads previously saved world state.
         * @param e: File upload event.
         */
        const regex = /^[a-zA-Z0-9\s\[\]\{\}:_\-.,"]+$/

        const file = e.target.files[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            let isContentValid = true
            let data = {}
            const content = e.target.result
            if (!regex.test(content)) isContentValid = false
            if (isContentValid) {
                try {
                    data = JSON.parse(content)
                    if (
                        Object.keys(data).length != 7 ||
                        !("plan" in data) ||
                        !("targetSettings" in data) ||
                        !("initSowPositions" in data) ||
                        !("timeStepOrder" in data) ||
                        !("incomeDependency" in data) ||
                        !("rotationPeriod" in data) ||
                        !("fossilFuelEmission" in data)
                    ) isContentValid = false
                } catch (error) {
                    alert('Invalid File')
                }
            }
            if (!isContentValid) {
                alert("Invalid Content")
            } else { // Valid content.
                sim.loadState(data)
                setPlanRefreshTrigger(prevVal => 1 - prevVal)
                setIncDepRefreshTrigger(prevVal => 1 - prevVal)
                setRotationPeriod(sim.planner.rotationPeriod)
            }
        }

        reader.readAsText(file);
    }

    useEffect(() => {
        // Upon refresh, reload to the home page
        // as sim does not yet exist on this page.
        if (!sim) {
            const navigationEntries = performance.getEntriesByType('navigation')
            if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
                router.replace('/world')
            }
        } else {
            setSimNotNull(true)
        }
    }, [router])

    useEffect(() => {
        if (simNotNull) {
            sim.planner.rotationPeriod = rotationPeriod
        }
    }, [rotationPeriod])

    useEffect(() => {
        setIncomeDependency(sim ? sim.planner.incomeDependency : {})
    }, [incDepRefreshTrigger])

    return (
        simNotNull &&
        <PopUpContextPlanner.Provider value={[popUpContent, setPopUpContent]}>
            <div 
                className="p-5 flex justify-center gap-3 w-full relative"
                style={{
                    gridTemplateColumns: showIncDep ? "1fr 1fr 1fr" : "1fr",
                    placeItems: showIncDep ? "none" : "center"
                }}
            >
                {/* ACTION MANAGER */}
                <div 
                    id="planner-main" 
                    className="
                        bg-[#EEEEEE] col-span-2 row-span-2 rounded-xl 
                        flex flex-col gap-5 p-3
                    "
                >
                    {/* BACK BUTTON & ROTATION SETTER */}
                    <Help helpData={helpData} page="planner">
                        <div className="flex justify-between items-center gap-5 flex-wrap pt-6">
                            <Link href={"/world"}>
                                <Button bgColor="#005FFF" fgColor="#FFFFFF" outlineColor="#5D8AFF">
                                    BACK
                                </Button>
                            </Link>
                            <RotationPeriod 
                                setRotationPeriod={(newPeriod) => {
                                    setRotationPeriod(sim ? parseInt(newPeriod) : 0)
                                }}
                                curRotationPeriod={rotationPeriod}
                                validRange={[1, JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)]}
                            />
                        </div>
                    </Help>
                    {simNotNull && <ActionManager
                        rotationPeriod={rotationPeriod}
                        getPlan={sim.planner.getPlan}
                        addAction={sim.planner.addAction}
                        deleteAction={sim.planner.deleteAction}
                        onSave={handleSave}
                        onLoad={handleLoad}
                        updateTrigger={planRefreshTrigger}
                        incDep={incomeDependency}
                        setIncDep={showIncDep ? sim.planner.setIncDep : null}
                    />}
                </div>
                {popUpContent != "" && 
                    <PopUp handleClose={() => setPopUpContent("")}>
                        {popUpContent}
                    </PopUp>
                }
            </div>
        </PopUpContextPlanner.Provider>
    )
}

export default Planner