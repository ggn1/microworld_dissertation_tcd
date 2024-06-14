import Card from "./Card"
import * as utils from '../utils.js'

const Funds = ({funds}) => {
    /** Displays that the user currently has. */
    return (
        <Card bgColor="#FFFFFF">
            <div className="-mt-2 flex gap-3 justify-center items-center w-full h-full">
                <div className="font-bold">BANK BALANCE</div>
                <div className="flex gap-1 items-center">
                    <img src="coin.png" className="h-8 w-8"/> 
                    {utils.nFormatter(funds, 1)}
                </div>
            </div>
        </Card>
    )
}

export default Funds