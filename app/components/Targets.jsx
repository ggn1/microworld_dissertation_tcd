import Big from 'big.js'
import Switch from "./Switch"
import Tag from "./Tag"
import TextInput from "./TextInput"
import * as utils from '../utils.js'
import {useState, useEffect } from "react"

let targets = {"co2": null, "income": null, "funds": Big(JSON.parse(
    process.env.NEXT_PUBLIC_TARGET_FUNDS_START
))}
let isExpMode = true

const Targets = ({
    setTargets, getTargets, 
    curCO2, curIncome, curFunds,
    updateTargetIncome, updateIncTargetsUI
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
     */

    const colorTextDefault = "#888888"
    const colorBorderDefault = "#ffffff"
    const colorGood = "#32BE51"
    const colorBad = "#F44A4A"

    const [expMode, setExpMode] = useState(isExpMode)
    const [targetCO2, setTargetCO2] = useState(null) 
    const [targetIncome, setTargetIncome] = useState(null) 
    const [funds, setFunds] = useState(utils.nFormatter(curFunds.toString(), 1))

    const [isValidCO2, setIsValidCO2] = useState(false)
    const [isValidIncome, setIsValidIncome] = useState(false)
    const [isTargetMetCO2, setIsTargetMetCO2] = useState(false)
    const [isTargetMetIncome, setIsTargetMetIncome] = useState(false)
    const [isTargetMetFunds, setIsTargetMetFunds] = useState(false)

    const isTargetMet = (targetType, target) => {
        /** 
         * Checks whether current values meet the target or not
         * and changes state accordingly.
         * @param targetType: Type of target being 
         *                    checked (co2 / income / funds).
         * @param target: The target value checked against.
         */
        if (targetType == "co2") {
            setIsTargetMetCO2(target >= curCO2)
        }
        if (targetType == "income") {
            setIsTargetMetIncome(target.lte(curIncome))
        }
        if (targetType == "funds") {
            setIsTargetMetFunds(target.lte(curFunds))
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
        console.log(curFunds)
        curFunds = Big(curFunds)
        isTargetMet("funds", targets.funds)
        setFunds(utils.nFormatter(curFunds.toString(), 1))
    }, [curFunds])

    useEffect(() => {
        if (targetCO2 != null) {
            isTargetMet("co2", targetCO2)
        }
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

    return (
        targetCO2 != null && 
        targetIncome != null && 
        <div className="
            grid p-3 grid-rows-3 justify-content-center 
            justify-items-center gap-3
        ">
            <div className="flex gap-5 h-full w-full justify-center items-center">
                <div className="font-bold">TARGETS</div>
                <Switch 
                    isOnStart={!expMode} 
                    onToggle={handleExpModeToggle}
                    onColor="#32BE51"
                    offColor="#6E6E6E"
                />
            </div>
            <div>
                <TextInput 
                    label="CO2 <="
                    placeholder={targetCO2}
                    borderColor={
                        expMode ? colorBorderDefault : 
                        isTargetMetCO2 ? colorGood : colorBad
                    }
                    textColor={isValidCO2 ? colorTextDefault : colorBad}
                    unit="ppm"
                    sanityCheck={sanityCheckNumeric} 
                    handleVal={(val) => handleVal("co2", val)}
                />
            </div>
            <div>
                <TextInput 
                    label="Rotation Income >="
                    placeholder={targetIncome}
                    unit={<img src="barcon.png" className='h-4 w-auto'/>}
                    borderColor={
                        expMode ? colorBorderDefault 
                                : isTargetMetIncome 
                                ? colorGood 
                                : colorBad
                    }
                    textColor={isValidIncome ? colorTextDefault : colorBad}
                    sanityCheck={sanityCheckNumeric} 
                    handleVal={(val) => handleVal("income", val)}
                />
            </div>
            <Tag 
                width="100%" height="100%"
                bgColor="#FFFFFF" borderWidth="4px"
                borderColor={
                    expMode ? colorBorderDefault : 
                    isTargetMetFunds ? colorGood : colorBad
                } 
            >
                <div className="flex gap-2 w-full h-full justify-between items-center px-1">
                    <div>
                        <b>Funds: </b>
                        {`${utils.nFormatter(curFunds.toString(), 1)} > ${targets.funds.minus(1).toFixed(0).toString()}`}
                    </div>
                    <img src="barcon.png" className='h-4 w-auto' />
                </div>
            </Tag>
        </div>
    )
}

export default Targets