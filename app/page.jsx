"use client"

import Link from "next/link"
import { Tooltip } from 'react-tooltip'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

const LandingPage = () => {

    const [started, setStarted] = useState(false)
    const [dialogue, setDialogue] = ""

    const router = useRouter()

    const detectKeyDown = (e) => {
        /** 
         * Function that receives a keypress event.
         */
        if (e.key === "w" || e.key === "W") router.push('/walkthrough')
        else if (e.key === "h" || e.key === "H") router.push('/home')
    }

    useEffect(() => {
        var pos = document.documentElement;
        pos.addEventListener('mousemove', e => {
            pos.style.setProperty('--x', e.clientX + "px")
            pos.style.setProperty('--y', e.clientY + "px")
        })
        document.addEventListener('keydown', detectKeyDown, true)
    }, [])

    return (
        <main className="
            h-screen w-screen p-10 bg-[#121212]
        " onClick={() => setStarted(prevVal => !prevVal)}>
            {!started && <div className="light z-10"></div>}
            <div className="flex flex-col justify-center items-center w-full h-full">
                <div className="select-none text-[32px] font-bold cursor-default breathing mb-3">
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>m</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>i</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>c</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>r</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>o</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>f</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>o</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>r</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>e</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>s</span>
                    <span style={{color: started ? "#FFFFFF" : "#121212"}}>t</span>
                </div>
                <div 
                    className="text-white text-[20px]"
                    style={{height: started ? "100%" : "0%"}}
                >{dialogue}
                </div>
                <div 
                    className="my-5 select-none flex justify-center w-full" 
                    style={{opacity: started ? "100%" : "0%"}}
                >
                    { started && <div className="flex gap-5 justify-center w-full">
                        <a
                            data-tooltip-id="tooltip-keypress-w"
                            data-tooltip-content="Press Key W"
                            data-tooltip-place="top"
                        >
                            <b className="hover:brightness-200 text-green-800 select-none">
                                WALKTHROUGH
                            </b>
                            <Tooltip id="tooltip-keypress-w"/>
                        </a>
                        <a
                            data-tooltip-id="tooltip-keypress-h"
                            data-tooltip-content="Press Key H"
                            data-tooltip-place="top"
                        >
                            <b className="hover:brightness-150 text-blue-900 select-none">
                                HOME
                            </b>
                            <Tooltip id="tooltip-keypress-h"/>
                        </a> 
                    </div>}
                </div>
            </div>
            <div className="
                text-[#555555] italic tracking-[0.5em] 
                flex justify-center
            ">
                ECONOMICALLY FEASIBLE CLIMATE AWARE FOREST MANAGEMENT
            </div>
        </main>
    )
}

export default LandingPage