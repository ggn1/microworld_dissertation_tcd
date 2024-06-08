"use state"

import { useState, useEffect } from "react"
import * as utils from '../utils.js'

const RotationIncomeViewer = ({targets, income, rotation}) => {
    /** 
     * This component displays income targets as
     * well as current values per rotation.
     */

    const colorGood = "#32BE51"
    const colorDefault = "#FFFFFF"

    const getResourceValues = () => {
        /**
         * Returns a list of renderable divs containing all
         * relavent data per resource.
         * @return: List of <div>s with all resource information. 
         */
        let resourceData = []
        for (const resource of Object.keys(incomeSources)) {
            resourceData.push(
                <div 
                    className="
                        flex flex-col rounded-lg p-1 
                        bg-[#FFFFFF] items-center border-4 px-3
                    " style={{
                        borderColor: income[resource].lt(targets[resource])
                                     ? colorDefault : colorGood
                    }}
                >
                    <img src={incomeSources[resource].image} className="h-12 w-auto"/>
                    <div>
                        <div className="flex gap-1 justify-center items-center">
                            <img src="barcon.png" className="h-4 r-auto"/>
                            <div>{utils.nFormatter(
                                income[resource].toFixed(2).toString()
                            , 1)}</div>
                        </div>
                        <div className="bg-[#232323] h-[1px] rounded-full w-full"></div>
                        <div className="flex gap-1 justify-center items-center">
                            <img src="barcon.png" className="h-4 r-auto"/>
                            <div>{utils.nFormatter(
                                targets[resource].toFixed(2).toString()
                            , 1)}</div>
                        </div>
                    </div>
                </div>
            )
        }
        return resourceData
    }

    const incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
    const [resourceData, setResourceData] = useState([])

    useEffect(() => {
        Object.keys(targets).length > 0 && 
        setResourceData(getResourceValues())
    }, [targets, income])

    return (
        Object.keys(targets).length > 0 && <div className="px-3">
            <div className='flex justify-between gap-3 items-center'>
                <div className='mb-3 font-bold text-center'>
                    INCOME: ROTATION {rotation}
                </div>
                <div className="mb-3">
                    <b>Total = </b> 
                    {utils.nFormatter(
                        income.total.toFixed(2).toString()
                    , 1)} / {utils.nFormatter(
                        targets.total.toFixed(2).toString()
                    , 1)}
                </div>
            </div>
            <div className='flex justify-evenly gap-3'>
                {resourceData}
            </div>
        </div>
    )
}

export default RotationIncomeViewer