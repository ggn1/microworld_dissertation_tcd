import * as utils from '../utils.js'

const ResourceSalesTargets = ({targets}) => {
    /**
     * Pulls and displays current sales per rotation
     * with or without dynamic
     */

    const incomeSources = JSON.parse(
        process.env.NEXT_PUBLIC_INCOME_SOURCES
    )

    return (
        <div className='flex flex-col justify-between gap-3'>
            {Object.keys(incomeSources).map(resource => 
                <div 
                    className='
                        flex justify-between gap-3 items-center 
                        bg-[#FFFFFF] rounded-xl py-2 px-5
                    '
                    key={`sales_${resource}`}
                >
                    <img className='h-12'src={incomeSources[resource].image}/>
                    <div className='font-bold text-[#AAAAAA] text-s text-center'>
                        {incomeSources[resource].label}
                    </div>
                    <div className='flex gap-2 items-center'>
                        <img className="h-6" src="barcon.png" />
                        <div>{utils.nFormatter(
                            utils.roundToNDecimalPlaces(targets[resource], 2).toString()
                        , 1)}</div>
                    </div>
                </div>
            )}
        </div>
        
    )
}

export default ResourceSalesTargets