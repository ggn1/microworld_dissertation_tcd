import Card from "./Card"
import * as utils from '../utils.js'

const Funds = ({funds}) => {
    return (
        <Card bgColor="#FFFFFF">
            <div className="-mt-2 flex gap-5 justify-center items-center w-full h-full">
                <div className="font-bold">FUNDS</div>
                <div>{utils.roundToNDecimalPlaces(funds, 2)}</div>
                <div className="font-bold">Bc</div>
            </div>
        </Card>
    )
}

export default Funds