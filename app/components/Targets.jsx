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
    setTargets, curCO2, curIncome, curFunds,
    startValCO2, startValIncome, updateTargetIncome,
    updateIncTargetsUI, getTargets
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
     * @param curCO2: Current atmospheric CO2 concentration.
     * @param curIncome: Latest user income.
     * @param curFunds: Latest funds that the user has.
     * @param startValCO2: The starting CO2 target value.
     * @param startValIncome: The starting income target value.
     * @param updateTargetIncome: Function that can be used to 
     *                            update target total income
     *                            in the simulation.
     * @param updateIncTargetsUI: Function that can be used to update
     *                            the UI to reflect effects of altered 
     *                            income value.
     */

    const colorTextDefault = "#232323"
    const colorBorderDefault = "#ffffff"
    const colorGood = "#32BE51"
    const colorBad = "#F44A4A"

    const [expMode, setExpMode] = useState(isExpMode)
    const [targetCO2, setTargetCO2] = useState(null) 
    const [targetIncome, setTargetIncome] = useState(null) 

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
        if (val == "") { // Invalid input.
            if (targetType == "co2") {
                setIsValidCO2(false)
                val = 0
            }
            if (targetType == "income") {
                setIsValidIncome(false)
                val = Big(0)
            }
        }
        else { // Valid input.
            if (targetType == "co2") {
                setIsValidCO2(sanityCheckNumeric(val))
            }
            if (targetType == "income") {
                setIsValidIncome(sanityCheckNumeric(val))
                val = Big(val)
            }
        }

        if (targetType == "co2") {
            isTargetMet("co2", val)
            targets.co2 = val
            setTargetCO2(utils.roundToNDecimalPlaces(val, 2))
        }

        if (targetType == "income") {
            isTargetMet("income", val)
            targets.income = val
            setTargetIncome(targets.income.toFixed(2).toString())
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
            grid p-3 grid-rows-4 grid-cols-1
            justify-content-center justify-items-center h-full
            gap-2
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
            <TextInput 
                label="Income Per Rotation >="
                placeholder={targetIncome}
                unit="Bc"
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
            <Tag 
                width="100%" 
                height="100%"
                bgColor="#FFFFFF" 
                borderWidth="4px"
                borderColor={
                    expMode ? colorBorderDefault : 
                    isTargetMetFunds ? colorGood : colorBad
                } 
            >
                <div className="flex gap-2 w-full h-full justify-between items-center px-1">
                    <div className="font-bold">Funds {`>= ${
                        targets.funds.toFixed(2).toString()
                    }`}</div>
                    <div>Bc</div>
                </div>
            </Tag>
        </div>
    )
}

export default Targets