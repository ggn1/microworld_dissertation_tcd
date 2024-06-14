'use client'

import * as d3 from "d3"
import { saveAs } from 'file-saver'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Simulation from "../model/Simulation.js"
import Timeline from '../components/Timeline.jsx'
import LandPlot from "../components/LandPlot.jsx"
import CO2Scale from "../components/CO2Scale.jsx"
import CarbonDist from "../components/CarbonDist.jsx"
import PropBar from '../components/PropBar.jsx'
import Targets from '../components/Targets.jsx'
import PlanViewer from '../components/PlanViewer.jsx'
import EmissionsFossilFuels from '../components/EmissionsFossilFuels.jsx'
import IncomeViewer from '../components/IncomeViewer.jsx'

export let sim = null
export let challenge = 0

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

    // Component Visilibility For Challenges
    const [curChallenge, setCurChallenge] = useState(challenge)
    const [showCO2Target, setShowCO2Target] = useState(true)
    const [showIncomeTarget, setShowIncomeTarget] = useState(true)
    const [showCO2Scale, setShowCO2Scale] = useState(true)
    const [showPanelC, setShowPanelC] = useState(true)
    const [showPanelFF, setShowPanelFF] = useState(true)
    const [showIncDepPanel, setShowIncDepPanel] = useState(true)
    const [showIncPanel, setShowIncPanel] = useState(true)
    const [showBiodiversity, setShowBiodiversity] = useState(true)
    const [devMode, setDevMode] = useState(false)

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
         * Function that receives a keypress event,
         * and has different behavior depending on 
         * keys pressed.
         */
        if (e.ctrlKey && e.altKey) {
            switch (e.key) {
                case "0": // Ctrl + Alt + 0 => No Challenge
                    setCurChallenge(0)
                    break
                case "1": // Ctrl + Alt + 1 => Challenge 1
                    setCurChallenge(1)
                    break
                case "2": // Ctrl + Alt + 2 => Challenge 2
                    setCurChallenge(2)
                    break
                case "3": // Ctrl + Alt + 3 => Challenge 3
                    setCurChallenge(3)
                    break
                default:
                    break
            }
        } else {
            if (e.key === "h" || e.key === "H") { // H => Help page.
                router.push('/help')
            }
            else if (e.key === "Escape") { // Esc => Landing page.s
                router.push('/')
            }
        }
    }

    const handleSaveRunData = () => {
        /**
         * Handles the situation when the developer 
         * wants to save simulation run data.
         */
        let dataToSave = sim.getRunData()
        dataToSave = d3.csvFormat(dataToSave)
        const blob = new Blob([dataToSave], { type: 'application/csv' })
        saveAs(blob, "microworld_run_data.csv")
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

    useEffect(() => {
        // console.log(`World configured for challenge ${curChallenge}.`)
        challenge = curChallenge
        if (challenge == 0) { // Full Features
            setShowCO2Target(true)
            setShowCO2Scale(true)
            setShowPanelC(true)
            setShowPanelFF(true)
            setShowIncDepPanel(true)
            setShowBiodiversity(true)
            setShowIncomeTarget(true)
            setShowIncPanel(true)
        } else if (challenge == 1) { // Challenge 1
            setShowCO2Target(false)
            setShowCO2Scale(false)
            setShowPanelC(false)
            setShowPanelFF(false)
            setShowIncDepPanel(false)
            setShowBiodiversity(false)
            setShowIncomeTarget(false)
            setShowIncPanel(true)
        } else if (challenge == 2) { // Challenge 2
            setShowCO2Target(true)
            setShowCO2Scale(true)
            setShowPanelC(false)
            setShowPanelFF(false)
            setShowIncDepPanel(false)
            setShowBiodiversity(false)
            setShowIncomeTarget(false)
            setShowIncPanel(false)
        } else if (challenge == 3) { // Challenge 3
            setShowCO2Target(true)
            setShowCO2Scale(true)
            setShowPanelC(false)
            setShowPanelFF(false)
            setShowIncDepPanel(false)
            setShowBiodiversity(false)
            setShowIncomeTarget(false)
            setShowIncPanel(true)
        }
    }, [curChallenge])
    
    return (
        isInitialized &&
        <div className="w-full p-5 grid grid-cols-12 gap-2">
            <div id="world-targets" className="rounded-xl bg-[#DEEDFF] col-span-4 row-span-2 p-3">
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
                    showCO2={showCO2Target}
                    showIncome={showIncomeTarget}
                />
            </div>
            <div id="world-money" className="rounded-xl bg-[#FFECFB] col-span-8 row-span-2 p-3">
                {showIncPanel ? <IncomeViewer 
                    funds={funds}
                    targets={rotationIncomeTargets} 
                    income={rotationIncome}
                    rotation={curRotation}
                    dependency={incomeDependency}
                    hide={!showIncomeTarget}
                /> : <div className='min-h-32'></div>}
            </div>
            <div id="world-timeline" className="rounded-xl bg-[#F2EAD5] col-span-4 row-span-1 p-3">
                <Timeline 
                    goToTime={sim.goto} 
                    triggerPause={pauseTrigger}
                    handleSaveRunData={devMode ? handleSaveRunData : null}
                />
            </div>
            <div id="world-land" className="rounded-xl bg-[#FDEBDE] col-span-5 row-span-9 p-3">
                <div class="flex w-full h-full items-center justify-center">
                    <LandPlot 
                        content={landContent} bdScore={bdScore} 
                        bdCategory={bdCat} hide={!showBiodiversity}
                    />
                </div>
            </div>
            <div id="world-state" className="rounded-xl bg-[#EEEEEE] col-span-3 row-span-9 p-3">
                <div className='*:mb-3'>
                    {showCO2Scale &&<CO2Scale concentration={airCO2}/>}
                    {showPanelC && <CarbonDist distribution={envC}/>}
                    {showPanelFF && <EmissionsFossilFuels 
                        getFossilFuelEmission={sim.env.getFossilFuelEmission}
                        setFossilFuelEmission={sim.env.setFossilFuelEmission}
                    />}
                    {showIncDepPanel && <PropBar
                        proportions={Object.values(incomeDependency)}
                        colors={Object.values(
                            sim.resources
                        ).map(resource => resource.color)}
                        labels={Object.values(
                            sim.resources
                        ).map(resource => resource.label)}
                    />}
                </div>
            </div>
            <div id="world-plan" className="rounded-xl bg-[#D9ECE2] col-span-4 row-span-8 p-3">
                <PlanViewer 
                    rotationPeriod={rotationPeriod} 
                    plan={plan} 
                    year={time}
                    rotation={curRotation}
                    pauseWorld={() => setPauseTrigger(prevVal => 1 - prevVal)}
                />
            </div>         
        </div>
    )
}

export default Home