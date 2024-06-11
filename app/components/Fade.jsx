"use client"

import { useState, useEffect } from "react"

const Fade = ({children, trigger}) => {

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