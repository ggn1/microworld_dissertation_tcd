"use client"

import { useState } from "react"

const TextInput = ({
        sanityCheck, handleVal, maxWidth="50px", unit="", label="",
        placeholder="", textColor="#6e6e6e", borderColor="white", 
        bgColor="white"
    }) => {
    /** 
     * This component is a generic text box. 
     * @param sanityCheck: A function that is used to
     *                     validate the input of this box.
     *                     This function should recieve a string 
     *                     of what the user typed as input and 
     *                     output whether this is considered valid.
     * @param handleVal: A function that receives changes to
     *                the input in this text box. This function
     *                will receive "" if the input was invalid
     *                or blank and the input if it was valid.
     * @param placeholder: Some placeholder text to be displayed in
     *                     the text box when there is no input (optional).
     * @param label: A label for this text box (optional).
     * @param unit: The unit of measurement of value in this field (optional).
     * @param textColor: Color of the text inside the text box.
     * @param borderColor: Colour of the border of the text box.
     */

    const [val, setVal] = useState(placeholder)

    const handleChange = (value) => {
        /** 
         * Handles a change of value in the text field. 
         * @param e: Text input change event handler.
        */
        setVal(value)
        const isValid = sanityCheck(value)
        if (isValid) handleVal(value)
        else handleVal("")
    }

    return (
        <div 
            className="
                w-full px-1.5 gap-2 cursor-default
                items-center rounded-full flex border-4
            "
            style={{
                borderColor: borderColor,
                backgroundColor: bgColor
            }}
        >
            <b>{label}</b>
            <div className="flex flex-1 w-full justify-between gap-2">
                <input
                    className="text-[#6e6e6e]"
                    type="text"
                    onChange={(e) => handleChange(e.target.value)}
                    value={val}
                    placeholder={placeholder}
                    style={{
                        backgroundColor: bgColor,
                        color: textColor, 
                        width: `${val.toString().length+4}ch`,
                        maxWidth: maxWidth
                    }}
                />
                <p style={{color: textColor}}>{unit}</p>
            </div>
        </div>
    )
}

export default TextInput