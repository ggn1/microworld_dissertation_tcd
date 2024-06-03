import Link from "next/link"
import Button from "./Button"

const PlanViewer = ({rotationPeriod}) => {
  return (
    <div className="p-3 flex flex-col h-full gap-3">
        <div className="flex justify-between items-center">
            <div className="flex flex-col justisy-between gap-1">
                <b>{rotationPeriod} Year Rotation Period</b>
            </div>
            <Link href={"/planner"}>
                <Button bgColor="#08851C" outlineColor="#2D9C23" fgColor="#FFFFFF">
                    PLAN
                </Button>
            </Link>
        </div>
        <div className="bg-white h-full p-3 rounded-lg">
            Plans
        </div>
    </div>
  )
}

export default PlanViewer