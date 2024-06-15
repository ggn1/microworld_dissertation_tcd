"use client"

import Link from "next/link"
import { sim, challenge } from "../world/page.jsx"
import { saveAs } from 'file-saver'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../components/Button.jsx"
import IncDepSetter from "../components/IncDepSetter.jsx"
import ActionManager from "../components/ActionManager.jsx"
import RotationPeriod from "../components/RotationPeriod.jsx"
import ResourceSalesTargets from "../components/ResourceSalesTargets.jsx"

const Planner = () => {
    /**
     * This page allows learners to draft forest and 
     * income management plans.
     */

    const router = useRouter()

    const [simNotNull, setSimNotNull] = useState(false)
    const [rotationPeriod, setRotationPeriod] = useState(sim ? sim.planner.rotationPeriod : 0)
    const [resourceSalesTargets, setResourceSalesTargets] = useState(
        sim ? sim.getResourceSalesTargets() : {}
    )
    const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0)
    const [incDepRefreshTrigger, setIncDepRefreshTrigger] = useState(0)

    // Component Challenge Wise Visilibility
    const [showIncDep, setShowIncDep] = useState(challenge == 0 || challenge == 5)

    const handleSave = () => {
        /** 
         * Saves current starting world and plan
         * as JSON data.
         */

        // Gather data to save.
        const data = {
            plan: sim.planner.plan,
            targetSettings: sim.planner.getTargets(),
            initSowPositions: sim.env.land.getInitSowPositions(),
            timeStepOrder: sim.env.land.getTimeStepOrder(),
            incomeDependency: sim.planner.incomeDependency,
            rotationPeriod: sim.planner.rotationPeriod,
            fossilFuelEmission: sim.env.getFossilFuelEmission().toString()
        }

        // Set status of all plans to -1.
        for (const y of Object.keys(data.plan)) {
            for (const actionType of Object.keys(data.plan[y])) {
                let actions = []
                for (let action of data.plan[y][actionType]) {
                    action.success = -1
                    actions.push(action)
                }
                data.plan[y][actionType] = actions
            }
        }
        
        // Convert to JSON and create a BLOB object.
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        
        // Download the data.
        saveAs(blob, "microworld.json")
    }

    const handleLoad = (e) => {
        /**
         * Loads previously saved world state.
         * @param e: File upload event.
         */
        const regex = /^[a-zA-Z0-9\s\[\]\{\}:_\-.,"]+$/

        const file = e.target.files[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            let isContentValid = true
            let data = {}
            const content = e.target.result
            if (!regex.test(content)) isContentValid = false
            if (isContentValid) {
                try {
                    data = JSON.parse(content)
                    if (
                        Object.keys(data).length != 7 ||
                        !("plan" in data) ||
                        !("targetSettings" in data) ||
                        !("initSowPositions" in data) ||
                        !("timeStepOrder" in data) ||
                        !("incomeDependency" in data) ||
                        !("rotationPeriod" in data) ||
                        !("fossilFuelEmission" in data)
                    ) isContentValid = false
                } catch (error) {
                    alert('Invalid File')
                }
            }
            if (!isContentValid) {
                alert("Invalid Content")
            } else { // Valid content.
                sim.loadState(data)
                setPlanRefreshTrigger(prevVal => 1 - prevVal)
                setIncDepRefreshTrigger(prevVal => 1 - prevVal)
                setRotationPeriod(sim.planner.rotationPeriod)
            }
        }

        reader.readAsText(file);
    }

    useEffect(() => {
        // Upon refresh, reload to the home page
        // as sim does not yet exist on this page.
        if (!sim) {
            const navigationEntries = performance.getEntriesByType('navigation')
            if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
                router.replace('/world')
            }
        } else {
            setSimNotNull(true)
        }
    }, [router])

    useEffect(() => {
        if (simNotNull) {
            sim.planner.rotationPeriod = rotationPeriod
        }
    }, [rotationPeriod])

    return (
        simNotNull &&
        <div 
            className="p-5 flex justify-center gap-3 max-w-full"
            style={{
                gridTemplateColumns: showIncDep ? "1fr 1fr 1fr" : "1fr",
                placeItems: showIncDep ? "none" : "center"
            }}
        >
            {/* ACTION MANAGER */}
            <div 
                id="planner-main" 
                className="
                    flex-grow
                    bg-[#EEEEEE] col-span-2 row-span-2 rounded-xl 
                    flex flex-col gap-5 p-3 max-w-2xl
                "
            >
                {/* BACK BUTTON & ROTATION SETTER */}
                <div className="flex justify-between items-center gap-5 flex-wrap">
                    <Link href={"/world"}>
                        <Button bgColor="#005FFF" fgColor="#FFFFFF" outlineColor="#5D8AFF">
                            BACK
                        </Button>
                    </Link>
                    <RotationPeriod 
                        setRotationPeriod={(newPeriod) => {
                            setRotationPeriod(sim ? parseInt(newPeriod) : 0)
                        }}
                        curRotationPeriod={rotationPeriod}
                        validRange={[1, JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)]}
                    />
                </div>
                {simNotNull && <ActionManager
                    rotationPeriod={rotationPeriod}
                    getPlan={sim.planner.getPlan}
                    addAction={sim.planner.addAction}
                    deleteAction={sim.planner.deleteAction}
                    onSave={handleSave}
                    onLoad={handleLoad}
                    updateTrigger={planRefreshTrigger}
                />}
            </div>
            
            <div className="flex flex-col gap-3 justify-between">
                {/* INCOME DEPENDENCY */}
                {showIncDep && <div 
                    id="planner-income-dependency" 
                    className="bg-[#F2EAD5] p-3 rounded-xl"
                >
                    <div className="font-bold text-center mb-3">INCOME DEPENDENCY</div>
                    <IncDepSetter 
                        getIncomeDependency={() => sim.planner.incomeDependency}
                        setIncDep={sim.planner.setIncDep}
                        updateSalesTargets={() => {
                            sim.updateResourceSalesTargets()
                            setResourceSalesTargets(sim.getResourceSalesTargets())
                        }}
                        sliderUpdateTrigger={incDepRefreshTrigger}
                    />
                </div>}

                {/* ROTATION SALES TARGETS */}
                {showIncDep && <div 
                    id="planner-sales-targets" 
                    className="bg-[#FFECFB] p-3 rounded-xl"
                >
                    <div className="font-bold text-center mb-3">
                        EXPECTED SALES PER ROTATION
                    </div>
                    <ResourceSalesTargets targets={resourceSalesTargets}/>
                </div>}
            </div>
            
        </div>
    )
}

export default Planner