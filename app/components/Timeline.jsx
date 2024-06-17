"use client"

import Help from "./Help"
import Button from "./Button"
import { PopUpContext } from '../world/page'
import { getHelpJsxContent } from '../help/page'
import React, { useEffect, useRef, useState } from "react"

const unit = "Year"
const validRange = [0, JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)]
let curTime = validRange[0]
let newTime = validRange[0]
const delay = JSON.parse(process.env.NEXT_PUBLIC_SIMULATION_DELAY)
let interval = null

const Timeline = ({goToTime, triggerPause, handleSaveRunData=null}) => {
    /**
     * Displays a timeline of given time range such that 
     * time is displayed a window at a time. One may 
     * move from one time window to another.
     * @param goToTime: Function that facilitates going to a certain point
     *                  in time w.r.t the simulation.
     * @param triggerPause: A flag that can be changed to 
     *                      trigger pausing of the world.
     * @param handleSaveRunData: A function that can be called to 
     *                           save run data as a CSV file.
     * @return: UI component.
     */

    const helpData = [["heading", "TIME"],["paragraph", "The unit of time in this microworld is Year"], ["paragraph", "The TIMELINE may be used to move to different points in time in the simulation."], ["image", "help/time1.png"], ["paragraph", "Clicking the PLAY BUTTON runs the simulation, and the current year in the microworld is updated with every timestep. The number in the display changes to reflect this. Once clicked, the play button changes to a PAUSE BUTTON. Clicking the pause button pauses the simulation and it changes back into the play button. The RESET BUTTON may be clicked to go back to year 0. The BACK and NEXT buttons can be clicked to go one year before or after."], ["image", "help/time2.png"], ["paragraph", "In the TEXTBOX, you may type in any year within simulation range (0 to 300 years) and the microworld jumps to that point in time. Upon entering some input, the play/pause and reset buttons change to a CONFIRM BUTTON and CANCEL BUTTON as shown above. Clicking the confirm button applies the change to the year and cancel prevents this. If input is invalid (not an integer in the allowed range) then the input box turns red to indicate this and the change will not be applied even upon confirmation."]]

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

    const takeTimeStep = (direction) => {
        /** 
         * Move 1 step forward in time 
         * and trigger changes in the 
         * simulation to reflect this.
         * @param direction: This is the direction in which to 
         *                   take a step. This may be +1 or -1.
         */ 
        if (
            (direction == -1 && curTime > validRange[0]) || 
            (direction == 1 && curTime < validRange[1])
        ) {
            handleChange((curTime+direction).toString())
            handleNewTimeSubmit()
        } else {
            pause()
        }
    }

    const pause = () => {
        /** Pauses the simulation. */
        setIsPaused(true)
        if (interval != null) {
            clearInterval(interval)
            interval = null
        }
    }

    const play = () => {
        /** Plays the simluation. */
        setIsPaused(false)
        interval = setInterval(() => takeTimeStep(1), delay)
    }

    const handlePlayPause = () => {
        /**
         * Play simulation.
         */
        if (isPaused) play() // Is paused, so play.
        else pause() // Is playing, so pause.
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
        pause()
    }

    useEffect(() => {
        inputRef.current.value = curTime
        /** 
         * If the time was changed, then
         * ensure that the world is at this
         * point in time where the user last 
         * left it. 
         */
        if (curTime != validRange[0]) {
            goToTime(curTime)
        }
    }, [])

    useEffect(() => {
        /** Pause the simulation. */
        pause()
    }, [triggerPause])

    return (
        <Help helpData={helpData} page="world">
            <div className="timeline p-2 pt-5 h-full w-full flex gap-3 justify-center items-center">
                {handleSaveRunData != null && <Button
                    bgColor="#FFF8E6" outlineColor="#E4DAC1"
                    onClick={handleSaveRunData}
                >↓DATA</Button>}
                <div className="flex items-center h-full font-bold">
                    {unit.toUpperCase()}:
                </div>
                <Button 
                    bgColor="#FFF8E6" outlineColor="#E4DAC1"
                    onClick={() => takeTimeStep(-1)}
                ><div className="px-[3px] font-bold">{"<"}</div></Button>
                <div>
                    <input type="text" 
                        className="
                            px-3 rounded-full text-[#888888] text-center 
                            max-w-16 focus:text-[#CCCCCC] h-full
                        "
                        onChange={(e) => handleChange(e.target.value)}
                        style={{"border": `${isValid ? 0 : 3}px solid red`}}
                        ref={inputRef}
                    />
                </div>
                <Button 
                    bgColor="#FFF8E6" outlineColor="#E4DAC1"
                    onClick={() => takeTimeStep(1)}
                ><div className="px-[3px] font-bold">{">"}</div></Button>
                {
                    isEditing ? <>
                        
                        {/* Submit Change Button */}
                        <Button 
                            bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                            onClick={handleNewTimeSubmit}
                        >
                            <img className="h-6 w-4 py-1" src="tick.png" />
                        </Button>

                        {/* Cancel Change Button */}
                        <Button 
                            bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                            onClick={handleNewTimeCancel}
                        >
                            <img className="h-6 w-4 py-1" src="cross.png" />
                        </Button>
                    </> : <>
                        {/* Play/Pause Button */}
                        <Button 
                            bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                            onClick={handlePlayPause}
                        >
                            <div className="h-6 w-4 py-0.5 flex items-center">
                                <img 
                                    className="w-full h-auto" 
                                    src={isPaused ? "play.png" : "pause.png"}
                                />
                            </div>
                        </Button>

                        {/* Reset Button */}
                        <Button 
                            bgColor="#FFF8E6" outlineColor="#E4DAC1" 
                            onClick={handleReset}
                        >
                            <div className="h-6 w-4 py-0.5 flex items-center">
                                <img 
                                    className="w-full h-auto" 
                                    src="reset.png"
                                />
                            </div>
                        </Button>
                    </>
                }
            </div>
        </Help>
    )
}

export default Timeline