"use client"

import Tag from "./Tag"
import { useEffect } from "react"

const YearActions = ({
    year, actions, maxHeight, 
    onActionTagClick=()=>{}
}) => {
    /**
     * Component that embodies a year tag and all
     * associated action tags in the main planner.
     * @param year: The year of interest.
     * @param actions: All actions associated with this year.
     * @param maxHeight: Max height of the viewer.
     * @param onActionTagClick: Function that handles changes 
     *                              associated with an action tag being
     *                              clicked. This function takes 2 inputs
     *                              being the year clicked and the index
     *                              of the tag within that year that was clicked.
     */

    const colorBad = "#F44A4A"
    const colorGood = "#32CE51"
    const colorDefault = "#CCCCCC"
    const borderColorDefault = "#DDDDDD"
    const borderColorSelected = "#FCF412"
    const actionSuccessColors = {"-1": colorDefault, "1":colorGood, "0":colorBad}

    const handleActionTagClick = (selected, setSelected, year, actionIdx) => {
        /** 
         * Handles the event wherein the user clicks on an action tag. 
         * @param selected: Whether tag is selected or not.
         * @param setSelected: Function that allows one to change
         *                     the selected state of the clicked tag.
         * @param year: Year associated with action tag clicked.
         * @param actionIdx: The index of the action clicked.
        */
        setSelected(!selected)
        onActionTagClick(!selected, setSelected, year, actionIdx)
    }

    return (
        <div>
            <Tag borderColor="#6892FF" bgColor="#6892FF">
                <div className='
                    rounded-full py-1 w-32 text-center
                    font-bold text-[#FFFFFF]
                '>{year}</div>
            </Tag>
            <div 
                className='mt-3 mb-3 flex flex-col gap-3 overflow-hidden hover:overflow-scroll'
                style={{maxHeight: maxHeight}}
            >{[
                actions.map((action, i) => {
                    return(<Tag 
                        key={`action-tag-${year}-${i}`}
                        bgColor="#EEEEEE"
                        borderColor={borderColorDefault}
                        borderColorSelected={borderColorSelected}
                        borderRadius={"10px"}
                        isSelected={action.selected}
                        onClick={(selected, setSelected) => {
                            handleActionTagClick(selected, setSelected, year, i)
                        }}
                    >
                        <div className='
                            py-2 w-32 flex gap-1
                            items-center justify-center 
                        '>
                            <img src={
                                action.actionType == "fell" ? "axe.png" : "shovel.png"
                            } className='max-h-8 w-auto'/>
                            <b>{action.count}</b>
                            <img src={
                                action.actionType == "plant" ? 
                                `mature_${action.treeType}.png` : 
                                `${action.treeLifeStage}_${action.treeType}.png`
                            } className='max-h-8 w-auto'/>
                            <div 
                                className='rounded-full w-4 h-4'
                                style={{backgroundColor: actionSuccessColors[
                                    action.success.toString()
                                ]}}
                            ></div>
                        </div>
                    </Tag>)
                })
            ]} </div>
        </div>
    )
}

export default YearActions