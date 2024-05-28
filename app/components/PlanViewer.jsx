import Link from "next/link"
import Button from "./Button"

const PlanViewer = ({rotationPeriod}) => {
  return (
    <div className="p-3 flex flex-col h-full gap-3">
        <div className="flex justify-between items-center">
            <div className="font-bold">
                {rotationPeriod} Year Rotation
            </div>
            <Button bgColor="#08851C" outlineColor="#2D9C23" fgColor="#FFFFFF">
                <Link href={"/planner"}>PLAN</Link>
            </Button>
        </div>
        <div className="bg-white flex-grow p-3 rounded-lg">
            Plans
        </div>
    </div>
  )
}

export default PlanViewer