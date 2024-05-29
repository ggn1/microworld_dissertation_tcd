"use client"

import Button from './Button.jsx'
import Card from './Card.jsx'
import { useEffect, useState } from 'react'
import TextInput from './TextInput.jsx'
import Switch from './Switch.jsx'

const ActionManager = () => {
  return (
    <div>
        {/* ACTION & YEAR TAGS */}
        <div className='mb-5'>
            <div className='flex justify-between gap-5 mb-3 items-center flex-wrap'>
                <div className='flex gap-5 justify-evenly'>
                    <b>{"Years ->"}</b>
                    <b>{"Actions ↓"}</b>
                </div>
                <Button 
                    outlineColor='#D28282' bgColor='#FFC5C5'
                    onClick={() => {console.log("DELETE button clicked.")}}
                ><img src="bin.png" className='h-8 p-1 w-auto'/></Button>
            </div>
            <div className="bg-[#FFFFFF] rounded-lg p-3 h-52">            
            </div>
        </div>
        {/* ACTION & TREE TYPE SELECTION */}
        <div className='
            flex justify-between gap-3 items-center 
            rounded-lg bg-[#AAAAAA] p-3 box-border
        '>
            <div className='py-2 px-5 bg-[#D0D0D0] rounded-lg text-center'>
                <p className='mb-2 font-bold'>ACTIONS</p>
                <div className='mb-2'>
                    <Button 
                    outlineColor='#DDDDDD' bgColor='#F1F1F1'
                        onClick={() => {console.log("PLANT button clicked.")}}
                    ><img src="shovel.png" className='h-16 w-auto'/></Button>
                </div>
                <div>
                    <Button 
                    outlineColor='#DDDDDD' bgColor='#F1F1F1'
                        onClick={() => {console.log("FELL button clicked.")}}
                    ><img src="axe.png" className='h-16 w-auto'/></Button>
                </div>
            </div>
            <div className='py-2 px-5 bg-[#D0D0D0] rounded-lg text-center'>
                <p className='mb-2 font-bold'>TREE TYPES</p>
                {/* DECIDUOUS */}
                <div className='flex justify-center gap-2'> 
                    <div className='mb-2'>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("MATURE DECIDUOUS button clicked.")}}
                        ><img src="mature_deciduous.png" className='h-16 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("OLD GROWTH DECIDUOUS button clicked.")}}
                        ><img src="old_growth_deciduous.png" className='h-16 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("SENESCENT DECIDUOUS button clicked.")}}
                        ><img src="senescent_deciduous.png" className='h-16 w-auto'/></Button>
                    </div>
                </div>
                {/* CONIFEROUS */}
                <div className='flex justify-center gap-2'> 
                    <div className='mb-2'>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("MATURE CONIFEROUS button clicked.")}}
                        ><img src="mature_coniferous.png" className='h-16 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("OLD GROWTH CONIFEROUS button clicked.")}}
                        ><img src="old_growth_coniferous.png" className='h-16 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                        outlineColor='#DDDDDD' bgColor='#F1F1F1'
                            onClick={() => {console.log("SENESCENT CONIFEROUS button clicked.")}}
                        ><img src="senescent_coniferous.png" className='h-16 w-auto'/></Button>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-3 justify-between'>
                <div className='flex items-center gap-2 p-2 bg-[#D0D0D0] rounded-lg'>
                    <b>COUNT:</b>
                    <TextInput/>
                </div>
                <div className='flex items-center gap-2 p-2 bg-[#D0D0D0] rounded-lg'>
                    <b>REPEAT:</b>
                    {/* <Switch/> */}
                </div>
                <div className='
                    grid grid-cols-2 grid-rows-2 gap-3 place-items-center
                '>
                    <div>
                        <Button 
                            outlineColor='#8AB885' bgColor='#B9DEB5'
                            onClick={() => {console.log("ADD button clicked.")}}
                        ><img src="plus.png" className='h-8 p-1 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                            outlineColor='#D2BD96' bgColor='#EFE0C4'
                            onClick={() => {console.log("FILTER button clicked.")}}
                        ><img src="filter.png" className='h-8 p-1 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                            outlineColor='#9FCBFF' bgColor='#C5E0FF'
                            onClick={() => {console.log("SAVE button clicked.")}}
                        ><img src="save.png" className='h-8 p-1 w-auto'/></Button>
                    </div>
                    <div>
                        <Button 
                            outlineColor='#F0BDFE' bgColor='#F7D9FF'
                            onClick={() => {console.log("UPLOAD button clicked.")}}
                        ><img src="upload.png" className='h-8 p-1 w-auto'/></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ActionManager
