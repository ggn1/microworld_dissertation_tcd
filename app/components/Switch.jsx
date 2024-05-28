"use client"

import { useEffect, useState } from "react"

const Switch = ({isOnStart, onToggle}) => {
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
        /** 
         * Pass updated switch value to onToggle function
         * every time the state of the switch changes. 
         */
        onToggle(isOn)
    }, [isOn])

    return (
        <div className="w-10 h-6 rounded-full relative" style={{
            backgroundColor: isOn ? "#32BE51" : "#CCCCCC"
        }}>
            <div 
                className="absolute h-full w-full flex items-center p-1"
                style={{justifyContent: isOn ? "end" : "start"}}
            >
                <div 
                    className="bg-white rounded-full w-4 h-4 cursor-pointer"
                    onClick={() => setIsOn(prevVal => !prevVal)}
                ></div>
            </div>
        </div>
    )
}

export default Switch