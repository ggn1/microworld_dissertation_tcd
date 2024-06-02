"use client"

import Link from "next/link"
import { sim } from "../page.jsx"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../components/Button.jsx"
import ActionManager from "../components/ActionManager.jsx"
import RotationPeriod from "../components/RotationPeriod.jsx"
import PercentSlider from "../components/IncDepSlider.jsx"
import IncDepSetter from "../components/IncDepSetter.jsx"

const Planner = ({getIncomeDep, setIncomeDep}) => {
    /**
     * This page allows learners to draft forest and 
     * income management plans.
     */

    const router = useRouter()

    const [simNotNull, setSimNotNull] = useState(false)
    const [rotationPeriod, setRotationPeriod] = useState(sim ? sim.planner.rotationPeriod : 0)

    let incomeDepSliders = []

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
        <main className="w-full p-5 grid grid-cols-10 grid-rows-9 gap-3">
            {/* ACTION MANAGER */}
            <div 
                id="planner-main" 
                className="
                    bg-[#EEEEEE] col-span-6 p-3 row-span-9 rounded-xl
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
                className="bg-[#F2EAD5] col-span-4 row-span-9 p-3 rounded-xl"
            >
                <div className="font-bold text-center mb-3">INCOME DEPENDENCY</div>
                {simNotNull && <IncDepSetter 
                    incDepStart={sim.planner.incomeDependency}
                    setIncDep={sim.planner.setIncDep}
                />}
            </div>
        </main>
    )
}

export default Planner