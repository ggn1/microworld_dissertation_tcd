"use client"

import Button from "./Button"
import { useState, useEffect } from "react"

const ActionSelector = ({handleSelection}) => {

    /** 
     * This component is the interface that learners
     * can use to select a particular action.
     * @param handleSelection: A function that receives
     *                         selected action as input
     *                         everytime a new selection 
     *                         is made.
     */

    const bgColor = '#F1F1F1'
    const borderColorDefault = "#DDDDDD"
    const borderColorSelected = "#FFFF00"

    const [selected, setSelected] = useState("none")

    useEffect(() => {
        handleSelection(selected)
    }, [selected])

    return (
        <div className='
            flex flex-col place-content-center p-2 bg-[#D0D0D0] 
            rounded-lg text-center h-full action-selector
        '>
            <p className='mb-2 font-bold'>ACTIONS</p>
            <div className='mb-2'>
                <Button 
                    outlineColor={selected == "plant" ? borderColorSelected : borderColorDefault} 
                    bgColor={bgColor}
                    onClick={() => {
                        if(selected != "plant") setSelected("plant")
                        else setSelected("none")
                    }}
                ><img src="shovel.png" className='min-h-10 min-w-9 max-h-16 w-auto'/></Button>
            </div>
            <div>
                <Button 
                    outlineColor={selected == "fell" ? borderColorSelected : borderColorDefault} 
                    bgColor={bgColor}
                    onClick={() => {
                        if(selected != "fell") setSelected("fell")
                        else setSelected("none")
                    }}
                ><img src="axe.png" className='min-h-10 min-w-9 max-h-16 w-auto'/></Button>
            </div>
        </div>
    )
}

export default ActionSelector