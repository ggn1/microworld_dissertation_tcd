    "use client"

    import Money from './Money.jsx'
    import PropBar from "./PropBar.jsx"
    import { Tooltip } from 'react-tooltip'
    import { useState, useEffect } from "react"

    const MoneyViewer = ({
        targets, funds, income, resources, dependency, 
        hideTargets, hideIncDep
    }) => {
        /** 
         * This component displays income targets as
         * well as current values per rotation.
         * @param funds: Total bank balance.
         * @param targets: An object mapping current rotation target income 
         *                 from each income stream.
         * @param income: Latest cumulative income of the form {
         *                  total: Big(...), timber: Big(...), 
         *                  ntfp: Big(...), recreation: Big(...)
         *                }.
         * @param dependency: An object with latest dependency associated with
         *                    each income stream.
         * @param hideTargets: Whether income targets are hidden.
         * @param resources: Available resources in the world.
         * @param hideIncDep: Hide income dependency panel.
         */

        const colorGood = "#32BE51"
        const colorDefault = "#EEEEEE"
        const incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)

        const [resourceData, setResourceData] = useState([])

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
                            className="
                                rounded-lg px-2 py-1 text-center 
                                flex flex-col justify-center items-center
                            "
                            style={{backgroundColor: income.rotation[resource].lt(
                                targets[resource]
                            ) || hideTargets ? colorDefault : colorGood}}
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
                            <Money amountBig={income.rotation[resource]} showUnit={false}/>
                            {!hideTargets && <>
                                <div className="bg-[#232323] h-[1px] rounded-full w-full"></div>
                                {/* <div>/</div> */}
                                <Money amountBig={targets[resource]} showUnit={false}/>
                            </>}
                        </div>
                    )
                }
            }
            return resourceData
        }

        useEffect(() => {
            Object.keys(targets).length > 0 && 
            setResourceData(getResourceValues())
        }, [targets, income, hideTargets])

        return (
            Object.keys(targets).length > 0 && 
            <div className='flex flex-col gap-3'>
                <div className='flex gap-3'>
                    {/* Bank Balance */}
                    <div className='flex flex-grow bg-[#FFF] rounded-lg p-2 gap-3 items-center justify-center'>
                        <b>BANK BALANCE:</b>
                        <Money amountBig={funds}/>
                    </div>
                    {/* Income Dependency */}
                    {!hideIncDep && <PropBar
                        proportions={Object.values(dependency)}
                        colors={Object.values(resources).map(resource => resource.color)}
                        labels={Object.values(resources).map(resource => resource.label)}
                    />}
                </div>
                <div className="flex gap-3">
                    {/* Income */}
                    <div className='bg-[#FFFFFF] p-3 rounded-lg flex-grow text-center'>
                        <div className='flex gap-1 items-center justify-center font-bold mb-2'>
                            <img src="coin.png" className="h-5 w-5"/>
                            INCOME
                        </div>
                        <div className='flex justify-between mb-2 gap-3'>
                            {/* Overall */}
                            <div className='flex items-center gap-1'>
                                <div className='font-bold text-[#888]'>OVERALL:</div>
                                <Money amountBig={income.overall.total} showUnit={false}/>
                            </div>
                            {/* YEAR */}
                            <div className='flex items-center gap-1'>
                                <div className=' font-bold text-[#888]'>YEAR:</div>
                                <Money amountBig={income.year.total} showUnit={false}/>
                            </div>
                        </div>
                        {/* ROTATION */}
                        <div className='
                            p-2 flex flex-col gap-1 border-4 border-[#EEEEEE]
                            justify-center items-center rounded-lg border-dashed
                        '>
                            <div className='flex w-full gap-3 justify-between'>
                                <div className='font-bold text-[#888]'>ROTATION</div>
                                {(dependency.ntfp > 0 || dependency.recreation > 0) &&
                                    <div className='flex gap-1'>
                                        <div className='font-bold text-[#888]'>TOTAL:</div>
                                        <Money amountBig={income.rotation.total} showUnit={false}/>
                                        {!hideTargets && <>
                                            <div>/</div>
                                            <Money amountBig={targets.total} showUnit={false}/>
                                        </>}
                                    </div>
                                }
                            </div>
                            <div className='flex gap-2 justify-center'>
                                {resourceData}
                            </div>
                        </div>
                    </div>
                    {/* Expenditure */}
                    <div className='bg-[#FFFFFF] p-3 rounded-lg flex-grow text-center'>
                        <div className='flex gap-1 items-center justify-center font-bold mb-2'>
                            <img src="coin.png" className="h-5 w-5"/>
                            EXPENDITURE
                        </div>
                        <div className='flex justify-between mb-2 gap-3'>
                            {/* Overall */}
                            <div className='flex items-center gap-1'>
                                <div className='font-bold text-[#888]'>OVERALL:</div>
                                {/* <Money amountBig={income.overall.total} showUnit={false}/> */}
                            </div>
                            {/* YEAR */}
                            <div className='flex items-center gap-1'>
                                <div className=' font-bold text-[#888]'>YEAR:</div>
                                {/* <Money amountBig={income.year.total} showUnit={false}/> */}
                            </div>
                        </div>
                        {/* ROTATION */}
                        <div className='
                            p-2 flex flex-col gap-1 border-4 border-[#EEEEEE]
                            justify-center items-center rounded-lg border-dashed
                        '>
                            <div className='flex w-full gap-3 justify-between'>
                                <div className='font-bold text-[#888]'>ROTATION</div>
                                {(dependency.ntfp > 0 || dependency.recreation > 0) &&
                                    <div className='flex gap-1'>
                                        <div className='font-bold text-[#888]'>TOTAL:</div>
                                        {/* <Money amountBig={income.rotation.total} showUnit={false}/> */}
                                    </div>
                                }
                            </div>
                            <div className='flex gap-2 justify-center'>
                                {/* {resourceData} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    export default MoneyViewer