import Card from './Card'
import Help from './Help'
import { Tooltip } from 'react-tooltip'

const CO2Scale = ({concentration}) => {
    /** 
     * Component that given atmospheric CO2 concentration,
     * displays it on a color coded scale. 
     * @param concentration: Current atmospheric CO2 concentration.
     */

    const helpData = [["heading", "CO2"], ["paragraph", "Natural processes like respiration and anthropogenic (human generated) ones like burning of wood or fossil fuels, and so on, release carbon into the atmosphere in gaseous form, of which a large part is CO2. CO2 is a greenhouse gas that traps heat within the atmosphere and keeps the planet toasty. Mars has too little CO2. Venus has too much. On Earth, it's just right. Mars and Venus are both thought to have started out much like earth with similar conditions."], ["paragraph", "Atmospheric CO2 concentration is expressed in Parts Per Million (ppm). This is the standard. It is a measure of the concentration of a substance in a solution or gas. It is a proportion, just like percent. 80 percent is 80 parts out of 100. 80 ppm is 80 parts out of 1,000,000. Here, this indicates the number of parts of CO2 per 1 million parts of the total air in the atmosphere."], ["paragraph", "CO2 concentration in the microworld has been organized into an easy-to-read scale as shown below. Associated with each band in the scale, is a label that is indicative of the expected quality of life for humans at that level of atmospheric CO2 concentration after considering climate change related effects."], ["image", "help/air_1.png"], ["image", "help/air_2.png"], ["paragraph", "Current levels of CO2 at each point in the simulation is displayed in the ATMOSPHERIC CO2 CONCENTRATION panel as shown below. The number within a colored tile is the current concentration. Hovering over each tile, reveals its range and quality of life label."], ["image", "help/air_3.png"]]

    // Round CO2 concentration in the atmosphere to 2 decimal places.
    concentration = concentration.toFixed(2)

    // Get the category of danger this level poses to human life.
    const envScale = JSON.parse(process.env.NEXT_PUBLIC_ENV_SCALE)
    let curScaleCategory = envScale[0].humanLife
    for (const category of envScale) {
        const co2ppmMinMax = category.co2ppm
        if (typeof(co2ppmMinMax[1]) == "string") {
            co2ppmMinMax[1] = Infinity
        }
        if (concentration >= co2ppmMinMax[0] && concentration < co2ppmMinMax[1]) {
            curScaleCategory = category.humanLife
        }
    }

    // Get colored tiles to represent possible colors in the scale.
    // Highlight the tile corresponding to current CO2 concentration.
    const scaleColors = JSON.parse(process.env.NEXT_PUBLIC_ENV_SCALE_COLORS)
    let scaleColorDivs = []
    for (const [scaleCategory, scaleColor] of Object.entries(scaleColors)) {
        scaleColorDivs.push(
            <a 
                className='w-full h-full'
                data-tooltip-id={`tooltip-${scaleCategory}`}
                data-tooltip-content={`${scaleCategory}`}
                data-tooltip-place="top"
            > 
                <div key={scaleCategory} className='
                    scaleTile w-full h-full rounded-sm 
                    px-2 py-1 text-[#232323] text-black
                ' style={{backgroundColor: `#${scaleColor}`}}>
                    {scaleCategory == curScaleCategory ? concentration : ""}
                </div>
                <Tooltip id={`tooltip-${scaleCategory}`}/>
            </a>
        )
    }

    return (
        <Help helpData={helpData} page="world">
            <div className='co2concentration'>
                <Card bgColor={"#FFFFFF"} heading="ATMOSPHERIC CO2 CONCENTRATION (ppm)">
                    <div className='flex'>
                        <div className='w-full flex flex-row gap-2'>{[scaleColorDivs]}</div>
                    </div>
                </Card>
            </div>
        </Help>
    )
}

export default CO2Scale