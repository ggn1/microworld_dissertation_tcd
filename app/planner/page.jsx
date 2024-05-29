"use client"

import Link from "next/link"
import { sim } from "../page.jsx"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "../components/Button.jsx"
import ActionManager from "../components/ActionManager.jsx"
import RotationPeriod from "../components/RotationPeriod.jsx"

const Planner = () => {
    /**
     * This page allows learners to draft forest and 
     * income management plans.
     */

    const router = useRouter()

    useEffect(() => {
        // Upon refresh, reload to the home page
        // as sim does not yet exist on this page.
        if (!sim) {
            const navigationEntries = performance.getEntriesByType('navigation')
            if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
                router.replace('/')
            }
        }
    }, [router])

    return (
        <main className="w-full p-5 grid grid-cols-10 grid-rows-9 gap-3">
            <div 
                id="planner-main" 
                className="
                    bg-[#EEEEEE] col-span-6 p-3 row-span-9 rounded-xl
                    flex flex-col h-full gap-5
                "
            >
                <div className="flex justify-between items-center gap-5 flex-wrap">
                    <Link href={"/"}>
                        <Button bgColor="#005FFF" fgColor="#FFFFFF" outlineColor="#5D8AFF">
                            HOME
                        </Button>
                    </Link>
                    <RotationPeriod 
                        setRotationPeriod={(newPeriod) => {
                            if (sim != null) sim.planner.rotationPeriod = newPeriod
                        }}
                        curRotationPeriod={sim != null ? sim.planner.rotationPeriod : " "}
                        validRange={[1, JSON.parse(process.env.NEXT_PUBLIC_TIME_MAX)]}
                    />
                </div>
                <div>
                    <ActionManager />
                </div>
            </div>
            <div 
                id="planner-income-dependency" 
                className="bg-[#F2EAD5] col-span-4 row-span-9 p-3 rounded-xl"
            >
                <div>
                    <div className="font-bold text-center">INCOME DEPENDENCY</div>
                </div>
                {/* TO DO */}
            </div>
        </main>
    )
}

export default Planner