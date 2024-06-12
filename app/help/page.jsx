"use client"

import { useEffect, useState } from 'react'
import PopUp from '../components/PopUp'
import { useRouter } from 'next/navigation'
import GraphUserGuide from '../components/GraphUserGuide'

const Help = () => {
    const router = useRouter()
    const [popUpContent, setPopUpContent] = useState("")

    const detectKeyDown = (e) => {
        /** 
         * Function that receives a keypress event.
         */
        if (e.key === "w" || e.key === "W") router.push('/world')
        else if (e.key === "Escape") router.push('/')
    }

    const handleTopicSelection = (data) => {
        /**
         * Handles user guide data related to the
         * node that the user has selected.
         * @param data: Name and content of selected node.
         */
        // setPopUpContent(data)
        let toRender = []
        for (const d of data) {
            if (d[0] == "heading") {
                toRender.push(
                    <div className='font-bold text-2xl text-center'>
                        {d[1]}
                    </div>
                )
            } else if (d[0] == "paragraph") {
                toRender.push(
                    <div>
                        {d[1]}
                    </div>
                )
            } else if (d[0] == "image") {
                toRender.push(
                    <div className='flex items-center justify-center'>
                        <img src={d[1]} className='max-h-64 max-w-full'/>
                    </div>
                )   
            } else if (d[0] == "table") {
                toRender.push(
                    <div className='flex items-center justify-center'>
                        {d[1]}
                    </div>
                )   
            }
        }
        setPopUpContent(toRender)
    }

    const handlePopUpClose = () => {
        /**
         * Handles the event when a use wants to close the popup.
         */
        setPopUpContent("")
    }

    useEffect(() => {
        document.addEventListener('keydown', detectKeyDown, true)
    }, [])

    return (
        <main className='w-screen h-screen relative bg-[#dcedf2]'>
            <div className='w-full h-full absolute'>
                <GraphUserGuide handleTopicSelection={handleTopicSelection}/>
            </div>
            {popUpContent != "" && 
                <PopUp handleClose={handlePopUpClose}>
                    {popUpContent}
                </PopUp>
            }
        </main>
    )
}

export default Help