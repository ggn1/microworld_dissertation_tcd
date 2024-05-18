import Simulation from "./classes/Simulation.js"
import Tree from "./classes/Tree.js"

const Home = () => {
    
    const simulation = new Simulation()
    // const tree = new Tree([0, 0], "coniferous")
   
    return (
        <main className="
            h-screen w-full p-5 
            grid grid-cols-10 grid-rows-9 gap-2
        ">
            <div id="home-targets" className="
                rounded-xl bg-slate-200 col-span-3 row-span-3
            "></div>
            <div id="home-land" className="
                rounded-xl bg-slate-200 col-span-4 row-span-8
            "></div>
            <div id="home-world-state" className="
                rounded-xl bg-slate-200 col-span-3 row-span-4
            "></div>
            <div id="home-plan" className="
                rounded-xl bg-slate-200 col-span-3 row-span-5
            "></div>
            <div id="home-income-dependency" className="
                rounded-xl bg-slate-200 col-span-3 row-span-5
            "></div>
            <div id="home-timeline" className="
                rounded-xl bg-slate-200 col-span-5 row-span-1
            "></div>
            <div id="home-play-pause" className="
                rounded-xl bg-slate-200 col-span-1 row-span-1
            "></div>
            <div id="home-reset" className="
                rounded-xl bg-slate-200 col-span-1 row-span-1
            "></div>
        </main>
    )
}

export default Home