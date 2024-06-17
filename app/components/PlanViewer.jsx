"use client"

import Help from "./Help"
import Button from "./Button"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'

const PlanViewer = ({year, rotationPeriod, rotation, plan, pauseWorld}) => {
    /**
     * Component displays most recently executed and
     * upcoming forest management plans with corresponding years.
     * @param year: The current year.
     * @param rotation: Current rotation.
     * @param rotationPeriod: Current rotation period.
     * @param plan: Latest plan.
     * @param pauseWorld: Function that can be called to pause  
     *                    a running simulation.
     */

    const helpData = [["heading", "PLAN VIEWER"], ["paragraph", "Possible forest management actions include cutting down (felling) trees or planting them. Trees may be felled or planted every X no. of years. This X is the ROTATION PERIOD. Management actions such as FELL and PLANT may be scheduled at the end of each ROTATION. This type of planning in rotations mimics real world practices. In agriculture and forestry harvests are often planned in rotations. A rotation is thus defined as 'the number of years between the formation or regeneration of a crop and its harvest'"], ["paragraph", "Planning can be done using the planner that may be accessed via clicking the PLAN button within the PLAN VIEWER PANEL as shown below."], ["paragraph", "The plan viewer displays planned actions. It also shows the current rotation and set rotation period on the top left (ROTATION DISPLAY and ROTATION PERIOD DISPLAY)."], ["paragraph", "Once a plan has been drafted. Actions that were most recently processed as well as the associated year is displayed under Previous Actions. Similarly, actions to be processed next along with the corresponding year, are displayed under Upcoming Actions. These action tags are horizontally scrollable if there are more of them than can fit within the view frame."], ["image", "help/management_1.png"], ["paragraph", "Clicking on the plan button will take you to the PLANNING PAGE."]]

    const colorBad = "#F44A4A"
    const colorGood = "#32CE51"
    const colorDefault = "#CCCCCC"
    const colorOk = "#FFDB59"
    const actionSuccessColors = {
        "-1": colorDefault, "1":colorGood, "0":colorBad, "0.5":colorOk
    }

    const planYears = Object.keys(plan)

    const [idxPast, setIdxPast] = useState(-1)
    const [idxUpcoming, setIdxUpcoming] = useState(-1)
    const [pastActionTags, setPastActionTags] = useState([])
    const [upcomingActionTags, setUpcomingActionTags] = useState([])

    const router = useRouter()

    const updateIndices = () => {
        /**
         * Sets the index of plans corresponding to 
         * last or upcoming plan for the given year if 
         * it exists or -1 otherwise.
         */
        let idxPrev = -1
        for (let i = 0; i < planYears.length; i++) {
            if (planYears[i] < year) idxPrev = i
        }
        let idxNext = -1
        for (let i = idxPrev + 1; i < planYears.length; i++) {
            if (planYears[i] >= year) {
                idxNext = i
                break
            }
        }
        setIdxPast(idxPrev)
        setIdxUpcoming(idxNext)
    }

    const updateActionTags = () => {
        /**
         * Updates the list of renderable read only 
         * action tags with latest past and upcoming actions.
         */
        for (const idxType of ["past", "upcoming"]) {
            let i = -1
            if (idxType == "past") i = idxPast
            else i = idxUpcoming // idxType == "upcoming"
            let actions = []
            if (i >= 0) {
                for (const actionType of Object.keys(plan[planYears[i]])) {
                    for (const actionRaw of plan[planYears[i]][actionType]) {
                        let action = {"actionType": actionType}
                        action["treeType"] = actionRaw.type
                        action["count"] = actionRaw.count
                        action["success"] = actionRaw.success
                        if ("stage" in actionRaw) action["treeLifeStage"] = actionRaw.stage
                        actions.push(action)
                    }
                }
            }
            let actionTags = []
            for (const action of actions) {
                actionTags.push(
                    <div 
                        className="
                            bg-[#EEEEEE] border-4 border-[#DDDDDD] 
                            flex p-2 gap-1 items-center justify-center
                        "
                        style={{ minWidth: "140px", borderRadius: "10px"}}
                    >
                        <img src={
                            action.actionType == "fell" ? "axe.png" : "shovel.png"
                        } className='h-8 w-auto'/>
                        <div className="font-bold">{action.count}</div>
                        <img src={
                            action.actionType == "plant" ? 
                            `mature_${action.treeType}.png` : 
                            `${action.treeLifeStage}_${action.treeType}.png`
                        } className='h-8 w-auto'/>
                        <div
                            style={{
                                minWidth: "15px",
                                minHeight: "15px",
                                borderRadius: "25px",
                                backgroundColor: actionSuccessColors[action.success.toString()],
                            }}
                        ></div>
                    </div>
                )
            }
            if (idxType == "past") setPastActionTags(actionTags)
            else setUpcomingActionTags(actionTags) // (idxType == "upcoming")
        }
    }

    useEffect(() => {
        updateIndices()
    }, [plan, year])

    useEffect(() => {
        updateActionTags()
    }, [idxPast, idxUpcoming])

    return (
        <Help helpData={helpData} page="world">
            {/* ROTATION INFO & PLAN BUTTON */}
            <div className="flex justify-between items-center pt-4 mb-3">
                <div className="font-bold">
                    <p>{rotationPeriod} Year Rotation Period</p>
                    <p>ROTATION {rotation}</p>
                </div>
                <Button 
                    bgColor="#08851C" outlineColor="#2D9C23" 
                    fgColor="#FFFFFF" onClick={() => {
                        pauseWorld()
                        router.push("/planner")
                    }}
                > PLAN </Button>
            </div>
            {/* PREVIOUS & UPCOMING PLANS */}
            <div className="bg-white grid grid-cols-1 grid-rows-2 h-4/5 p-3 rounded-lg">
                {/* UPCOMING PLANS */}
                <div>
                    <div className="flex justify-between gap-3 mb-1"> 
                        <div className="font-bold text-s text-[#999999]">
                            Upcoming Actions
                        </div>
                        <div className="font-bold text-s text-[#999999]">
                            Year {idxUpcoming == -1 ? "" : planYears[idxUpcoming]}
                        </div>
                    </div>
                    <div 
                        className="overflow-hidden hover:overflow-scroll" 
                        style={{ width: "300px"}}
                    >
                        <div className="flex gap-3 items-center">
                            {upcomingActionTags}
                        </div>
                    </div>
                </div>
                {/* PREVIOUS PLANS */}
                <div>
                    <div className="flex justify-between gap-3 items-center mb-1"> 
                        <div className="font-bold text-s text-[#999999]">
                            Previous Actions
                        </div>
                        <div className="font-bold text-s text-[#999999]">
                            Year {idxPast == -1 ? "" : planYears[idxPast]}
                        </div>
                    </div>
                    <div 
                        className="overflow-hidden hover:overflow-scroll" 
                        style={{ width: "300px"}}
                    >
                        <div className="flex gap-3 items-center">
                            {pastActionTags}
                        </div>
                    </div>
                </div>
            </div>
        </Help>
    )
}

export default PlanViewer