"use client"

import Link from "next/link"
import Button from "./Button"
import { useEffect, useState } from "react"

const PlanViewer = ({year, rotationPeriod, plan}) => {
    /**
     * Component displays most recently executed and
     * upcoming forest management plans with corresponding years.
     */

    const colorBad = "#F44A4A"
    const colorGood = "#32CE51"
    const colorDefault = "#CCCCCC"
    const borderColorDefault = "#DDDDDD"
    const actionSuccessColors = {"-1": colorDefault, "1":colorGood, "0":colorBad}

    const planYears = Object.keys(plan)

    const [idxPast, setIdxPast] = useState(-1)
    const [idxUpcoming, setIdxUpcoming] = useState(-1)
    const [pastActionTags, setPastActionTags] = useState([])
    const [upcomingActionTags, setUpcomingActionTags] = useState([])

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
        <div className="p-3 flex flex-col h-full gap-3">
            <div className="flex justify-between items-center">
                <div className="flex flex-col justisy-between gap-1">
                    <b>{rotationPeriod} Year Rotation Period</b>
                </div>
                <Link href={"/planner"}>
                    <Button bgColor="#08851C" outlineColor="#2D9C23" fgColor="#FFFFFF">
                        PLAN
                    </Button>
                </Link>
            </div>
            {/* PREVIOUS & UPCOMING PLANS */}
            <div className="
                bg-white h-full grid grid-rows-2 grid-col-1 p-3 rounded-lg">
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
        </div>
    )
}

export default PlanViewer