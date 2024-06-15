import * as utils from '../utils.js'

const Money = ({amountBig, showUnit=true}) => {
    /**
     * Displays money in right format with unit.
     * @param amountBig: Amount as a Big object.
     */
    return (
        <div className='flex gap-1 items-center justify-center'>
            {showUnit && <img src="coin.png" className="h-5 w-5"/>}
            {utils.nFormatter(amountBig.toFixed(2).toString(), 2)}
        </div>
    )
}

export default Money