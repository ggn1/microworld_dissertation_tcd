"use client"

import * as d3 from "d3"
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
const svgIcons = JSON.parse(process.env.NEXT_PUBLIC_LAND_ICONS_SVG)

const getRenderProperties = (x, y, entity) => {
    /** Returns properties of the path that is to be the icon
     *  to represent given entity.
     *  @param x: The index of the row of this entity.
     *  @param y: The index of the columns of this entity.
     *  @param entity: This entity object or null.
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

        return {
            x: x, y: y,
            scale: svgIcon.scale,
            fill: `#${svgIcon.fill}`,
            d: svgIcon.d,
            label: `${treeLifeStage} ${treeType} `
        }
    }
}

const LandPlot = ({content, bdScore, bdCategory, hide}) => {
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
    const refSvg = useRef()
    const [show, setShow] = useState(!hide)
    const [showTreeLabel, setShowTreeLabel] = useState(false)
    const [treeLabel, setTreeLabel] = useState("Tree Label")
    let treeCounts = {}

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
                    .attr('opacity', 0)
                    .attr('class', 'group-x-axis')
                    .attr('transform', `translate(${0}, ${heightPlot+margins.top})`)
        gYAxis = gPlot.selectAll('.group-y-axis')
                    .data(['g'])
                    .attr('opacity', 0)
                    .join('g')
                    .attr('class', 'group-y-axis')
                    .attr('transform', `translate(${margins.left}, ${0})`)
        
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
                    .on("mouseout", () => {
                        setShowTreeLabel(false)
                    })
    }, [content])

    useEffect(() => {
        setShow(!hide)
    }, [hide])


    return (
        <div>
            {show && <div className='flex justify-between gap-2'>
                <div className='flex'>
                    <p className='text-[#6E6E6E] mr-2'>Class:</p> 
                    <p>{bdCategory}</p>
                </div>
                <div className='flex'>
                    <p className='text-[#6E6E6E] mr-2'>Biodiversity:</p> 
                    <p>{bdScore}</p>
                </div>
            </div>}
            <div className="pt-2">
                <svg style={{height:"350px", width:"400px"}} ref={refSvg}></svg>
                <div className="text-center" style={{
                    opacity: Number(showTreeLabel),
                    transition: "opacity 0.5s"
                }}>{treeLabel}</div>
            </div>
        </div>
    )
}

export default LandPlot

