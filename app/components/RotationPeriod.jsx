import TextInput from "./TextInput"
import { useEffect, useState } from 'react'

const RotationPeriod = ({setRotationPeriod, curRotationPeriod, validRange}) => {
    /** 
     * Component that displays the rotation period while
     * also allowing the user to set it.
     * @param setRotationPeriod: A function that sets the rotation
     *                           period in the simulation.
     * @param curRotationPeriod: Latest rotation period value.
     * @param validRange: The acceptable inclusive 
     *                    [min, max] range of rotation periods.
     */

    const colorBad = "#F44A4A"
    const colorDefault = "#232323"
    const placeholder = 40
    const [textColorRotation, setTextColorRotation] = useState(colorDefault)

    const sanityCheckInt = (val) => {
        /** 
         * Here, input is considered valid only if
         * it is a positive number (integer) >= 1 and 
         * <= max no. of years.
         * @param val: Input as a string.
         * @return: True if the input was deemed valid and
         *          false otherwise.
        */

        // Parse the string to a number
        const num = parseInt(val);
    
        // Check if the parsed number is a positive 
        // number >= 1 and not NaN.
        return !isNaN(num) && num >= validRange[0] && num <= validRange[1]
    }

    const handleChange = (val) => {
        /** 
         * Updates rotation period based on new value 
         * received for the same.
         * @param val: New rotation period value as a string. 
         *             It is "" if either the value was 
         *             invalid or empty.
         */
        
        if (val == "") { // Invalid / empty value.
            setTextColorRotation(colorBad)
            val = placeholder
        } else { // Valid value.
            setTextColorRotation(colorDefault)
            val = parseInt(val)
        }
        setRotationPeriod(val)
    }

    useEffect(() => {
        handleChange(curRotationPeriod)
    }, [])

    return (
        <div>
            <TextInput 
                label="ROTATION PERIOD :"
                placeholder="40"
                unit="year(s)"
                textColor={textColorRotation}
                sanityCheck={sanityCheckInt} 
                handleVal={handleChange}
            />
        </div>
    )
}

export default RotationPeriod