'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Simulation from "../model/Simulation.js"
import Timeline from '../components/Timeline.jsx'
import LandPlot from "../components/LandPlot.jsx"
import CO2Scale from "../components/CO2Scale.jsx"
import CarbonDist from "../components/CarbonDist.jsx"
import BdStatus from '../components/BdStatus.jsx'
import PropBar from '../components/PropBar.jsx'
import Targets from '../components/Targets.jsx'
import PlanViewer from '../components/PlanViewer.jsx'
import EmissionsFossilFuels from '../components/EmissionsFossilFuels.jsx'
import RotationIncomeViewer from '../components/RotationIncomeViewer.jsx'
import Funds from '../components/Funds.jsx'

export let sim = null

const Home = () => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [landContent, setLandContent] = useState([])
    const [airCO2, setAirCO2] = useState(0)
    const [envC, setEnvC] = useState({})
    const [bdScore, setBdScore] = useState(0)
    const [bdCat, setBdCat] = useState("")
    const [incomeDependency, setIncomeDependency] = useState({})
    const [rotationPeriod, setRotationPeriod] = useState()
    const [incomeTotal, setIncomeTotal] = useState(0)
    const [funds, setFunds] = useState(0)
    const [curRotation, setCurRotation] = useState(1)
    const [rotationIncomeTargets, setRotationIncomeTargets] = useState({})
    const [rotationIncome, setRotationIncome] = useState({})
    const [plan, setPlan] = useState({})
    const [time, setTime] = useState(0)
    const [pauseTrigger, setPauseTrigger] = useState(0)

    const router = useRouter()

    const updateSimUI = () => {
        setLandContent(sim.env.land.getActiveLandContent())
        setAirCO2(sim.env.getAirCO2ppm())
        setEnvC({...sim.env.carbon})
        setBdScore(sim.env.land.biodiversityScore)
        setBdCat(sim.env.land.biodiversityCategory)
        setIncomeDependency({...sim.planner.incomeDependency})
        setRotationPeriod(sim.planner.rotationPeriod)
        setIncomeTotal(sim.income.total.toFixed(0).toString())
        setFunds(sim.funds.toFixed(2).toString())
        setCurRotation(sim.rotation)
        setRotationIncome({...sim.income})
        setTime(sim.time)
    }

    const updatePlanUI = () => {
        /**
         * Refreshes the plan in plan viewer.
         */
        setPlan({...sim.planner.plan})
    }

    const detectKeyDown = (e) => {
        /** 
         * Function that receives a keypress event.
         */
        if (e.key === "h" || e.key === "H") router.push('/help')
        else if (e.key === "Escape") router.push('/')
    }

    useEffect(() => {
        if (sim == null) {
            sim = new Simulation(updateSimUI, updatePlanUI)
        } else {
            sim.updateSimUI = updateSimUI
            sim.updatePlanUI = updatePlanUI
        }
        updateSimUI()
        updatePlanUI()
        setIsInitialized(true)
        document.addEventListener('keydown', detectKeyDown, true)
    }, [])
    
    return (
        isInitialized &&
        <div className="w-full p-5 grid grid-cols-12 grid-rows-5 gap-2">
            <div id="world-targets" className="rounded-xl bg-[#DEEDFF] col-span-4 row-span-2 
                place-content-center
            ">
                <Targets 
                    setTargets={sim.planner.setTargets} 
                    curCO2={airCO2}
                    curIncome={incomeTotal}
                    curFunds={funds}
                    getTargets={sim.planner.getTargets}
                    startValCO2={sim.planner.getTargets().co2}
                    startValIncome={sim.planner.getTargets().income}
                    updateTargetIncome={sim.planner.setTargets}
                    updateIncTargetsUI={() => setRotationIncomeTargets(
                        sim.getResourceSalesTargets()
                    )}
                    year={time}
                    rotationPeriod={rotationPeriod}
                    rotation={curRotation}
                />
            </div>
            <div id="world-land" className="rounded-xl bg-[#FDEBDE] col-span-5 row-span-4 p-3
                place-content-center
            ">
                <div class="flex w-full h-full items-center justify-center">
                    <LandPlot content={landContent} bdScore={bdScore} bdCategory={bdCat}/>
                </div>
            </div>
            <div id="world-world-state" className="rounded-xl bg-[#EEEEEE] col-span-3 row-span-6 p-3
                place-content-center
            ">
                <div className='flex flex-col gap-3'>
                    <Funds funds={funds}/>
                    <CO2Scale concentration={airCO2}/>
                    <CarbonDist distribution={envC}/>
                    <EmissionsFossilFuels 
                        getFossilFuelEmission={sim.env.getFossilFuelEmission}
                        setFossilFuelEmission={sim.env.setFossilFuelEmission}
                    />
                    {/* <BdStatus bdScore={bdScore} bdCategory={bdCat}/> */}
                    <PropBar
                        proportions={Object.values(incomeDependency)}
                        colors={Object.values(
                            sim.resources
                        ).map(resource => resource.color)}
                        labels={Object.values(
                            sim.resources
                        ).map(resource => resource.label)}
                    />
                </div>
            </div>
            <div id="world-plan" className="rounded-xl bg-[#D9ECE2] col-span-4 row-span-3
                place-content-center
            ">
                <PlanViewer 
                    rotationPeriod={rotationPeriod} 
                    plan={plan} 
                    year={time}
                    pauseWorld={() => setPauseTrigger(prevVal => 1 - prevVal)}
                />
            </div>
            <div id="world-sales" className="rounded-xl bg-[#FFECFB] col-span-5 row-span-2
                place-content-center
            ">
                <RotationIncomeViewer 
                    targets={rotationIncomeTargets} 
                    income={rotationIncome}
                    rotation={curRotation}
                />
            </div>
            <div id="world-timeline" className="rounded-xl bg-[#F2EAD5] col-span-4 row-span-1 
                place-content-center p-3
            "><Timeline goToTime={sim.goto} triggerPause={pauseTrigger}/></div>
        </div>
    )
}

export default Home