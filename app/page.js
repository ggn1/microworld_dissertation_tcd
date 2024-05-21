'use client'

import Simulation from "./classes/Simulation.js"
import Tree from "./classes/Tree.js"
import LandPlot from "./components/LandPlot.jsx"
import { useState } from 'react'

const Home = () => {
    const sim = new Simulation() // Microworld model.

    /***************************** PLAYGROUND ******************************/

    const tree = new Tree(
        [0, 0], "coniferous", 
        sim.env.land.getBiodiversityCategory, 
        sim.env.updateCarbon
    )
    console.log("carbon air (before) =", sim.env.carbon.air.toFixed(5))
    tree.getOlder()
    console.log("carbon air (after) =", sim.env.carbon.air.toFixed(5))

    /***********************************************************************/

    // Here are all factors that will change on the UI.
    const [landContent, setLandContent] = useState(sim.env.land.content) 

    return (
        <main className="h-screen w-full p-5 grid grid-cols-10 grid-rows-9 gap-2">
            <div id="home-targets" className="rounded-xl bg-[#DEEDFF] col-span-3 row-span-3"></div>
            <div id="home-land" className="rounded-xl bg-[#FFE2D5] col-span-4 row-span-8">
                <LandPlot size={sim.env.land.size} content={landContent}/>
            </div>
            <div id="home-world-state" className="rounded-xl bg-[#EEEEEE] col-span-3 row-span-4"></div>
            <div id="home-plan" className="rounded-xl bg-[#D9ECE2] col-span-3 row-span-5"></div>
            <div id="home-income-dependency" className="rounded-xl bg-[#E8DFF6] col-span-3 row-span-5"></div>
            <div id="home-timeline" className="rounded-xl bg-[#F2EAD5] col-span-5 row-span-1"></div>
            <div id="home-play-pause" className="rounded-xl bg-[#F2EAD5] col-span-1 row-span-1"></div>
            <div id="home-reset" className="rounded-xl bg-[#F2EAD5] col-span-1 row-span-1"></div>
        </main>
    )
}

export default Home