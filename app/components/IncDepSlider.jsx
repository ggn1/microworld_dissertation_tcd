"use client"

import { useEffect, useState } from "react"

const IncDepSlider = ({
    value, label, filledColor, disabled,
    onChange, onClick, getValueSetter
}) => {
    /** 
     * Custom range slider component. 
     * 
    */

    const [curVal, setCurVal] = useState(value)
    const [isDisabled, setIsDisabled] = useState(disabled)

    const handleChange = (e) => {
        /**
         * Handles changes in slider curVal.
         * @param e: Change event.
         */
        setCurVal(e.target.value)
        onChange(e.target.value)
    }

    const handleClick = (e) => {
        /**
         * When clicked, the disabled state and the funtion to
         * set it's curVal are passed to the parent.
         */
        onClick(isDisabled, setIsDisabled)
    }

    useEffect(() => {
        getValueSetter(setCurVal)
    })

    return (
        <div 
            className="p-2 rounded-lg bg-[#FFFFFF]"
            style={{ filter: isDisabled ? "brightness(60%)" : "brightness(100%)" }}
        >
            <div className="flex items-center justify-between">
                <div className="font-bold text-[#666666]">{label}</div>
                <div className="font-bold text-[#666666]">{curVal}%</div>
            </div>
            <div className="flex gap-2 w-full h-full items-center">
                {/* Bar */}
                <div className="relative w-full flex items-center rounded-full bg-[#DDDDDD]">
                    <input 
                        type="range" 
                        className="
                            appearance-none w-full rounded-full z-10
                            h-5 bg-transparent opacity-0
                        "
                        min="0" max="100"
                        onChange={handleChange}
                        value={curVal}
                        disabled={isDisabled}
                    />
                    <div 
                        className="
                            absolute h-full bg-yellow-300 rounded-full 
                            z-0 border-4 border-[#DDDDDD]
                        " style={{ 
                            width:`${curVal}%`,
                            backgroundColor: filledColor,
                        }}
                    ></div>
                </div>
                <div 
                    className="h-5 w-5 p-1 border-[#DDDDDD] rounded-full border-4 hover:border-black"
                    style={{backgroundColor: isDisabled ? "#000000" : "#FFFFFF"}}
                    onClick={handleClick}
                ></div>
            </div>
        </div>
    )
}

export default IncDepSlider