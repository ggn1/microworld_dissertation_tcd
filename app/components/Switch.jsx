"use client"

import { useEffect, useState } from "react"

const Switch = ({isOnStart, onToggle, offColor, onColor}) => {
    /**
     * A togglable switch component.
     * @param isOnStart: Whether or not this switch is in the 
     *                   ON state upon creation.
     * @param onToggle: A function that receives whether or
     *                  not this switch is ON every time it
     *                  changes.
     */

    const [isOn, setIsOn] = useState(isOnStart)

    useEffect(() => {
        setIsOn(isOnStart)
    }, [isOnStart])

    return (
        <div className="w-10 h-6 rounded-full relative" style={{
            backgroundColor: isOn ? onColor : offColor
        }}>
            <div 
                className="absolute h-full w-full flex items-center p-1"
                style={{justifyContent: isOn ? "end" : "start"}}
            >
                <div 
                    className="bg-white rounded-full w-4 h-4 cursor-pointer"
                    onClick={() => {
                        const curVal = isOn
                        setIsOn(!curVal)
                        onToggle(!curVal)
                    }}
                ></div>
            </div>
        </div>
    )
}

export default Switch