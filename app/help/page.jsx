"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Help = () => {
    const router = useRouter()

    const detectKeyDown = (e) => {
        /** 
         * Function that receives a keypress event.
         */
        if (e.key === "w" || e.key === "W") router.push('/world')
        else if (e.key === "Escape") router.push('/')
    }

    useEffect(() => {
        document.addEventListener('keydown', detectKeyDown, true)
    }, [])

    return (
        <div>
            HELP PAGE
        </div>
    )
}

export default Help