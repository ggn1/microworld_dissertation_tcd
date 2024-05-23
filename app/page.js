'use client'
import { useState } from 'react'
import Simulation from "./classes/Simulation.js"
import Timeline from './components/Timeline.jsx'
import LandPlot from "./components/LandPlot.jsx"
import CO2Scale from "./components/CO2Scale.jsx"
import CarbonDist from "./components/CarbonDist.jsx"
import BdStatus from './components/BdStatus.jsx'

const Home = () => {
    const [sim, setSim] = useState(new Simulation())

    return (
        <main className="h-screen w-full p-5 grid grid-cols-10 grid-rows-9 gap-2">
            <div id="home-targets" className="rounded-xl bg-[#DEEDFF] col-span-3 row-span-3"></div>
            <div id="home-land" className="rounded-xl bg-[#FDEBDE] col-span-4 row-span-8">
                <LandPlot size={sim.env.land.size} content={sim.env.land.content}/>
            </div>
            <div id="home-world-state" className="
                rounded-xl bg-[#EEEEEE] col-span-3 row-span-8 p-5
                flex flex-col justify-between
            ">
                <CO2Scale concentration={sim.env.getAirCO2ppm()}/>
                <CarbonDist distribution={sim.env.carbon}/>
                <BdStatus 
                    bdScore={sim.env.land.biodiversityScore} 
                    bdCategory={sim.env.land.biodiversityCategory}
                />
            </div>
            <div id="home-plan" className="rounded-xl bg-[#D9ECE2] col-span-3 row-span-5"></div>
            <div id="home-timeline" className="rounded-xl bg-[#F2EAD5] col-span-3 row-span-1">
                {/* <Timeline 
                    curTime={5}
                    timeRange={[0, JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)]}
                    unit={"Year"}
                    window={10}
                /> */}
            </div>
            <div id="home-income-dependency" className="
                rounded-xl bg-[#FFECFB] col-span-7 row-span-1
            "></div>
        </main>
    )
}

export default Home