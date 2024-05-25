import Big from 'big.js'
import Card from './Card'

const CarbonDist = ({distribution}) => {
    let reservoirs = []
    for (const [reservoir, carbon] of Object.entries(distribution)) {
        let reservoirLabel = reservoir.replace("_", " ")
        reservoirLabel = reservoirLabel.split(" ")
        for (let i = 0; i < reservoirLabel.length; i++) {
            reservoirLabel[i] = (
                reservoirLabel[i][0].toUpperCase() + 
                reservoirLabel[i].substring(1)
            )
        }
        reservoirLabel = reservoirLabel.join(" ")
        reservoirs.push(
            <div key={reservoir} className='flex'>
                <div className='text-[#6E6E6E] mr-1'>{reservoirLabel}:</div>
                <div>{carbon.div(Big(10**15)).toNumber().toFixed(2)}</div>
            </div>
        )
    }

    return (
        <Card bgColor="#FFFFFF" heading="CARBON (Gt)">
            <div className='w-full flex flex-col gap-2'>{reservoirs}</div>
        </Card>
    )
}

export default CarbonDist