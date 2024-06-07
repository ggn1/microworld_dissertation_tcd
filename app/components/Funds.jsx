import Card from "./Card"
import * as utils from '../utils.js'

const Funds = ({funds}) => {
    /** Displays that the user currently has. */
    return (
        <Card bgColor="#FFFFFF">
            <div className="-mt-2 flex gap-3 justify-center items-center w-full h-full">
                <div className="font-bold">FUNDS</div>
                <div className="flex gap-1">
                    <img src="barcon.png" className="h-4 w-auto"/> 
                    {utils.nFormatter(funds, 1)}
                </div>
            </div>
        </Card>
    )
}

export default Funds