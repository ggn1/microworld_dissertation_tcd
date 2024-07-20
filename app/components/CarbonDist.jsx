import Big from 'big.js'
import Help from './Help'
import Card from './Card'

const CarbonDist = ({distribution}) => {
    /**
     * Displays the exact amount of carbon in each
     * carbon reservoir.
     * @param distribution: Amount of carbon per reservoir.
     */

    const helpData = [["heading", "Carbon Panel"], ["paragraph", "The carbon panel displays the exact amount of carbon in each reservior throughout the simulation."], ["paragraph", "In this world, there are 5 carbon reservoirs. Amount of carbon in all these reservoirs are expressed in Gigatonnes (Gt) of Carbon (1 Gt = 10 to the power 12 kgs)."], ["paragraph", "1. VEGETATION: The plants on land sequester carbon dioxide (CO2) from the atmosphere. Carbon sequestration refers to the process through which CO2 is removed from the atmosphere and held in solid or liquid form."], ["paragraph", "2. SOIL: The soil holds carbon in the form of organic material (plant/animal remains, microbes, etc.) or minerals."], ["paragraph", "3. AIR: Natural processes like respiration and anthropogenic (human generated) ones like burning of wood or fossil fuels, and so on, release carbon into the atmosphere in gaseous form, of which a large part is CO2. CO2 is a greenhouse gas that traps heat within the atmosphere and keeps the planet toasty. Mars has too little CO2. Venus has too much. On Earth, its just right. Mars and Venus are both thought to have started out much like earth with similar conditions."], ["paragraph", "4. FOSSIL FUELS: Fossil fuels refer to energy dense coal, oil and gas trapped deep within the earth's surface that can be extracted and burned to generate heat to drive electricity production, machine operation, and more. These hydrocarbons (combinations of Hydrogen (H) + Carbon (C)) were formed from organic matter compressed over millions of under immerse heat and pressure, deep in the belly of planet Earth. So, unless you're willing to wait for another million years, fossil fuels, as we know it, are non-renewable."],  ["paragraph", "5. LUMBER: This is a man-made reservoir. It refers to all wood that's preserved in use (furniture, construction, etc.) and not burned for energy. When we preserve wood, we significantly slow down its breakdown and re-entry into the carbon cycle via natural decay."]]
    
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
        <Help helpData={helpData} page="world">
            <Card bgColor="#FFFFFF" heading="CARBON (Gt)">
                <div className='w-full flex flex-wrap gap-2'>
                    {reservoirs}
                </div>
            </Card>
        </Help>
    )
}

export default CarbonDist