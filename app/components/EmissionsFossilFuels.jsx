"use client"

import Big from 'big.js'
import Help from './Help'
import { useState, useEffect, useRef } from 'react'
import TextInput from './TextInput'

const EmissionsFossilFuels = ({getFossilFuelEmission, setFossilFuelEmission}) => {
    /**
     * Component that allows annual carbon released from
     * fossil fuels to be set.
     * @param getFossilFuelEmission: Function that returns the 
     *                               current fossil fuel use related
     *                               carbon emission rate.
     * @param setFossilFuelEmission: Sets current amount of C released
     *                               into the air due to use of fossil fuels.
     */

    const helpData = [["heading", "FOSSIL FUEL EMISSIONS"], ["paragraph", "In 2023, 36.8 GtCO2 which is about 10 GtC was released into the atmosphere due to fossil fuel usage."], ["paragraph", "By, default, annual emissions due to fossil fuel use is set to 0 GtC. This can be changed by typing any positive whole number into the textbox as shown below."], ["image", "help/fossil_fuel_usage1.png"]]

    const colorDefault = "#888888"
    const colorBad = "#F44A4A"

    const [emissionRate, setEmissionRate] = useState(
        getFossilFuelEmission().div("1e+15").toNumber()
    )
    const [isValid, setIsValid] = useState(true)

    const refInput = useRef()

    const sanityCheckNumeric = (val) => {
        /** 
         * Here, input is considered valid only if
         * it is a positive number (integer / floating point number).
         * @param val: Input as a string.
         * @return: True if the input was deemed valid and
         *          false otherwise.
        */ 
        const regex = /^([0-9]*[.])?[0-9]+$/
        return regex.test(val) && parseFloat(val) >= 0
    }

    const handleVal = (val) => {
        /** 
         * Handles changing annual fossil fuel
         * related carbon emission value. 
         * @param val: User input. Will be "" if was
         *             invalid or empty.
        */
        
        // If input was invalid set value to 
        // current value.
        if (val == "") {
            setIsValid(false)
        // Else set value to input value.
        } else {
            setIsValid(true)
            setEmissionRate(parseFloat(val))
        }
    }

    useEffect(() => {
        /**
         * Every time that emission rate changes, 
         * update the value in the simulation.
         */
        const newVal = Big(`${emissionRate}e+15`)
        setFossilFuelEmission(newVal)
    }, [emissionRate])

    return (
        <Help helpData={helpData} page="world">
            <div ref={refInput} className='py-3 rounded-lg bg-[#FFFFFF] rounded-lg'>
                <div className='text-center font-bold px-3'>FOSSIL FUEL USAGE</div>
                <div className='text-center px-3'>Annual Carbon Emission</div>
                <TextInput
                    label=''
                    unit="Gt"
                    sanityCheck={sanityCheckNumeric}
                    placeholder={emissionRate}
                    handleVal={handleVal}
                    textColor={isValid ? colorDefault : colorBad}
                />
            </div>
        </Help>
    )
}

export default EmissionsFossilFuels