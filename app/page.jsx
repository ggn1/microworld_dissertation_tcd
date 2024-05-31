'use client'

import { useEffect, useState, useRef } from 'react'
import Simulation from "./classes/Simulation.js"
import Timeline from './components/Timeline.jsx'
import LandPlot from "./components/LandPlot.jsx"
import CO2Scale from "./components/CO2Scale.jsx"
import CarbonDist from "./components/CarbonDist.jsx"
import BdStatus from './components/BdStatus.jsx'
import IncDepBar from './components/IncDepBar.jsx'
import Targets from './components/Targets.jsx'
import PlanViewer from './components/PlanViewer.jsx'

export let sim = null

const Home = () => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [landContent, setLandContent] = useState([])
    const [airCO2, setAirCO2] = useState(0)
    const [envC, setEnvC] = useState({})
    const [bdScore, setBdScore] = useState(0)
    const [bdCat, setBdCat] = useState("")
    const [incomeSources, setIncomeSources] = useState({})
    const [rotationPeriod, setRotationPeriod] = useState()

    const updateSimUI = () => {
        setLandContent([...sim.env.land.content])
        setAirCO2(sim.env.getAirCO2ppm())
        setEnvC({...sim.env.carbon})
        setBdScore(sim.env.land.biodiversityScore)
        setBdCat(sim.env.land.biodiversityCategory)
        setIncomeSources({...sim.planner.incomeSources})
        setRotationPeriod(sim.planner.rotationPeriod)
    }

    useEffect(() => {
        if (sim == null) {
            sim = new Simulation(updateSimUI)
        } else {
            sim.updateSimUI = updateSimUI
        }
        updateSimUI()
        setIsInitialized(true)
    }, [])
    
    return (
        isInitialized &&
        <main className="w-full p-5 grid grid-cols-10 grid-rows-9 gap-2">
            <div id="home-targets" className="rounded-xl bg-[#DEEDFF] col-span-3 row-span-3">
                <Targets 
                    setTargets={sim.planner.setTargets} 
                    getCO2={sim.env.getAirCO2ppm}
                    getIncome={sim.getIncome}
                    startValCO2={sim.planner.getTargets().co2}
                    startValIncome={sim.planner.getTargets().income}
                />
            </div>
            <div id="home-land" className="
                rounded-xl bg-[#FDEBDE] col-span-4 row-span-7 p-3
            ">
                <div class="flex w-full h-full items-center justify-center">
                    <LandPlot content={landContent}/>
                </div>
            </div>
            <div id="home-world-state" className="
                rounded-xl bg-[#EEEEEE] col-span-3 row-span-9 p-5
                flex flex-col gap-5
            ">
                <CO2Scale concentration={airCO2}/>
                <CarbonDist distribution={envC}/>
                <BdStatus bdScore={bdScore} bdCategory={bdCat}/>
                <IncDepBar
                    proportions={Object.values(
                        incomeSources
                    ).map(source => source.dependency)}
                    colors={Object.values(
                        incomeSources
                    ).map(source => "#" + source.color)}
                    labels={Object.values(
                        incomeSources
                    ).map(source => source.label)}
                />
            </div>
            <div id="home-plan" className="rounded-xl bg-[#D9ECE2] col-span-3 row-span-5">
                <PlanViewer rotationPeriod={rotationPeriod} />
            </div>
            <div id="home-sold" className="
                rounded-xl bg-[#FFECFB] col-span-4 row-span-2
            "></div>
            <div id="home-timeline" className="rounded-xl bg-[#F2EAD5] col-span-3 row-span-1">
                <Timeline goToTime={sim.goto}/>
            </div>
        </main>
    )
}

export default Home