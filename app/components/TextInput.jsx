"use client"

import { useState } from "react"

const TextInput = ({
        sanityCheck, handleVal, startVal="", 
        refInput=null, placeholder="", label="",
        borderColor="white", textColor="#6e6e6e"
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
     * @param startVal: Starting value (optional).
     * @param placeholder: Some placeholder text to be displayed in
     *                     the text box when there is no input (optional).
     * @param label: A label for this text box (optional).
     */

    const [val, setVal] = useState(startVal)

    const handleChange = (e) => {
        /** 
         * Handles a change of value in the text field. 
         * @param e: Text input change event handler.
        */
        const value = e.target.value
        setVal(value)
        const isValid = sanityCheck(value)
        if (isValid) handleVal(value)
        else handleVal("")
    }

    return (
        <div 
            className="
                w-full bg-white px-2 py-1 flex justify-between 
                items-center rounded-full border-4
            "
            style={{
                borderColor: borderColor,
                color: textColor
            }}
        >
            <label className="font-bold mr-2">{label}</label>
            <input
                className="min-w-0 flex-1 text-[#6e6e6e]"
                type="text" ref={refInput} 
                onChange={handleChange}
                value={val}
                placeholder={placeholder}
            />
        </div>
    )
}

export default TextInput