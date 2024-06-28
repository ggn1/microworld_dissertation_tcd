import Big from 'big.js'
import Help from './Help'
import Switch from "./Switch"
import TextInput from "./TextInput"
import * as utils from '../utils.js'

import {useState, useEffect } from "react"

let targets = {"co2": null, "income": null, "funds": Big(JSON.parse(
    process.env.NEXT_PUBLIC_TARGET_FUNDS_START
))}
let isExpMode = true

const Targets = ({
    setTargets, getTargets, promptTargetMetCheck,
    updateTargetIncome, updateIncTargetsUI,
    targetFailYearCO2, targetFailYearIncome,
    showCO2=true, showIncome=true
}) => {
    /**
     * This component both displays targets and allows 
     * users to set them. It is possible to turn consideration
     * of there targets on and off to allow players to toggle
     * between serious (challenge shall be failed if targets are
     * not met) and experimentation modes.
     * @param setTargets: Function that allows targets to
     *                    be updated in the simulation. It must
     *                    accept a dictionary of target: value 
     *                    key pairs as input.
     * @param getTargets: Function that can be used to fetch latest
     *                    income/co2 targets from the simulation.
     * @param promptTargetMetCheck: A function that prompts the 
     *                              planner to check the target 
     *                              met condition and return results.
     * @param curCO2: Current atmospheric CO2 concentration.
     * @param curIncome: Latest user income.
     * @param curFunds: Latest funds that the user has.
     * @param updateTargetIncome: Function that can be used to 
     *                            update target total income
     *                            in the simulation.
     * @param updateIncTargetsUI: Function that can be used to update
     *                            the UI to reflect effects of altered 
     *                            income value.
     * @param year: Current year.
     * @param rotationPeriod: Current rotation period.
     * @param rotation: This rotation.
     * @param showCO2: Whether to show the CO2 target.
     * @param showIncome: Whether to show the CO2 target
     * @param targetFailYearCO2: The year at which the target for CO2 has
     *                           already been failed.
     * @param targetFailYearIncome: The year at which the target for CO2 has
     *                              already been failed.
     */

    const colorTextDefault = "#888888"
    const colorBorderDefault = "#ffffff"
    const colorGood = "#32BE51"
    const colorBad = "#F44A4A"

    const helpData = [["heading", "TARGET"], ["paragraph", "You may set yourself a target as part of challenges. The TARGET panel displays this as follows"], ["image", "help/targets1.png"], ["paragraph", "You may type into the TEXTBOX, the CO2 concentration below which atmospheric CO2 levels must never dip."], ["paragraph", "The VIEW switch can be toggled on and off. When on, the target panel displays whether the target is being currently met or not."], ["paragraph", "If the success condition is satisfied, then a green border indicates this. If the target could not be met, then a red border shows this. The point in time at which the target first failed, is also indicated (notation Y2, Y3 and so on, means Year 2, Year 3, etc.)."], ["image", "help/targets2.png"]]

    const [expMode, setExpMode] = useState(isExpMode)
    const [targetCO2, setTargetCO2] = useState(null) 
    const [targetIncome, setTargetIncome] = useState(null) 

    const [isValidCO2, setIsValidCO2] = useState(false)
    const [isValidIncome, setIsValidIncome] = useState(false)
    const [showCO2Target, setShowCO2Target] = useState(showCO2)
    const [showIncomeTarget, setShowIncomeTarget] = useState(showIncome)
    const [incomeFailed, setIncomeFailed] = useState(targetFailYearIncome)
    const [co2Failed, setCO2Failed] = useState(targetFailYearCO2)

    const sanityCheckNumeric = (val) => {
        /** 
         * Here, input is considered valid only if
         * it is a positive number (integer / floating point number).
         * @param val: Input as a string.
         * @return: True if the input was deemed valid and
         *          false otherwise.
        */ 
        const regex = /^([0-9]*[.])?[0-9]+$/
        if (regex.test(val)) {
            const number = parseFloat(val)
            return number >= 0
        }
        return false
    }

    const handleVal = (targetType, val) => {
        /** 
         * Handles changing CO2 input values. 
         * @param targetType: Type of target (co2 / income).
         * @param val: User input from the CO2 text box as a string value.
        */

        // Check if given value is valid.
        // If the value is an empty string, then it is invalid.
        // If it contains unexpected characters, then too, it is invalid.
        // Else, it is valid.
        let isValid = val != "" && sanityCheckNumeric(val)
        if (targetType == "co2") {
            setIsValidCO2(isValid)
            if (isValid) {
                val = utils.roundToNDecimalPlaces(val, 0)
                targets.co2 = val
                setTargetCO2(targets.co2)
                setCO2Failed(promptTargetMetCheck().co2)
            }
        } else if (targetType == "income") {
            setIsValidIncome(isValid)
            if (isValid) {
                val = Big(val)
                targets.income = val
                setTargetIncome(targets.income.toFixed(2))
                setIncomeFailed(promptTargetMetCheck().income)
                updateTargetIncome({income: targets.income})
                updateIncTargetsUI()
            }
        }
    }

    const handleExpModeToggle = (toggledState) => {
        /** 
         * Handles turning serious/experimental mode off and on.
         * @param toggledState: Whether the serious mode toggle switch
         *                      is in the true / false state. 
         */
        isExpMode = !toggledState
        setExpMode(isExpMode)
    }

    useEffect(() => {
        /** 
         * Initially, check if default targets are met.
         */
        targets = getTargets()
        handleVal("co2", targets.co2)
        handleVal("income", targets.income)
    }, [])

    useEffect(() => {
        setCO2Failed(targetFailYearCO2)
    }, [targetFailYearCO2])

    useEffect(() => {
        setIncomeFailed(targetFailYearIncome)
    }, [targetFailYearIncome])

    useEffect(() => {
        /**
         * Every time target are reset, change 
         * their values in the simulation.
         */
        if (targetCO2 != null && targetIncome != null) {
            setTargets({co2: targetCO2, income: Big(targetIncome)})
        }
    }, [targetCO2, targetIncome])

    useEffect(() => {
        setShowCO2Target(showCO2)
    }, [showCO2])

    useEffect(() => {
        setShowIncomeTarget(showIncome)
    }, [showIncome])

    return (
        (targetCO2 != null && targetIncome != null) &&
        (showCO2Target || showIncomeTarget) &&
        <Help helpData={helpData} page="world">
            <div className="flex flex-col h-full w-full justify-center gap-3">
                {/* HEADING & SWITCH */}
                <div className="flex gap-5 justify-center items-center">
                    <div className="font-bold">TARGET</div>
                    <Switch 
                        isOnStart={!expMode} 
                        onToggle={handleExpModeToggle}
                        onColor="#32BE51"
                        offColor="#6E6E6E"
                    />
                </div>
                {/* CO2 TARGET */}
                {showCO2Target && <div className='flex gap-2 items-center'>
                    {(!expMode && co2Failed >= 0) && <div 
                        className='font-bold text-center'
                        style={{color: colorBad}} 
                    >Y{co2Failed}</div>}
                    <TextInput 
                        label="CO2 ≤"
                        placeholder={targetCO2}
                        borderColor={
                            expMode ? colorBorderDefault : 
                            co2Failed >= 0 ? colorBad :
                            co2Failed == -2 ? colorGood : 
                            colorBorderDefault
                        }
                        textColor={isValidCO2 ? colorTextDefault : colorBad}
                        unit="ppm"
                        sanityCheck={sanityCheckNumeric} 
                        handleVal={(val) => handleVal("co2", val)}
                        hide={!showCO2Target}
                    />
                </div>}
                {/* INCOME */}
                {showIncomeTarget && <div className='flex gap-2 items-center'>
                    {(!expMode && incomeFailed >= 0) && <div 
                        className='font-bold text-center'
                        style={{color: colorBad}} 
                    >R{incomeFailed}</div>}
                    <TextInput 
                        label="Rotation Income ≥"
                        placeholder={targetIncome}
                        unit={<img src="coin.png" className='h-5 r-5'/>}
                        borderColor={
                            expMode ? colorBorderDefault :
                            incomeFailed >= 0 ? colorBad : 
                            incomeFailed == -2 ? colorGood : 
                            colorBorderDefault
                        }
                        textColor={isValidIncome ? colorTextDefault : colorBad}
                        sanityCheck={sanityCheckNumeric} 
                        handleVal={(val) => handleVal("income", val)}
                        hide={!showIncomeTarget}
                    />
                </div>}
            </div>
        </Help>
    )
}

export default Targets