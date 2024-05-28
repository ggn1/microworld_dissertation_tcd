import Link from "next/link"
import Button from "../components/Button"

const Planner = () => {
    /**
     * This page allows learners to draft forest and 
     * income management plans.
     */

    return (
        <main className="h-screen w-full p-5 grid grid-cols-10 grid-rows-9 gap-2">
            <div id="planner-main" className="bg-[#EEEEEE] col-span-6 p-3 row-span-9 rounded-xl">
                {/* TO DO */}
                <Button bgColor="#005FFF" fgColor="#FFFFFF" outlineColor="#5D8AFF">
                    <Link href={"/"}>BACK</Link>
                </Button>
            </div>
            <div 
                id="planner-income-dependency" 
                className="bg-[#F2EAD5] col-span-4 row-span-7 p-3 rounded-xl"
            >
                <div>
                    <div className="font-bold text-center">INCOME DEPENDENCY</div>
                </div>
                {/* TO DO */}
            </div>
            <div 
                id="planner-rotation-period" 
                className="bg-[#D9ECE2] col-span-4 row-span-2 p-3 rounded-xl"
            >
                <div className="font-bold text-center">ROTATION PERIOD</div>
                {/* TO DO */}
            </div>
        </main>
    )
}

export default Planner