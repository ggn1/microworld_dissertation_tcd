"use client"

import Button from "./Button"
import { useState, useEffect } from "react"

const TreeTypeSelector = ({handleSelection}) => {
    /**
     * This component is the interface that learners
     * can use to select a particular tree type.
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
            p-2 bg-[#D0D0D0] rounded-lg text-center
            flex flex-col place-content-center h-full w-full
        '>
            <p className='mb-2 font-bold'>TREE TYPES</p>
            
            {/* DECIDUOUS */}
            <div className='flex justify-center gap-2'> 
                <div className='mb-2'>
                    <Button 
                        outlineColor={
                            selected == "mature_deciduous" ? 
                            borderColorSelected : borderColorDefault
                        } 
                        bgColor={bgColor}
                        onClick={() => {
                            if(selected != "mature_deciduous") {
                                setSelected("mature_deciduous")
                            } else setSelected("none")
                        }}
                    ><img
                        src="mature_deciduous.png" 
                        className='min-h-10 min-w-9 max-h-16 w-auto'
                    /></Button>
                </div>
                <div>
                    <Button 
                        outlineColor={
                            selected == "old_growth_deciduous" ? 
                            borderColorSelected : borderColorDefault
                        } 
                        bgColor={bgColor}
                        onClick={() => {
                            if(selected != "old_growth_deciduous") {
                                setSelected("old_growth_deciduous")
                            } else setSelected("none")
                        }}
                    ><img 
                        src="old_growth_deciduous.png" 
                        className='min-h-10 min-w-9 max-h-16 w-auto'
                    /></Button>
                </div>
                <div>
                    <Button 
                        outlineColor={
                            selected == "senescent_deciduous" ? 
                            borderColorSelected : borderColorDefault
                        } 
                        bgColor={bgColor}
                        onClick={() => {
                            if(selected != "senescent_deciduous") {
                                setSelected("senescent_deciduous")
                            } else setSelected("none")
                        }}
                    ><img 
                        src="senescent_deciduous.png" 
                        className='min-h-10 min-w-9 max-h-16 w-auto'
                    /></Button>
                </div>
            </div>
            
            {/* CONIFEROUS */}
            <div className='flex justify-center gap-2'> 
                <div className='mb-2'>
                    <Button 
                        outlineColor={
                            selected == "mature_coniferous" ? 
                            borderColorSelected : borderColorDefault
                        } 
                        bgColor={bgColor}
                        onClick={() => {
                            if(selected != "mature_coniferous") {
                                setSelected("mature_coniferous")
                            } else setSelected("none")
                        }}
                    ><img 
                        src="mature_coniferous.png" 
                        className='min-h-10 max-h-16 min-w-9 w-auto'
                    /></Button>
                </div>
                <div>
                    <Button 
                        outlineColor={
                            selected == "old_growth_coniferous" ? 
                            borderColorSelected : borderColorDefault
                        } 
                        bgColor={bgColor}
                        onClick={() => {
                            if(selected != "old_growth_coniferous") {
                                setSelected("old_growth_coniferous")
                            } else setSelected("none")
                        }}
                    ><img 
                        src="old_growth_coniferous.png" 
                        className='min-h-10 max-h-16 min-w-9 w-auto'
                    /></Button>
                </div>
                <div>
                    <Button 
                        outlineColor={
                            selected == "senescent_coniferous" ? 
                            borderColorSelected : borderColorDefault
                        } 
                        bgColor={bgColor}
                        onClick={() => {
                            if(selected != "senescent_coniferous") {
                                setSelected("senescent_coniferous")
                            } else setSelected("none")
                        }}
                    ><img 
                        src="senescent_coniferous.png" 
                        className='min-h-10 min-w-9 max-h-16 w-auto'
                    /></Button>
                </div>
            </div>
        </div>
    )
}

export default TreeTypeSelector