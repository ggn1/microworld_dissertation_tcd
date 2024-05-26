"use client"

import Button from "./Button"
import React, { useEffect, useRef, useState } from "react"

const unit = "Year"
const validRange = [0, JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)]
let curTime = validRange[0]
let newTime = validRange[0]
const delay = JSON.parse(process.env.NEXT_PUBLIC_SIMULATION_DELAY)
let interval = null

const Timeline = ({goToTime}) => {
    /**
     * Displays a timeline of given time range such that 
     * time is displayed a window at a time. One may 
     * move from one time window to another.
     * @param goToTime: Function that facilitates going to a certain point
     *                  in time w.r.t the simulation.
     * @return: UI component.
     */

    const [isEditing, setIsEditing] = useState(false)
    const [isValid, setIsValid] = useState(true)
    const [isPaused, setIsPaused] = useState(true)

    const inputRef = useRef()

    const validateInput = (text) => {
        /**
         * Checks if input text has numbers only.
         * Here, input is valid, only if it is an integer
         * within the given inclusive range.
         * @param text: Input text as string.
         * @return: The input text as a number if it is valid and 
         *          null otherwise.
         */
        if (
            !isNaN(text) && !text.includes(".") &&
            Number.parseInt(text) >= validRange[0] &&
            Number.parseInt(text) <= validRange[1]
        ) {
            // If input is valid, then returns 
            // the input as a number.
            return Number.parseInt(text)
        } else {
            // If input is invalid, then returns null.
            return null
        }
    }

    const handleChange = (timeText) => {
        /** 
         * Handles the event wherein the user changes
         * contents of the time input field.
         * @param timeText: Text box content as string.
         */
        setIsEditing(true)
        let timeValidated = validateInput(
            timeText == "" ? 
            curTime.toString() :
            timeText
        )
        if (timeValidated != null) {
            // isValid = true
            setIsValid(true)
            newTime = timeValidated
        }
        else {
            // isValid = false
            setIsValid(false)
            newTime = curTime
        }
    }

    const handleNewTimeSubmit = () => {
        /**
         * Set current time to new time only if
         * new time is valid.
         */
        if (newTime != curTime) {
            curTime = newTime
            goToTime(curTime)
        }
        setIsValid(true)
        inputRef.current.value = curTime
        setIsEditing(false)
    }

    const handleNewTimeCancel = () => {
        /**
         * Cancel current time input change.
         */
        setIsValid(true)
        inputRef.current.value = curTime
        setIsEditing(false)
    }

    const takeTimeStep = () => {
        /** 
         * Move 1 step forward in time 
         * and trigger changes in the 
         * simulation to reflect this.
         */ 
        if (curTime <= validRange[1]) {
            handleChange((curTime+1).toString())
            handleNewTimeSubmit()
        } else {
            if (interval != null) {
                clearInterval(interval)
                interval = null
            }
        }
    }

    const handlePlayPause = () => {
        /**
         * Play simulation.
         */
        setIsPaused(prevVal => !prevVal)
        if (isPaused) {
            console.log("Playing ...")
            interval = setInterval(takeTimeStep, delay)
        } else { // Is playing, so pause.
            console.log("Paused.")
            if (interval != null) {
                clearInterval(interval)
                interval = null
            }
        }
    }

    const handleReset = () => {
        /**
         * Reset simulation.
         */
        console.log("Reset")
        curTime = validRange[0]
        newTime = validRange[0]
        inputRef.current.value = curTime
        goToTime(curTime)
    }

    useEffect(() => {
        inputRef.current.value = curTime
    }, [])

    return (
        <div className="timeline p-2 flex gap-3 justify-center h-full">
            <div className="flex items-center h-full font-bold">
                {unit.toUpperCase()}:
            </div>
            <input type="text" 
                className="
                    px-3 rounded-full text-[#888888] text-center 
                    max-w-16 focus:text-[#CCCCCC]
                "
                onChange={(e) => handleChange(e.target.value)}
                style={{"border": `${isValid ? 0 : 3}px solid red`}}
                ref={inputRef}
            />
            {
                isEditing ? <>
                    
                    {/* Submit Change Button */}
                    <Button 
                        bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                        onClick={handleNewTimeSubmit}
                    >
                        <div className="px-[5px]">
                            <img className="h-4" src="tick.png" />
                        </div>
                    </Button>

                    {/* Cancel Change Button */}
                    <Button 
                        bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                        onClick={handleNewTimeCancel}
                    >
                        <div className="px-[5px]">
                            <img className="h-4" src="cross.png" />
                        </div>
                    </Button>
                </> : <>
                    {/* Play/Pause Button */}
                    <Button 
                        bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                        onClick={handlePlayPause}
                    >
                        <div className="px-[7px]">
                            <img className="h-3" src={isPaused ? "play.png" : "pause.png"}/>
                        </div>
                    </Button>

                    {/* Reset Button */}
                    <Button 
                        bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                        onClick={handleReset}
                    >
                        <div className="px-[5px]">
                            <img className="h-4" src="reset.png" />
                        </div>
                    </Button>
                </>
            }
            
        </div>
    )
}

export default Timeline