"use client"

import Link from "next/link"
import { sim } from "../page.jsx"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../components/Button.jsx"
import IncDepSetter from "../components/IncDepSetter.jsx"
import ActionManager from "../components/ActionManager.jsx"
import RotationPeriod from "../components/RotationPeriod.jsx"
import ResourceSales from "../components/ResourceSales.jsx"

const Planner = () => {
    /**
     * This page allows learners to draft forest and 
     * income management plans.
     */

    const router = useRouter()

    const [simNotNull, setSimNotNull] = useState(false)
    const [rotationPeriod, setRotationPeriod] = useState(sim ? sim.planner.rotationPeriod : 0)
    const [resourceSalesTargets, setResourceSalesTargets] = useState(
        sim.getResourceSalesTargets()
    )

    useEffect(() => {
        // Upon refresh, reload to the home page
        // as sim does not yet exist on this page.
        if (!sim) {
            const navigationEntries = performance.getEntriesByType('navigation')
            if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
                router.replace('/')
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
        simNotNull && <main className="p-5 w-full grid grid-cols-5 grid-rows-3 gap-3">
            {/* ACTION MANAGER */}
            <div 
                id="planner-main" 
                className="
                    bg-[#EEEEEE] col-span-3 p-3 row-span-3 rounded-xl
                    flex flex-col h-full gap-5
                "
            >
                {/* HOME BUTTON & ROTATION SETTER */}
                <div className="flex justify-between items-center gap-5 flex-wrap">
                    <Link href={"/"}>
                        <Button bgColor="#005FFF" fgColor="#FFFFFF" outlineColor="#5D8AFF">
                            HOME
                        </Button>
                    </Link>
                    <RotationPeriod 
                        setRotationPeriod={(newPeriod) => {
                            setRotationPeriod(sim ? parseInt(newPeriod) : 0)
                        }}
                        curRotationPeriod={sim != null ? sim.planner.rotationPeriod : " "}
                        validRange={[1, JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)]}
                    />
                </div>
                {simNotNull && <ActionManager
                    rotationPeriod={rotationPeriod}
                    getPlan={sim.planner.getPlan}
                    addAction={sim.planner.addAction}
                    deleteAction={sim.planner.deleteAction}
                />}
            </div>

            {/* INCOME DEPENDENCY */}
            <div 
                id="planner-income-dependency" 
                className="bg-[#F2EAD5] col-span-2 row-span-1 p-3 rounded-xl"
            >
                <div className="font-bold text-center mb-3">INCOME DEPENDENCY</div>
                <IncDepSetter 
                    incDepStart={sim.planner.incomeDependency}
                    setIncDep={sim.planner.setIncDep}
                    updateSalesTargets={() => {
                        sim.updateResourceSalesTargets()
                        setResourceSalesTargets(
                            sim.getResourceSalesTargets()
                        )
                    }}
                />
            </div>

            {/* ROTATION SALES TARGETS */}
            <div 
                id="planner-sales-targets" 
                className="bg-[#FFECFB] col-span-2 row-span-2 p-3 rounded-xl"
            >
                <div className="font-bold text-center mb-3">
                    REQUIRED SALES PER ROTATION
                </div>
                <ResourceSales targets={resourceSalesTargets}/>
            </div>
        </main>
    )
}

export default Planner