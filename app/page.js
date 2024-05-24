'use client'

import { useEffect, useState } from 'react'
import Simulation from "./classes/Simulation.js"
import Timeline from './components/Timeline.jsx'
import LandPlot from "./components/LandPlot.jsx"
import CO2Scale from "./components/CO2Scale.jsx"
import CarbonDist from "./components/CarbonDist.jsx"
import BdStatus from './components/BdStatus.jsx'

let sim = null

const Home = () => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [landContent, setLandContent] = useState([])
    const [airCO2, setAirCO2] = useState(0)
    const [envC, setEnvC] = useState({})
    const [bdScore, setBdScore] = useState(0)
    const [bdCat, setBdCat] = useState("")

    const updateSimUI = () => {
        setLandContent([...sim.env.land.content])
        setAirCO2(sim.env.getAirCO2ppm())
        setEnvC({...sim.env.carbon})
        setBdScore(sim.env.land.biodiversityScore)
        setBdCat(sim.env.land.biodiversityCategory)
    }

    useEffect(() => {
        sim = new Simulation(updateSimUI)
        updateSimUI()
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        console.log("land content changed")
    }, [landContent])

    return (
        isInitialized &&
        <main className="h-screen w-full p-5 grid grid-cols-10 grid-rows-9 gap-2">
            <div id="home-targets" className="rounded-xl bg-[#DEEDFF] col-span-3 row-span-3"></div>
            <div id="home-land" className="rounded-xl bg-[#FDEBDE] col-span-4 row-span-8">
                <LandPlot content={landContent}/>
            </div>
            <div id="home-world-state" className="
                rounded-xl bg-[#EEEEEE] col-span-3 row-span-8 p-5
                flex flex-col justify-between
            ">
                <CO2Scale concentration={airCO2}/>
                <CarbonDist distribution={envC}/>
                <BdStatus bdScore={bdScore} bdCategory={bdCat}/>
            </div>
            <div id="home-plan" className="rounded-xl bg-[#D9ECE2] col-span-3 row-span-5"></div>
            <div id="home-timeline" className="rounded-xl bg-[#F2EAD5] col-span-3 row-span-1">
                <Timeline goToTime={sim.goto}/>
            </div>
            <div id="home-sold" className="
                rounded-xl bg-[#FFECFB] col-span-4 row-span-1
            "></div>
            <div id="home-income-dependency" className="
                rounded-xl bg-[#F4ECFF] col-span-3 row-span-1
            "></div>
        </main>
    )
}

export default Home