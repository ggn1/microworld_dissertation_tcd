import React from 'react'
import Card from './Card'
import { Tooltip } from 'react-tooltip'

const CO2Scale = ({concentration}) => {
    /** 
     * Component that given displays CO2 concentration
     * on a color coded scale. 
     */

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
        <div className='co2concentration'>
            <Card bgColor={"#FFFFFF"} heading="ATMOSPHERIC CO2 CONCENTRATION (ppm)">
                <div className='flex'>
                    <div className='w-full flex flex-row gap-2'>{[scaleColorDivs]}</div>
                </div>
            </Card>
        </div>
    )
}

export default CO2Scale