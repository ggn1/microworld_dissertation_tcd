"use client"

import Fade from './components/Fade'
import { Tooltip } from 'react-tooltip'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

let dialogueInProgress = false
let introTaken = false

const LandingPage = () => {
    
    const [started, setStarted] = useState(false)
    const [contentIdx, setContentIdx] = useState(0)
    const [dialogue, setDialogue] = useState("")
    const [dialogueTrigger, setDialogueTrigger] = useState(true)

    const contentList = [
        <div key="dialogue_1">Hi</div>,
        <div key="dialogue_2">I&apos;ve been expecting you.</div>,
        <div key="dialogue_3">You&apos;ve chosen well.</div>,
        <div key="dialogue_4">They say it&apos;s been here for at least 200 years.</div>,
        <div key="dialogue_5">The forest is healthy and fairly large.</div>,
        <div key="dialogue_6">I&apos;d say it&apos;s a good size for first time forest owners like yourself.</div>,
        <div key="dialogue_7">Your forest offers ample wood. A very valuable resource.</div>,
        <div key="dialogue_8">I&apos;m sorry to hear about global warming and rapid climate change on Earth.</div>,
        <div key="dialogue_9">But it&apos;s not a bother here; your forest regulates the carbon cycle.</div>,
        <div key="dialogue_10">As your adviser, I&apos;ve arranged for help. An interactive map will manifest when you press &quot;H&quot; on your keyboard. It&apos;ll walk you through the lay of the land and all what you can do here.</div>,
        <div key="dialogue_11" className='flex gap-1'>Help will also appear upon clicking the &quot;?&quot; symbol whenever available.</div>,
        <div key="dialogue_12">When you&apos;re ready, just press &quot;W&quot; to delve into the world.</div>,
        <div key="dialogue_13">Press &quot;Escape&quot; to return to this page.</div>,
        <div key="dialogue_14">Explore away!</div>
    ]

    const router = useRouter()

    const detectKeyDown = (e) => {
        /** 
         * Function that receives a keypress event.
         */
        console.log("dialogueInProgress =", dialogueInProgress)
        const notDoneYet = <Fade>Your enthusiasm is much appreciated, but I&apos;m not done yet. Please continue clicking. I promise this won&apos;t take long.</Fade>
        if (e.key === "Enter") {
            if (dialogueInProgress) setDialogue(notDoneYet)
            else setStarted(prevVal => !prevVal)
        }
        else if (e.key === "w" || e.key === "W") {
            if (dialogueInProgress && !introTaken) setDialogue(notDoneYet)
            else router.push('/world')
        }
        else if (e.key === "h" || e.key === "H") {
            if (dialogueInProgress && !introTaken) setDialogue(notDoneYet)
            else router.push('/help')
        }
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
        if (contentIdx > 0 && contentIdx < (contentList.length-1)) {
            dialogueInProgress = true
        } else {
            dialogueInProgress = false
            if (contentIdx == contentList.length-1) introTaken = true
        }
        setTimeout(() => {
            setDialogue(contentList[contentIdx])
        }, 1000)
    }, [dialogueTrigger])

    return (
        <main className="h-screen w-screen pt-5 pb-12 bg-[#121212]">
            {/* Light */}
            {!started && <div className="light z-10"></div>}
            {/* Instruction */}
            {!started && <div className="
                text-xs text-[#666666] select-none 
                itallic font-bold tracking-[0.5em] flex justify-center
            ">
                PRESS ENTER
            </div>}
            {/* Main Content */}
            <div className="flex flex-col justify-center items-center w-full h-full">
                {/* Title */}
                {!started && <img src="tree.png" className='w-32'/>}
                <div>
                    <div 
                        className="select-none text-[32px] breathing my-3"
                        style={{color: started ? "#FFFFFF" : "#121212"}}
                    >mycroforest </div>
                </div>
                {/* Dialogue */}
                <div 
                    className='flex justify-center items-center text-[20px] select-none w-2/4'
                    style={{height: started ? "100%" : "0%"}}
                >
                    {started && 
                        <Fade trigger={dialogueTrigger}>
                            <div className='text-[25px] *:text-[#888888] *:hover:brightness-150 *:text-center' onClick={updateContentIdx}>
                                {dialogue}
                                {!introTaken && contentIdx == 0 && <>
                                    <div className='animate-bounce'>↑</div>
                                    <div className='text=[#666666] text-sm font-bold animate-pulse -mt-3'>CLICK</div>
                                </>}
                            </div>
                        </Fade>
                    }
                    {contentIdx == contentList.length - 1 && 
                        <div className='absolute h-full w-full flex justify-center items-center brightness-50 pt-20 z-0'>
                            <Fade trigger={contentIdx == contentList.length - 1}>
                                <img src="reset.png" className='h-5 invert w-auto hover:scale-150' onClick={() => setContentIdx(0)}/>
                            </Fade>
                        </div>
                    }
                </div>
                {/* Navigation*/}
                <div 
                    className="my-5 select-none flex justify-center w-full z-10" 
                    style={{opacity: started ? "100%" : "0%"}}
                >
                    { started && <div className="select-none flex gap-10 justify-center w-full">
                        <a
                            className="select-none"
                            data-tooltip-id="tooltip-keypress-h"
                            data-tooltip-content="Press H"
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
                            data-tooltip-content="Press W"
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
                text-[#666666] italic tracking-[0.5em] 
                flex justify-center text-xs
                select-none
            ">
                ECONOMICALLY VIABLE CLIMATE AWARE FOREST MANAGEMENT
            </div>
        </main>
    )
}

export default LandingPage