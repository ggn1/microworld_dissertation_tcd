"use client"

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
        if (e.key === "w" || e.key === "W") router.push('/world')
        else if (e.key === "h" || e.key === "H") router.push('/help')
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
        <main 
            className="h-screen w-screen pt-5 pb-12 bg-[#121212]" 
            onDoubleClick={() => setStarted(prevVal => !prevVal)}
        >
            {/* Light */}
            {!started && <div className="light z-10"></div>}
            {!started && <div className="
                text-xs text-[#222222] select-none 
                itallic font-bold tracking-[0.5em] flex justify-center
            ">
                DOUBLE CLICK
            </div>}
            <div className="flex flex-col justify-center items-center w-full h-full">
                {/* Title */}
                <div 
                    className="select-none text-[32px] breathing my-3"
                    style={{color: started ? "#FFFFFF" : "#121212"}}
                > mycro forest </div>
                {/* Dialogue */}
                <div 
                    className="text-white text-[20px] select-none"
                    style={{height: started ? "100%" : "0%"}}
                >{dialogue}
                </div>
                {/* Navigation*/}
                <div 
                    className="my-5 select-none flex justify-center w-full" 
                    style={{opacity: started ? "100%" : "0%"}}
                >
                    { started && <div className="select-none flex gap-10 justify-center w-full">
                        <a
                            className="select-none"
                            data-tooltip-id="tooltip-keypress-h"
                            data-tooltip-content="Press Key H"
                            data-tooltip-place="top"
                        >
                            <b className="hover:brightness-200 text-green-800 select-none">
                                HELP
                            </b>
                            <Tooltip id="tooltip-keypress-h"/>
                        </a>
                        <a
                            className="select-none"
                            data-tooltip-id="tooltip-keypress-w"
                            data-tooltip-content="Press Key W"
                            data-tooltip-place="top"
                        >
                            <b className="hover:brightness-150 text-blue-900 select-none">
                                WORLD
                            </b>
                            <Tooltip id="tooltip-keypress-w"/>
                        </a> 
                    </div>}
                </div>
            </div>
            {/* Subtitle */}
            <div className="
                text-[#555555] italic tracking-[0.5em] 
                flex justify-center text-xs
                select-none
            ">
                ECONOMICALLY FEASIBLE CLIMATE AWARE FOREST MANAGEMENT
            </div>
        </main>
    )
}

export default LandingPage