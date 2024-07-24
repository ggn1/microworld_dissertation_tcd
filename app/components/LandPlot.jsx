"use client"

import * as d3 from "d3"
import Help from "./Help"
import React, { useEffect, useState, useRef } from "react"

let svg
let widthSvg
let heightSvg
let margins
let widthPlot
let heightPlot
let gPlot
let gXAxis
let gYAxis
let scaleX
let scaleY
let gContent
const size = JSON.parse(process.env.NEXT_PUBLIC_LAND_SIZE)
const svgIcons = {"seedling": {"coniferous":{"scale": 0.09, "fill":"619E73", "d":"m162.2743,437.27095l-2.50097,-188.63198c26.37647,-34.68576 34.49183,-179.01323 111.29489,-141.75297c76.80307,37.26025 -56.75655,171.3249 -136.83437,146.74104c-80.07782,-24.58387 -134.62989,-177.08951 -129.10635,-187.23457c5.52355,-10.14506 69.87351,-1.80811 99.12336,58.20945c29.24985,60.01757 61.22376,121.41582 54.39886,124.59996"}, "deciduous": {"scale": 0.09, "fill":"B8D078", "d":"m162.2743,437.27095l-2.50097,-188.63198c26.37647,-34.68576 34.49183,-179.01323 111.29489,-141.75297c76.80307,37.26025 -56.75655,171.3249 -136.83437,146.74104c-80.07782,-24.58387 -134.62989,-177.08951 -129.10635,-187.23457c5.52355,-10.14506 69.87351,-1.80811 99.12336,58.20945c29.24985,60.01757 61.22376,121.41582 54.39886,124.59996"}}, "sapling": {"coniferous": {"scale": 0.09, "fill":"619E73", "d":"m143.59497,502.42732c9.92454,-24.14193 -22.17414,-147.43604 9.97679,-355.78825c32.15092,-208.35221 208.90818,-110.951 102.76621,-27.1678c-106.14197,83.7832 -218.58312,261.81413 -255.88496,133.13932c-37.30184,-128.67481 291.21799,79.96256 299.51983,-18.74967c8.30184,-98.71223 -93.21773,18.0862 -160.59189,-2.59414c-67.37416,-20.68033 -188.26779,-235.90001 -114.39021,-228.68581c73.87758,7.2142 110.77998,168.67195 117.98073,229.43053"}, "deciduous":{"scale": 0.09, "fill":"B8D078", "d":"m143.59497,502.42732c9.92454,-24.14193 -22.17414,-147.43604 9.97679,-355.78825c32.15092,-208.35221 208.90818,-110.951 102.76621,-27.1678c-106.14197,83.7832 -218.58312,261.81413 -255.88496,133.13932c-37.30184,-128.67481 291.21799,79.96256 299.51983,-18.74967c8.30184,-98.71223 -93.21773,18.0862 -160.59189,-2.59414c-67.37416,-20.68033 -188.26779,-235.90001 -114.39021,-228.68581c73.87758,7.2142 110.77998,168.67195 117.98073,229.43053"}}, "mature": { "coniferous": {"scale": 0.09, "fill":"619E73", "d":"m148.49104,2.5l-145.99104,378.74059l293.59494,0.68714l-146.36226,-368.26646l0,484.82127"}, "deciduous": {"scale": 0.09, "fill":"B8D078", "d":"m155.45452,222.11132c-216.34574,74.99975 -179.89617,-200.33584 -34.90544,-217.72988c144.99073,-17.39407 162.04848,91.31884 166.31291,100.01588c4.26444,8.69704 42.64432,173.94065 -76.7598,208.72876c-119.40412,34.78815 -199.12919,-7.33401 -204.37282,-120.63504c-5.24363,-113.30103 171.20717,-150.71794 198.47201,-59.25669c27.26482,91.46125 -35.60817,132.05803 -36.74352,132.05803c-19.30098,18.5238 -16.81067,147.31317 -14.78185,233.38573"}}, "old_growth": {"coniferous": {"scale": 0.09, "fill":"559E84", "d":"m142.08448,2.5l-138.9469,228.37034l292.93961,-3.79582l-153.83222,-224.37181l-139.74497,372.31427l293.85236,-2.20418l-152.98657,-268.20952l3,394.19389"}, "deciduous": {"scale": 0.09, "fill":"B8D078", "d":"m154.14571,501.78073l-3.07919,-337.32207c2.28468,-17.821 81.13642,-67.1167 122.02708,20.50616c40.89065,87.62283 -33.80155,156.4735 -55.6363,164.10563c-21.83479,7.63211 -110.5192,27.81815 -177.6967,-27.67631c-67.17752,-55.49447 -25.67527,-149.4774 -12.22605,-166.62524c13.44922,-17.14785 49.81923,-54.12944 119.91748,-54.12944c70.09828,0 92.33431,52.24684 92.71098,63.68229c0.37668,11.43546 15.54323,95.59455 -110.04952,98.5153c-125.59274,2.92076 -133.05859,-117.84784 -125.37762,-161.77671c7.68097,-43.92886 36.86415,-78.24429 81.75689,-89.26691c44.89274,-11.02262 93.82793,-13.2191 129.39571,-1.23963c46.97165,17.53627 66.6736,41.62498 76.0719,91.27792c9.3983,49.65294 -1.23446,74.64481 -16.96843,104.77215c-15.73397,30.12732 -19.06387,64.73514 -121.83811,57.75174"}}, "senescent": { "coniferous": {"scale": 0.09, "fill":"6F5C2A", "d":"m142.08448,2.5l-138.9469,228.37034l292.93961,-3.79582l-153.83222,-224.37181l-139.74497,372.31427l293.85236,-2.20418l-152.98657,-268.20952l3,394.19389"}, "deciduous": {"scale": 0.09, "fill":"C48157", "d":"m154.14571,501.78073l-3.07919,-337.32207c2.28468,-17.821 81.13642,-67.1167 122.02708,20.50616c40.89065,87.62283 -33.80155,156.4735 -55.6363,164.10563c-21.83479,7.63211 -110.5192,27.81815 -177.6967,-27.67631c-67.17752,-55.49447 -25.67527,-149.4774 -12.22605,-166.62524c13.44922,-17.14785 49.81923,-54.12944 119.91748,-54.12944c70.09828,0 92.33431,52.24684 92.71098,63.68229c0.37668,11.43546 15.54323,95.59455 -110.04952,98.5153c-125.59274,2.92076 -133.05859,-117.84784 -125.37762,-161.77671c7.68097,-43.92886 36.86415,-78.24429 81.75689,-89.26691c44.89274,-11.02262 93.82793,-13.2191 129.39571,-1.23963c46.97165,17.53627 66.6736,41.62498 76.0719,91.27792c9.3983,49.65294 -1.23446,74.64481 -16.96843,104.77215c-15.73397,30.12732 -19.06387,64.73514 -121.83811,57.75174"}}, "dead": {"scale": 0.09, "fill":"845335", "d":"m190.88308,71.11615c-84.02814,-52.35866 -172.05762,0 -138.04623,36.10942c34.01139,36.10942 192.06432,32.49848 218.07303,-1.80547c26.00871,-34.30395 -32.01072,-88.46807 -110.03685,-101.10637c-78.02613,-12.6383 -158.05293,43.3313 -158.05293,88.46807c0,45.13677 -2.00067,308.73552 4.00134,343.03946c6.00201,34.30395 118.03953,68.60789 182.06097,57.77507c64.02144,-10.83283 88.02948,-34.30395 96.03216,-45.13677c8.00268,-10.83283 24.00804,-364.70511 -6.00201,-389.98171c-30.01005,-25.27659 -74.02479,-37.91489 -74.02479,-39.5398"}, "none": {"scale": 0.09, "fill":"E0D1C5", "d": "m7.44019,293.80132c-45.43813,-187.79474 236.27827,-293.42928 283.9883,-84.50763c47.71003,208.92165 -238.55018,272.30237 -283.9883,84.50763z"}}

