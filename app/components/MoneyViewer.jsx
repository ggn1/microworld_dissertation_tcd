    "use client"

    import Help from './Help.jsx'
    import Money from './Money.jsx'
    import PropBar from "./PropBar.jsx"
    import * as utils from '../utils.js'
    import { useState, useEffect } from "react"
    import { Tooltip } from 'react-tooltip'

    const MoneyViewer = ({
        targets, funds, income, resources, dependency, 
        hideTargets, expenses
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
         */
        const incomeSources = JSON.parse(process.env.NEXT_PUBLIC_INCOME_SOURCES)
        const helpData = [["heading", "MONEY VIEWER PANEL"], ["paragraph", "Coins are the currency of this microworld. The MONEY VIEWER displays your bank balance, income, and expenses."],["paragraph", "BANK BALANCE is the total amount of coins that you have at any given point in the simulation."], ["paragraph", "INCOME refers to no. of coins you have earned. Overall income is how much you've earned so far in the simulation, yearly income is how much you've earned this year alone, and rotation income is how much you have earned in this rotation alone."], ["paragraph", "EXPENSES refer to how much you have spent overall, this year, and this rotation. Felling/planting a tree costs coins that comprise this expenditure."], ["image", "help/coins_1.png"], ["paragraph", "By default, it is income/expense per rotation that is visible below the icon representing type of income stream. You may click on 'OVERALL', 'YEAR' or 'ROTATION' to update this. Hover over the icon to view the name of the income stream."], ["image", "help/coins_2.png"]]

        const [resourceIncData, setResourceIncData] = useState([])
        const [resourceExpData, setResourceExpData] = useState([])
        const [incProp, setIncProp] = useState({})
        const [expProp, setExpProp] = useState({})
        const [breakdownIncLvl, setBreakdownIncLvl] = useState("rotation")

        const getResourceIncExpDivs = (incExp) => {
            /**
             * Returns a list of renderable divs containing all
             * relavent income or expenses related data per resource.
             * @param incExp: Whether income or expenses is to be returned.
             * @return: List of <div>s with all resource information. 
             */
            let resourceData = []
            for (const resource of Object.keys(incomeSources)) {
                if (dependency[resource] > 0) {
                    resourceData.push(
                        <div className="
                            rounded-lg px-2 py-1 text-center flex
                            flex-col justify-center items-center bg-[#EEE]
                        ">
                            <img 
                                src={incomeSources[resource].image} 
                                className="h-8 w-auto"
                                data-tooltip-id={`tooltip-${incExp}-${resource}`}
                                data-tooltip-content={incomeSources[resource].label}
                                data-tooltip-place="top"
                            />
                            <Money amountBig={
                                incExp == "income" ?
                                income[breakdownIncLvl][resource] : 
                                expenses[breakdownIncLvl][resource]
                            } showUnit={false}/>
                            <Tooltip id={`tooltip-${incExp}-${resource}`}/>
                        </div>
                    )
                }
            }
            return resourceData
        }

        const updateIncExpProp = () => {
            /**
             * Computes and sets income dependency proportions.
             */
            const resourceProp = {income:{}, expenses:{}}
            for (const resource of Object.keys(resources)) {
                if (income.overall.total.eq(0)) resourceProp.income[resource] = 0
                else resourceProp.income[resource] = income.overall[resource].div(
                    income.overall.total
                ).toFixed(2)
                if (expenses.overall.total.eq(0)) resourceProp.expenses[resource] = 0
                else resourceProp.expenses[resource] = expenses.overall[resource].div(
                    expenses.overall.total
                ).toFixed(2)
            }
            setIncProp(resourceProp.income)
            setExpProp(resourceProp.expenses)
        }

        useEffect(() => {
            setResourceIncData(getResourceIncExpDivs("income"))
            setResourceExpData(getResourceIncExpDivs("expenses"))
        }, [breakdownIncLvl])

        useEffect(() => {
            if (resourceIncData.length > 1 || resourceExpData.length > 1) {
                helpData.push(["paragraph", "When there are multiple sources of income, a breakup of income and expenses per stream is displayed using a color coded proportion bar. Hover over each color to view the income stream and its contribution."])
                helpData.push(["image", "help/coins_3.png"])
            }
        }, [resourceIncData, resourceExpData])

        useEffect(() => {
            Object.keys(targets).length > 0 && 
            setResourceIncData(getResourceIncExpDivs("income"))
            setResourceExpData(getResourceIncExpDivs("expenses"))
            updateIncExpProp()
        }, [targets, income, hideTargets])

        return (
            Object.keys(targets).length > 0 && 
            <Help helpData={helpData} page="world">
                <div className='flex flex-col pt-6 gap-3 h-full justify-center align-middle'>
                    <div className='flex gap-3'>
                        {/* Bank Balance */}
                        <div className='flex flex-grow bg-[#FFF] rounded-lg p-2 gap-3 items-center justify-center'>
                            <b>BANK BALANCE:</b>
                            <Money amountBig={funds}/>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* INCOME */}
                        <div className='bg-[#FFFFFF] p-3 rounded-lg flex-grow text-center'>
                            <div className='flex justify-between'>
                                {/* TITLE */}
                                <div className='flex gap-1 items-center justify-center font-bold mb-2'>
                                    <img src="coin.png" className="h-5 w-5"/>
                                    INCOME
                                </div>
                                {/* Overall */}
                                <div className='flex items-center gap-1'>
                                    <div 
                                        className='
                                            font-bold *:font-bold text-[#888] *:text-[#888] 
                                            select-none hover:underline cursor-pointer
                                        '
                                        onClick={() => {
                                            if (breakdownIncLvl != "overall") {
                                                setBreakdownIncLvl("overall")
                                            }  
                                        }}
                                    >
                                        {breakdownIncLvl == "overall" ? <u>OVERALL:</u> : "OVERALL:"}
                                    </div>
                                    <Money amountBig={income.overall.total} showUnit={false}/>
                                </div>
                            </div>
                            <div className='flex justify-between mb-2 gap-3'>
                                {/* ROTATION */}
                                <div className='flex w-full gap-3'>
                                    <div 
                                        className='
                                            font-bold *:font-bold text-[#888] *:text-[#888] 
                                            select-none hover:underline cursor-pointer
                                        '
                                        onClick={() => {
                                            if (breakdownIncLvl != "rotation") {
                                                setBreakdownIncLvl("rotation")
                                            }  
                                        }}
                                    >
                                        {breakdownIncLvl == "rotation" ? <u>ROTATION:</u> : "ROTATION:"}
                                    </div>
                                    <div className='flex gap-1'>
                                        <Money amountBig={income.rotation.total} showUnit={false}/>
                                        {!hideTargets && <>
                                            <div className='select-none'>/</div>
                                            <Money amountBig={targets.total} showUnit={false}/>
                                        </>}
                                    </div>
                                </div>
                                {/* YEAR */}
                                <div className='flex items-center gap-1'>
                                    <div 
                                        className='
                                            font-bold *:font-bold text-[#888] *:text-[#888] 
                                            select-none hover:underline cursor-pointer
                                        '
                                        onClick={() => {
                                            if (breakdownIncLvl != "year") {
                                                setBreakdownIncLvl("year")
                                            }  
                                        }}
                                    >
                                        {breakdownIncLvl == "year" ? <u>YEAR:</u> : "YEAR:"}
                                    </div>
                                    <Money amountBig={income.year.total} showUnit={false}/>
                                </div>
                            </div>
                            {/* BREAKDOWN */}
                            <div className='flex gap-3 justify-center items-center'>
                                {resourceIncData}
                            </div>
                            {/* DEPENDENCY */}
                            {resourceIncData.length > 1 && <PropBar
                                title=""
                                proportions={Object.values(incProp)}
                                colors={Object.keys(incProp).map(resource => {
                                    return resources[resource].color
                                })}
                                labels={Object.keys(incProp).map(r => {
                                    const resource = resources[r]
                                    return (
                                        `${resource.label} = ${incProp[resource.type]*100}%\n`
                                        + `(${utils.nFormatter(
                                            income.overall[resource.type].toFixed(2), 2
                                        )} coins)`
                                    )
                                })}
                            />}
                        </div>
                        {/* EXPENSES */}
                        <div className='bg-[#FFFFFF] p-3 rounded-lg flex-grow text-center'>
                            <div className='flex justify-between'>
                                {/* TITLE */}
                                <div className='flex gap-1 items-center justify-center font-bold mb-2'>
                                    <img src="coin.png" className="h-5 w-5"/>
                                    EXPENSES
                                </div>
                                {/* Overall */}
                                <div className='flex items-center gap-1'>
                                    <div 
                                        className='
                                            font-bold *:font-bold text-[#888] *:text-[#888] 
                                            select-none hover:underline cursor-pointer
                                        '
                                        onClick={() => {
                                            if (breakdownIncLvl != "overall") {
                                                setBreakdownIncLvl("overall")
                                            }  
                                        }}
                                    >
                                        {breakdownIncLvl == "overall" ? <u>OVERALL:</u> : "OVERALL:"}
                                    </div>
                                    <Money amountBig={expenses.overall.total} showUnit={false}/>
                                </div>
                            </div>
                            <div className='flex justify-between mb-2 gap-3'>
                                {/* ROTATION */}
                                <div className='flex w-full gap-3'>
                                    <div 
                                        className='
                                            font-bold *:font-bold text-[#888] *:text-[#888] 
                                            select-none hover:underline cursor-pointer
                                        '
                                        onClick={() => {
                                            if (breakdownIncLvl != "rotation") {
                                                setBreakdownIncLvl("rotation")
                                            }  
                                        }}
                                    >
                                        {breakdownIncLvl == "rotation" ? <u>ROTATION:</u> : "ROTATION:"}
                                    </div>
                                    <div className='flex gap-1'>
                                        <Money amountBig={expenses.rotation.total} showUnit={false}/>
                                    </div>
                                </div>
                                {/* YEAR */}
                                <div className='flex items-center gap-1'>
                                    <div 
                                        className='
                                            font-bold *:font-bold text-[#888] *:text-[#888] 
                                            select-none hover:underline cursor-pointer
                                        '
                                        onClick={() => {
                                            if (breakdownIncLvl != "year") {
                                                setBreakdownIncLvl("year")
                                            }  
                                        }}
                                    >
                                        {breakdownIncLvl == "year" ? <u>YEAR:</u> : "YEAR:"}
                                    </div>
                                    <Money amountBig={expenses.year.total} showUnit={false}/>
                                </div>
                            </div>
                            {/* BREAKDOWN */}
                            <div className='flex gap-3 justify-center items-center'>
                                {resourceExpData}
                            </div>
                            {/* DEPENDENCY */}
                            {resourceIncData.length > 1 && <PropBar
                                title=""
                                proportions={Object.values(expProp)}
                                colors={Object.keys(expProp).map(resource => {
                                    return resources[resource].color
                                })}
                                labels={Object.keys(expProp).map(r => {
                                    const resource = resources[r]
                                    return (
                                        `${resource.label} = ${expProp[resource.type]*100}%\n`
                                        + `(${utils.nFormatter(
                                            expenses.overall[resource.type].toFixed(2), 2
                                        )} coins)`
                                    )
                                })}
                            />}
                        </div>
                    </div>
                </div>
            </Help>         
        )
    }

    export default MoneyViewer