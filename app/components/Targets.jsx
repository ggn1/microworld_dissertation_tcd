import Switch from "./Switch"
import TextInput from "./TextInput"
import {useState, useEffect } from "react"

let TARGETS = {
    "co2": null,
    "income": null
}
let IS_EXP_MODE = true

const Targets = ({setTargets, getCO2, getIncome, startValCO2, startValIncome}) => {
    /**
     * This component both displays targets and allows 
     * users to set them. It is possible to turn consideration
     * of there targets on and off to allow players to toggle
     * between serious (challenge shall be failed if targets are
     * not met) and experimentation modes.
     * @param setTargets: Function that allows targets to
     *                       be updated in the simulation. It must
     *                       accept a dictionary of target: value 
     *                       key pairs as input.
     * @param getCO2: Gets current atmospheric CO2 concentration.
     * @param getIncome: Gets latest user income.
     * @param startValCO2: The starting CO2 target value.
     * @param startValIncome: The starting income target value.
     */

    const colorTextDefault = "#6e6e6e"
    const colorBorderDefault = "#ffffff"
    const colorGood = "#32BE51"
    const colorBad = "#F44A4A"

    const [expMode, setExpMode] = useState(IS_EXP_MODE)
    const [targetCO2, setTargetCO2] = useState(
        TARGETS.co2 != null && TARGETS.co2 != startValCO2
        ? TARGETS.co2 : startValCO2
    ) 
    const [targetIncome, setTargetIncome] = useState(
        TARGETS.income != null && TARGETS.income != startValIncome
        ? TARGETS.income : startValIncome
    ) 
    const [borderColorCO2, setBorderColorCO2] = useState(colorBorderDefault)
    const [textColorCO2, setTextColorCO2] = useState(colorTextDefault)
    const [borderColorIncome, setBorderColorIncome] = useState(colorBorderDefault)
    const [textColorIncome, setTextColorIncome] = useState(colorTextDefault)

    const isTargetMet = (targetType, target) => {
        /** 
         * Checks whether current values meet the target or not.
         * @param targetType: Type of target being 
         *                    checked (co2 / income).
         */
        
        if (targetType == "co2") return getCO2() <= target
        if (targetType == "income") return getIncome() >= target
    }

    const sanityCheckNumeric = (val) => {
        /** 
         * Here, input is considered valid only if
         * it is a positive number (integer / floating point number).
         * @param val: Input as a string.
         * @return: True if the input was deemed valid and
         *          false otherwise.
        */

        // Parse the string to a number
        const num = parseFloat(val);
    
        // Check if the parsed number is a positive 
        // number and not NaN.
        return !isNaN(num) && num >= 0
    }

    const handleVal = (targetType, val) => {
        /** 
         * Handles changing CO2 input values. 
         * @param targetType: Type of target (co2 / income).
         * @param val: User input from the CO2 text box as a string value.
        */
        if (val == "") {
            if (targetType == "co2") setTextColorCO2(colorBad)
            if (targetType == "income") setTextColorIncome(colorBad)
            val = 0
        }
        else {
            setTextColorCO2(colorTextDefault)
            setTextColorIncome(colorTextDefault)
            val = parseFloat(val)
        }

        if (targetType == "co2") {
            if (isTargetMet("co2", val)) setBorderColorCO2(colorGood)
            else setBorderColorCO2(colorBad)
            TARGETS.co2 = val
            setTargetCO2(TARGETS.co2)
        }

        if (targetType == "income") {
            if (isTargetMet("income", val)) setBorderColorIncome(colorGood)
            else setBorderColorIncome(colorBad)
            TARGETS.income = val
            setTargetIncome(TARGETS.income)
        }
    }

    const handleExpModeToggle = (toggledState) => {
        /** 
         * Handles turning serious/experimental mode off and on.
         * @param toggledState: Whether the serious mode toggle switch
         *                      is in the true / false state. 
         */
        IS_EXP_MODE = !toggledState
        setExpMode(IS_EXP_MODE)
    }

    useEffect(() => {
        /** 
         * Initially, check if default targets are met.
         */
        handleVal("co2", targetCO2) 
        handleVal("income", targetIncome)
    }, [])

    useEffect(() => {
        /**
         * Every time target are reset, change 
         * their values in the simulation.
         */
        setTargets({co2: targetCO2, income:targetIncome})
    }, [targetCO2, targetIncome])

    return (
        <div className="
            grid p-3 auto-rows-auto grid-cols-1
            justify-content-center justify-items-center h-full
            gap-3
        ">
            <div className="flex gap-5 justify-center -mb-3">
                <div className="font-bold">TARGETS</div>
                <Switch 
                    isOnStart={!expMode} 
                    onToggle={handleExpModeToggle}
                    onColor="#32BE51"
                    offColor="#6E6E6E"
                />
            </div>
            <TextInput 
                label="CO2 :"
                placeholder="0"
                borderColor={expMode ? colorBorderDefault : borderColorCO2}
                textColor={textColorCO2}
                startVal={targetCO2}
                unit="ppm"
                sanityCheck={sanityCheckNumeric} 
                handleVal={(val) => handleVal("co2", val)}
            />
            <TextInput 
                label="Income :"
                placeholder="0"
                unit="Bc"
                borderColor={expMode ? colorBorderDefault : borderColorIncome}
                textColor={textColorIncome}
                startVal={targetIncome}
                sanityCheck={sanityCheckNumeric} 
                handleVal={(val) => handleVal("income", val)}
            />
        </div>
    )
}

export default Targets