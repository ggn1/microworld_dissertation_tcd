    "use client"

    import Money from './Money.jsx'
    import PropBar from "./PropBar.jsx"
    import { useState, useEffect } from "react"

    const MoneyViewer = ({
        targets, funds, income, resources, dependency, 
        hideTargets, hideIncDep, expenses
    }) => {
        /** 
         * This component displays income targets as
         * well as current values per rotation.
         * @param funds: Total bank balance.
         * @param targets: An object mapping current rotation target income 
         *                 from each income stream.
         * @param income: Total and resource specific 
         *                overall, annual, and per rotation income.
         * @param dependency: An object with latest dependency associated with
         *                    each income stream.
         * @param expenses: Total and resource specific 
         *                  overall, annual, and per rotation expenditure.
         * @param hideTargets: Whether income targets are hidden.
         * @param resources: Available resources in the world.
         * @param hideIncDep: Hide income dependency panel.
         */

        const colorGood = "#32BE51"
        const colorDefault = "#EEEEEE"
        const incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)

        const [resourceIncData, setResourceIncData] = useState([])
        const [resourceExpData, setResourceExpData] = useState([])
        const [breakdown, setBreakdown] = useState("rotation")

        const getNumActiveResources = () => {
            /**
             * Returns the no. of resources that
             * the user is dependent on.
             */
            let numResources = 0
            for (const [res, dep] of Object.entries(dependency)) {
                numResources += Number(dep > 0)
            }
            return numResources
        }

        const getResourceIncDivs = () => {
            /**
             * Returns a list of renderable divs containing all
             * relavent income related data per resource.
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
                            <img 
                                src={incomeSources[resource].image} 
                                className="h-8 w-auto"
                                data-tooltip-id={`tooltip-${resource}`}
                                data-tooltip-content={incomeSources[resource].label}
                                data-tooltip-place="left"
                            />
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

        const getResourceExpDivs = () => {
            /**
             * Returns a list of renderable divs containing all
             * relavent expenditure related data per resource.
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
                            style={{backgroundColor: colorDefault}}
                        >
                            <img 
                                src={incomeSources[resource].image} 
                                className="h-8 w-auto"
                                data-tooltip-id={`tooltip-${resource}`}
                                data-tooltip-content={incomeSources[resource].label}
                                data-tooltip-place="left"
                            />
                            <Money amountBig={expenses.rotation[resource]} showUnit={false}/>
                        </div>
                    )
                }
            }
            return resourceData
        }

        useEffect(() => {
            Object.keys(targets).length > 0 && 
            setResourceIncData(getResourceIncDivs())
            setResourceExpData(getResourceExpDivs())
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
                        {
                            getNumActiveResources() > 1 ?
                            <div className='
                                p-2 flex flex-col gap-1 border-4 border-[#EEEEEE]
                                justify-center items-center rounded-lg border-dashed
                            '>
                                <div className='flex w-full gap-3 justify-between'>
                                    <div className='font-bold text-[#888]'>ROTATION:</div>
                                    <div className='flex gap-1'>
                                        <Money amountBig={income.rotation.total} showUnit={false}/>
                                        {!hideTargets && <>
                                            <div>/</div>
                                            <Money amountBig={targets.total} showUnit={false}/>
                                        </>}
                                    </div>
                                </div>
                                <div className='flex gap-2 justify-center'>
                                    {resourceIncData}
                                </div>
                            </div> :
                            <div className='flex items-center gap-1 justify-center'>
                                <div className='font-bold text-[#888]'>ROTATION:</div>
                                <div className='flex gap-1'>
                                    <Money amountBig={income.rotation.total} showUnit={false}/>
                                    {!hideTargets && <>
                                        <div>/</div>
                                        <Money amountBig={targets.total} showUnit={false}/>
                                    </>}
                                </div>
                            </div> 
                        }
                        
                    </div>
                    {/* Expenses */}
                    <div className='bg-[#FFFFFF] p-3 rounded-lg flex-grow text-center'>
                        <div className='flex gap-1 items-center justify-center font-bold mb-2'>
                            <img src="coin.png" className="h-5 w-5"/>
                            EXPENSES
                        </div>
                        <div className='flex justify-between mb-2 gap-3'>
                            {/* Overall */}
                            <div className='flex items-center gap-1'>
                                <div className='font-bold text-[#888]'>OVERALL:</div>
                                <Money amountBig={expenses.overall.total} showUnit={false}/>
                            </div>
                            {/* YEAR */}
                            <div className='flex items-center gap-1'>
                                <div className=' font-bold text-[#888]'>YEAR:</div>
                                <Money amountBig={expenses.year.total} showUnit={false}/>
                            </div>
                        </div>
                        {/* ROTATION */}
                        {
                            getNumActiveResources() > 1 ?
                            <div className='
                                p-2 flex flex-col gap-1 border-4 border-[#EEEEEE]
                                justify-center items-center rounded-lg border-dashed
                            '>
                                <div className='flex w-full gap-3 justify-between'>
                                    <div className='font-bold text-[#888]'>ROTATION:</div>
                                    {getNumActiveResources() > 1 && <Money 
                                        amountBig={expenses.rotation.total} 
                                        showUnit={false}
                                    />}
                                </div>
                                <div className='flex gap-2 justify-center'>
                                    {resourceExpData}
                                </div>
                            </div>:
                            <div className='flex items-center gap-1 justify-center'>
                                <div className='font-bold text-[#888]'>ROTATION:</div>
                                <div className='flex gap-1'>
                                    <Money amountBig={income.rotation.total} showUnit={false}/>
                                    {!hideTargets && <>
                                        <div>/</div>
                                        <Money amountBig={targets.total} showUnit={false}/>
                                    </>}
                                </div>
                            </div> 
                        }
                    </div>
                </div>
            </div>
        )
    }

    export default MoneyViewer