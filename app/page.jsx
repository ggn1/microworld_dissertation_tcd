"use client"

import Fade from './components/Fade'
import { Tooltip } from 'react-tooltip'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

const LandingPage = () => {
    
    const [started, setStarted] = useState(false)
    const [contentIdx, setContentIdx] = useState(0)
    const [dialogue, setDialogue] = useState("")
    const [dialogueTrigger, setDialogueTrigger] = useState(true)

    const contentList = [
        <div>Hi</div>,
        <div>I've been expecting you.</div>,
        <div>You've chosen well.</div>,
        <div>They say it's been here for at least 500 years.</div>,
        <div>The forest is healthy and fairly large.</div>,
        <div>I'd say it's a good size for first time forest owners like yourself.</div>,
        <div>Your forest offers a wealth of resources like timber, honey, mushrooms, and berries. You could also build infrastructure that enables recreational activities and entertain visitors.</div>,
        <div>I'm sorry to hear about global warming and rapid climate change on Earth.</div>,
        <div>But it's not a bother here; your forest regulates the carbon cycle.</div>,
        <div>As your mysterious adviser, I've arranged for an interactive map that you can access by pressing the key "H" for "Help" on the keyboard. It'll walk you through the lay of the land and all what you can do.</div>,
        <div>Once you're ready, just press the key "W" for "World" to delve right in.</div>,
        <div>Explore away!</div>
    ]

    const router = useRouter()

    const detectKeyDown = (e) => {
        /** 
         * Function that receives a keypress event.
         */
        if (e.key === "w" || e.key === "W") router.push('/world')
        else if (e.key === "h" || e.key === "H") router.push('/help')
    }

    const updateContentIdx = () => {
        /**
         * Moves to next content chunk.
         */
        let newContentIdx = contentIdx + 1
        if (newContentIdx >= contentList.length) {
            newContentIdx = contentList.length - 1
        }
        setContentIdx(newContentIdx)
    }

    useEffect(() => {
        var pos = document.documentElement;
        pos.addEventListener('mousemove', e => {
            pos.style.setProperty('--x', e.clientX + "px")
            pos.style.setProperty('--y', e.clientY + "px")
        })
        document.addEventListener('keydown', detectKeyDown, true)
    }, [])

    useEffect(() => {
        !started && setContentIdx(0)
    }, [started])

    useEffect(() => {
        setDialogueTrigger(prevVal => 1 - prevVal)
    }, [contentIdx])

    useEffect(() => {
        console.log()
        setTimeout(() => {
            setDialogue(contentList[contentIdx])
        }, 1000)
    }, [dialogueTrigger])

    return (
        <main 
            className="h-screen w-screen pt-5 pb-12 bg-[#121212]" 
            onDoubleClick={() => {
                setStarted(prevVal => !prevVal)
            }}
        >
            {/* Light */}
            {!started && <div className="light z-10"></div>}
            {/* Instruction */}
            {!started && <div className="
                text-xs text-[#222222] select-none 
                itallic font-bold tracking-[0.5em] flex justify-center
            ">
                DOUBLE CLICK
            </div>}
            {/* Main Content */}
            <div className="flex flex-col justify-center items-center w-full h-full">
                {/* Title */}
                <div 
                    className="select-none text-[32px] breathing my-3"
                    style={{color: started ? "#FFFFFF" : "#121212"}}
                > mycroforest </div>
                {/* Dialogue */}
                <div 
                    className='flex justify-center items-center text-[20px] select-none w-2/4'
                    style={{height: started ? "100%" : "0%"}}
                >
                    {started && 
                        <Fade trigger={dialogueTrigger}>
                            <div className='text-[25px] *:text-[#888888] *:hover:brightness-150 *:text-center' onClick={updateContentIdx}>{dialogue}</div>
                        </Fade>
                    }
                    {contentIdx == contentList.length - 1 && 
                        <div className='absolute h-full w-full flex justify-center items-center brightness-50 pt-20'>
                            <Fade trigger={contentIdx == contentList.length - 1}>
                                <img src="reset.png" className='h-5 invert w-auto hover:scale-125' onClick={() => setContentIdx(0)}/>
                            </Fade>
                        </div>
                    }
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