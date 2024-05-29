"use client"

import { useEffect, useState } from "react"

const TextInput = ({
        sanityCheck, handleVal, unit="", startVal="", label="",
        placeholder="", textColor="#6e6e6e", borderColor="white", 
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
     * @param unit: The unit of measurement of value in this field (optional).
     * @param textColor: Color of the text inside the text box.
     * @param borderColor: Colour of the border of the text box.
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

    useEffect(() => {
        console.log()
    }, [val])

    return (
        <div 
            className="
                w-full bg-white px-2 py-1justify-between 
                items-center rounded-full flex border-4
            "
            style={{borderColor: borderColor}}
        >
            <label className="font-bold mr-2">{label}</label>
            <input
                className="text-[#6e6e6e]"
                type="text"
                onChange={handleChange}
                value={val}
                placeholder={placeholder}
                style={{color: textColor, width: `${val.toString().length+2}ch`}}
            />
            <label className="ml-2" style={{color: textColor}}>{unit}</label>
        </div>
    )
}

export default TextInput