const LandPlot = ({content, bdScore, bdCategory, hide, devMode}) => {
    /**
     * This component represents the plot of land that shall be rendered
     * on the screen. This land displays growth of plants and changes in
     * composition of the land over time. Behind the hood, this visualization
     * is a scatter plot.
     * @param content: The entity in each spot in the land. This may also be null.
     * @param bdScore: Biodiversity score.
     * @param dbCategory: Biodiversity category.
     * @param hide: Whether to show biodiveristy related data or not.
     * @param getTreeCount: Function that returns the count of all trees on land.
     * @return: Dynamic land UI component.
     */

    const helpData = [
        ["heading", "LAND"], ["paragraph", "Your land has 36 spots arranged in a 6 x 6 grid. Each of these 36 spots may either contain a tree or nothing. Hover over land content to view its type"], ["image", "help/land_1.png"], ["paragraph", "Trees in this microworld are of 2 types, CONIFEROUS (triangular symbols) and DECIDUOUS (circular symbols). At any given time, a tree may be in one of 6 possible life stages: SEEDLING, SAPLING, MATURE, OLD GROWTH, SENESCENT and DEAD. A spot on the land is empty if there is no tree there. Each spot can have at most one live tree. The following image shows the different symbols used to represent “empty land spot” as well as trees of varying type and age."], ["image", "help/tree_1.png"], ["paragraph", "New trees spawn either naturally as they reproduce or if you decide to plant a tree in an empty spot. During reproduction, a parent tree can give rise to new seedlings of its type at one free spot adjacent to itself. Where there are no free spots or it is not the time for reproduction, it does not occur."], ["paragraph", "Trees that die naturally, remain on land as dead wood for a while until it decays. This decay also releases some CO2 into the air."], ["paragraph", "The primary differences among the two types of trees are as follows."], ["table", <table key="coniferous_defiduous_diff"><tr><th>CONIFEROUS</th><th>DECIDUOUS</th></tr><tr><td>1. Slightly slower growth rate (meters grown per year) = 0.7 m/s.</td><td>1. Slightly faster growth rate (meters grown per year) = 0.9 m/s.</td></tr><tr><td>2. Taller. Max height = 70 m.</td><td>2. Shorter. Max height = 40 m.</td></tr><tr><td>3. Longer reproduction interval. Reproduces every 2.5 years.</td><td>3. Shorter reproduction interval. Reproduces every year.</td></tr><tr><td>4. Wood is less dense at 600kg/m3.</td><td>4. Wood is denser at 700kg/m3.</td></tr><tr><td>5. Evergreen. So, absorbs a lesser amount of carbon for maintenance.</td><td>5. Foliage changes in accordance with seasons. Sheds leaves in Autumn and regains them in Spring.</td></tr><tr><td>6. Lives longer.</td><td>6. Shorter lived.</td></tr></table>]
    ]
    if (!hide) { // If biodiversity score is to be shown.
        helpData.push(["paragraph", "The land has an associated BIODIVERSITY SCORE computed based on how much variety of species there is in the forest. Mixed forests with both types of trees and trees of varying ages have been shown to support more life. Thus, such forests here, have a greater biodiversity score. This score lies in the range 0 to 1."])
        helpData.push(["paragraph", "The land is classified based on these scores as follows."])
        helpData.push(["image", "help/biodiversity_1.png"])
        helpData.push(["paragraph", "Both the score and classification at every point in the simulation is displayed at the top of the land panel."])
        helpData.push(["image", "help/biodiversity_2.png"])
        helpData.push(["paragraph", "More biodiverse forests have also been shown to be more resilient. Hence, in this microworld, higher biodiversity scores are linked to lower impact on a tree's health due to stress."])
    }

    const refSvg = useRef()
    const [showBd, setShowBd] = useState(!hide)
    const [showTreeLabel, setShowTreeLabel] = useState(false)
    const [treeLabel, setTreeLabel] = useState("Tree Label")

    const getRenderProperties = (x, y, entity) => {
        /** Returns properties of the path that is to be the icon
         *  to represent given entity.
         *  @param x: The index of the row of this entity.
         *  @param y: The index of the columns of this entity.
         *  @param entity: This entity object or null.
         *  @param devMode: Whether the app is running in developer mode.
         *  @return: Properties returned includes fill color, 
         *           position x, position y, d and scale.
         */
        if (entity == null) {
            const svgIcon = svgIcons.none
    
            return {
                x: x, y: y,
                scale: svgIcon.scale,
                fill: `#${svgIcon.fill}`,
                d: svgIcon.d,
                label: "Empty Land"
            }
        } else { // Entity is a tree.
            let svgIcon = svgIcons[entity.lifeStage]
            if (entity.treeType in svgIcon) {
                svgIcon = svgIcon[entity.treeType]
            }
            const treeType = entity.treeType.charAt(0).toUpperCase() + entity.treeType.slice(1)
            let treeLifeStage = entity.lifeStage.split("_")
            for(let i=0; i<treeLifeStage.length; i++) {
                let val = treeLifeStage[i]
                treeLifeStage[i] = val.charAt(0).toUpperCase() + val.slice(1)
            }
            treeLifeStage = treeLifeStage.join(" ")
    
            let label = `${treeLifeStage} ${treeType}`
            if (treeLifeStage != "Dead") label += ` (Age = ${entity.age})`
            if (devMode) label += ` (Stress = ${entity.stress})`
    
            return {
                x: x, y: y,
                scale: svgIcon.scale,
                fill: `#${svgIcon.fill}`,
                d: svgIcon.d,
                label: label
            }
        }
    }

    useEffect(() => {
        // Initializes SVG elements.

        // Get SVG and it's dimensions.
        svg = d3.select(refSvg.current)
        widthSvg = Number(svg.style('width').replace('px', ''))
        heightSvg = Number(svg.style('height').replace('px', ''))
        margins = {
            left: 15, right: 0,
            top: 5, bottom: 0
        }
        widthPlot = widthSvg - margins.left - margins.right
        heightPlot = heightSvg - margins.top - margins.bottom

        // Group that contains the whole plot.
        gPlot = svg.selectAll('.group-plot')
                    .data(['g'])
                    .join('g')
                    .attr('class', 'group-plot')
                    .attr('width', widthPlot)
                    .attr('height', heightPlot)
                    .attr('transform', `translate(${margins.left}, ${margins.top})`)

        // Define groups that shall contain the x and y axes of this scatter plot.
        gXAxis = gPlot.selectAll('.group-x-axis')
                    .data(['g'])
                    .join('g')
                    .attr('class', 'group-x-axis')
                    .attr('transform', `translate(${0}, ${heightPlot+margins.top})`)
        gXAxis.attr("opacity", "0")
        gYAxis = gPlot.selectAll('.group-y-axis')
                    .data(['g'])
                    .join('g')
                    .attr('class', 'group-y-axis')
                    .attr('transform', `translate(${margins.left}, ${0})`)
        gYAxis.attr("opacity", "0")
        
        // Set the scale of both x and y axes.
        scaleX = d3.scaleBand()
                    .domain(d3.range(size.rows))
                    .range([0, widthSvg])
        scaleY = d3.scaleBand()
                    .domain(d3.range(size.columns))
                    .range([heightSvg, 0])
        gXAxis.call(d3.axisBottom(scaleX))
        gYAxis.call(d3.axisLeft(scaleY))

        gContent = gPlot.selectAll('.group-land-content')
                        .data(['g'])
                        .join('g')
                        .attr('class', 'group-land-content')
    }, [])

    useEffect(() => {
        // Get latest content to render.
        let contentToRender = []
        for (let i = 0; i < size.rows; i++) {
            for (let j = 0; j < size.columns; j++) {
                contentToRender.push(getRenderProperties(i, j, content[i][j]))
            }
        }

        // Add land content.
        let landContent = gContent.selectAll('.land-content')
                                .data(contentToRender)
                                .join('path')
                                .attr('class', 'land-content')
                                .attr('fill', d => d.fill)
                                .attr('stroke', '#000')
                                .attr('stroke-width', 8)
                                .attr('transform', d => `
                                    translate(${scaleX(d.x)}, ${scaleY(d.y)})
                                    scale(${d.scale})
                                `)
        landContent.transition()
                .duration(50)
                .attr('d', d => d.d)
        landContent.on("mouseover", (e, d) => {
                        setTreeLabel(d.label)
                        setShowTreeLabel(true)
                    })
                    .on("mouseout", (e, d) => {
                        setShowTreeLabel(false)
                    })
    }, [content])

    useEffect(() => {
        setShowBd(!hide)
    }, [hide])


    return (
        <Help helpData={helpData} page="world">
            <div className="pt-5 land-plot">
                {/* BIODIVERSITY */}
                {showBd && <div className='flex justify-between gap-2'>
                    <div className='flex'>
                        <p className='text-[#6E6E6E] mr-2'>Class:</p> 
                        <p>{bdCategory}</p>
                    </div>
                    <div className='flex'>
                        <p className='text-[#6E6E6E] mr-2'>Biodiversity:</p> 
                        <p>{bdScore}</p>
                    </div>
                </div>}
                {/* LAND CONTENT */}
                <div className="pt-2">
                    {/* ICONS */}
                    <svg style={{height:"350px", width:"400px"}} ref={refSvg}></svg>
                    {/* LABEL */}
                    <div className="text-center" style={{
                        opacity: Number(showTreeLabel),
                        transition: "opacity 0.5s"
                    }}>{treeLabel}</div>
                </div>
            </div>
        </Help>
    )
}

export default LandPlot

