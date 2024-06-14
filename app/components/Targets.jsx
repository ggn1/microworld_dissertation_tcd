import Big from 'big.js'
import Switch from "./Switch"
import TextInput from "./TextInput"
import * as utils from '../utils.js'
import {useState, useEffect } from "react"

let targets = {"co2": null, "income": null, "funds": Big(JSON.parse(
    process.env.NEXT_PUBLIC_TARGET_FUNDS_START
))}
let isExpMode = true

// First number is the index of income 
// corresponding to this time step.
// Second number is the last saved income.
// Third number is the latest push.
// This is to keep track of past incomes.
let incomeTracker = [Big(0), Big(0)]
let targetFailed = {co2: -1, income: -1}

const Targets = ({
    setTargets, getTargets,
    curCO2, curIncome, curFunds,
    updateTargetIncome, updateIncTargetsUI,
    year, rotationPeriod, rotation,
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
     */

    const colorTextDefault = "#888888"
    const colorBorderDefault = "#ffffff"
    const colorGood = "#32BE51"
    const colorBad = "#F44A4A"

    const [curYear, setCurYear] = useState(year)
    const [curRotation, setCurRotation] = useState(rotation)
    const [curRotationPeriod, setCurRotationPeriod] = useState(rotationPeriod)
    const [expMode, setExpMode] = useState(isExpMode)
    const [targetCO2, setTargetCO2] = useState(null) 
    const [targetIncome, setTargetIncome] = useState(null) 

    const [isValidCO2, setIsValidCO2] = useState(false)
    const [isValidIncome, setIsValidIncome] = useState(false)
    const [isTargetMetCO2, setIsTargetMetCO2] = useState(0)
    const [isTargetMetIncome, setIsTargetMetIncome] = useState(0)
    const [isTargetMetFunds, setIsTargetMetFunds] = useState(0)
    const [showCO2Target, setShowCO2Target] = useState(showCO2)
    const [showIncomeTarget, setShowIncomeTarget] = useState(showIncome)
    const [incomeFailed, setIncomeFailed] = useState(targetFailed.income)
    const [co2Failed, setCo2Failed] = useState(targetFailed.co2)

    const isTargetMet = (targetType, target) => {
        /** 
         * Checks whether current values meet the target or not
         * and changes state accordingly.
         * @param targetType: Type of target being 
         *                    checked (co2 / income / funds).
         * @param target: The target value checked against.
         */
        if (targetType == "co2") {
            if(target >= curCO2) setIsTargetMetCO2(1)
            else {
                setIsTargetMetCO2(-1)
                if (co2Failed == -1) setCo2Failed(curYear)
            }
        }
        if (targetType == "income") {
            // If total income this rotation is >= target,
            // then income target is met.
            if(target.lte(curIncome)) {
                setIsTargetMetIncome(1)
            } else {
                // If is not rotation 0 and
                // income from the previous rotation is
                // still <= target, then last rotation's
                // income target was not met before reset.
                if ( 
                    curYear > 0 &&
                    target.gte(incomeTracker[0]) &&
                    (curYear == (curRotationPeriod * curRotation)) &&
                    curYear != JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)
                ) {
                    setIsTargetMetIncome(-1)
                    if(incomeFailed == -1) setIncomeFailed(curRotation)
                }
                else setIsTargetMetIncome(0)
            }
        }
        if (targetType == "funds") {
            if(target.lte(curFunds)) setIsTargetMetFunds(1)
            else setIsTargetMetFunds(-1)
        }
    }

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

        setCo2Failed(-1)
        setIncomeFailed(-1)

        // Check if given value is valid.
        // If the value is an empty string, then it is invalid.
        // If it contains unexpected characters, then too, it is invalid.
        // Else, it is valid.
        let isValid = val != "" && sanityCheckNumeric(val)
        if (!isValid) val = 0
        if (targetType == "co2") {
            setIsValidCO2(isValid)
        } else if (targetType == "income") {
            setIsValidIncome(isValid)
            val = Big(val)
        }

        // Check if targets are met.
        if (targetType == "co2") {
            isTargetMet("co2", val)
            targets.co2 = val
            setTargetCO2(utils.roundToNDecimalPlaces(val, 0))
        }
        if (targetType == "income") {
            isTargetMet("income", val)
            targets.income = val
            setTargetIncome(targets.income.toFixed(0).toString())
            updateTargetIncome({income: targets.income})
            updateIncTargetsUI()
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
        curFunds = Big(curFunds)
        isTargetMet("funds", targets.funds)
    }, [curFunds])

    useEffect(() => {
        if (targetCO2 != null) isTargetMet("co2", targetCO2)
    }, [curCO2])

    useEffect(() => {
        if (targetIncome != null) {
            curIncome = Big(curIncome)
            isTargetMet("income", Big(targetIncome))
        }
    }, [curIncome])

    useEffect(() => {
        /** 
         * Initially, check if default targets are met.
         */
        targets = getTargets()
        handleVal("co2", targets.co2) 
        handleVal("income", targets.income.toFixed(2).toString())
    }, [])

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
        if (
            targetIncome != null
            // && (curYear == (curRotationPeriod * curRotation))
            // || (curYear == JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX))
        ) isTargetMet("income", Big(targetIncome))
    }, [curYear])

    useEffect(() => {
        setCurYear(year)
        incomeTracker.splice(0, 1)
        incomeTracker.push(curIncome)
        if (year < curYear) setCo2Failed(-1)
    }, [year])

    useEffect(() => {
        setCurRotation(rotation)
        if (rotation < incomeFailed) setIncomeFailed(-1)
    }, [rotation])

    useEffect(() => {
        setCurRotationPeriod(rotationPeriod)
    }, [rotationPeriod])

    useEffect(() => {
        setShowCO2Target(showCO2)
    }, [showCO2])

    useEffect(() => {
        setShowIncomeTarget(showIncome)
    }, [showIncome])

    useEffect(() => {
        targetFailed.co2 = co2Failed
    }, [co2Failed])

    useEffect(() => {
        targetFailed.income = incomeFailed
    }, [incomeFailed])

    return (
        targetCO2 != null && targetIncome != null &&
        <div className="flex flex-col h-full p-3 justify-center items-center gap-3">
            {/* HEADING & SWITCH */}
            {(showCO2Target || showIncomeTarget) &&
                <div className="flex gap-5 justify-center items-center">
                    <div className="font-bold">TARGET</div>
                    <Switch 
                        isOnStart={!expMode} 
                        onToggle={handleExpModeToggle}
                        onColor="#32BE51"
                        offColor="#6E6E6E"
                    />
                </div>
            }
            {/* CO2 TARGET */}
            {showCO2Target && <div className='flex gap-2 items-center'>
                {!expMode && co2Failed != -1 && <div 
                    className='font-bold text-center'
                    style={{color: colorBad}} 
                >Y{co2Failed}</div>}
                <TextInput 
                    label="CO2 ≤"
                    placeholder={targetCO2}
                    borderColor={
                        expMode ? colorBorderDefault : 
                        co2Failed != -1 ? colorBad :
                        isTargetMetCO2 == 1 ? colorGood : 
                        isTargetMetCO2 == -1 ? colorBad :
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
                {!expMode && incomeFailed != -1 && <div 
                    className='font-bold text-center'
                    style={{color: colorBad}} 
                >R{incomeFailed-1}</div>}
                <TextInput 
                    label="Rotation Income ≥"
                    placeholder={targetIncome}
                    unit={<img src="coin.png" className='h-5 r-5'/>}
                    borderColor={
                        expMode ? colorBorderDefault :
                        incomeFailed != -1 ? colorBad : 
                        isTargetMetIncome == 1 ? colorGood : 
                        isTargetMetIncome == -1 ? colorBad :
                        colorBorderDefault
                    }
                    textColor={isValidIncome ? colorTextDefault : colorBad}
                    sanityCheck={sanityCheckNumeric} 
                    handleVal={(val) => handleVal("income", val)}
                    hide={!showIncomeTarget}
                />
            </div>}
        </div>
    )
}

export default Targets