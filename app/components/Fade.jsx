"use client"

import { useState, useEffect } from "react"

const Fade = ({children, trigger}) => {
    /**
     * A componet that child components can be 
     * wrapped within to allow it to fade in and
     * fade out.
     * @param trigger: Set value to 1 - trigger to toggle
     *                 between fade in and fade out.
     */

    const [fadeClass, setFadeClass] = useState("fade-out")

    useEffect(() => {
        setTimeout(() => {
            setFadeClass("fade-out")
        }, 0)
        setTimeout(() => {
            setFadeClass("fade-in")
        }, 1100)
    }, [trigger])

    return (
        <div className={fadeClass}>
            {children}
        </div>
    )
}

export default Fade