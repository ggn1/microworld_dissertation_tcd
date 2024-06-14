"use client"

import Card from './Card.jsx'
import * as utils from '../utils.js'
import { Tooltip } from 'react-tooltip'
import { useState, useEffect } from "react"

const IncomeViewer = ({targets, funds, income, dependency, hide}) => {
    /** 
     * This component displays income targets as
     * well as current values per rotation.
     * @param funds: Total bank balance.
     * @param targets: An object mapping current rotation target income 
     *                 from each income stream.
     * @param income: Latest income from each stream in an object.
     * @param dependency: An object with latest dependency associated with
     *                    each income stream.
     * @param hide: Whether income targets are hidden.
     */

    const colorGood = "#32BE51"
    const colorDefault = "#EEEEEE"
    const incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)

    const [resourceData, setResourceData] = useState([])
    // const [showIncTarget, setShowIncTarget] = useState(!hide)

    const getResourceValues = () => {
        /**
         * Returns a list of renderable divs containing all
         * relavent data per resource.
         * @return: List of <div>s with all resource information. 
         */
        let resourceData = []
        for (const resource of Object.keys(incomeSources)) {
            if (dependency[resource] > 0) {
                resourceData.push(
                    <div
                        className="rounded-lg px-2 py-1 text-center"
                        style={{backgroundColor: income[resource].lt(
                            targets[resource]
                        ) || hide ? colorDefault : colorGood}}
                    >
                        <div className='flex justify-center items-center'>
                            <img 
                                src={incomeSources[resource].image} 
                                className="h-8 w-auto hover:scale-110"
                                data-tooltip-id={`tooltip-${resource}`}
                                data-tooltip-content={incomeSources[resource].label}
                                data-tooltip-place="left"
                            />
                            <Tooltip id={`tooltip-${resource}`}/>
                        </div>
                        <div>{utils.nFormatter(income[resource].toFixed(2).toString(), 1)}</div>
                        {!hide && <div className="bg-[#232323] h-[1px] rounded-full w-full"></div>}
                        {!hide && <div>{
                            utils.nFormatter(targets[resource].toFixed(2).toString(), 1)
                        }</div>}
                    </div>
                )
            }
        }
        return resourceData
    }

    useEffect(() => {
        Object.keys(targets).length > 0 && 
        setResourceData(getResourceValues())
    }, [targets, income, hide])

    return (
        Object.keys(targets).length > 0 && <div className="flex gap-3">
            {/* Overall Bank Balance */}
            <div className='
                col-span-1 bg-[#FFFFFF] p-3 text-center rounded-lg flex flex-col 
                justify-center items-center gap-3 h-full flex-grow
            '>
                <div className="flex justify-center gap-1 items-center">
                    <img src="coin.png" className="h-5 w-5"/> 
                    <div className="font-bold">OVERALL BANK BALANCE</div>
                </div>
                {utils.nFormatter(funds, 1)}
            </div>
            {/* This Rotation */}
            <div className='
                bg-[#FFFFFF] p-3 flex flex-col gap-1 
                justify-center items-center rounded-lg flex-grow h-full
            '>
                <div className='flex gap-1 justify-center items-center'>
                    <img src="coin.png" className='h-5 w-5' />
                    <b>ROTATION</b>
                </div>
                <div className='flex gap-2 justify-center'>
                    {resourceData}
                    {(dependency.ntfp > 0 || dependency.recreation > 0) && 
                        <div className='
                            flex flex-col gap-1 px-2 py-1 bg-[#EEEEEE] rounded-lg
                            items-center justify-center
                        '>
                            <b>ALL</b> 
                            <div>{utils.nFormatter(income.total.toFixed(2).toString(), 1)}</div>
                            {
                                !hide && 
                                <div className="bg-[#232323] h-[1px] rounded-full w-full"></div>
                            }
                            {!hide && <div>{
                                utils.nFormatter(targets.total.toFixed(2).toString(), 1)
                            }</div>}
                        </div>
                    }
                </div>
            </div>
            {/* Year */}
            <div className='flex-grow h-full bg-[#FFFFFF] p-3 rounded-lg'>
                <div className='flex gap-1 justify-center items-center'>
                    <img src="coin.png" className='h-5 w-5' />
                    <b>YEAR</b>
                </div>
            </div>
        </div>
    )
}

export default IncomeViewer