"use client"

import * as d3 from "d3"
import React, { useEffect, useRef } from "react"

const svgIcons = JSON.parse(process.env.NEXT_PUBLIC_LAND_ICONS_SVG)
console.log("svgIcons =", svgIcons)

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
            d: svgIcon.d
        }
    } else { // Entity is a tree.
        let svgIcon = svgIcons[entity.getLifeStage()]
        if (entity.treeType in svgIcon) {
            svgIcon = svgIcon[entity.treeType]
        }
        return {
            x: x, y: y,
            scale: svgIcon.scale,
            fill: `#${svgIcon.fill}`,
            d: svgIcon.d
        }
    }
}

const LandPlot = ({size, content}) => {
    /**
     * This component represents the plot of land that shall be rendered
     * on the screen. This land displays growth of plants and changes in
     * composition of the land over time. Behind the hood, this visualization
     * is a scatter plot.
     * @param size: Dimensions of the land in the format {
     *                  "rows":<<Integer>>, 
     *                  "columns": <<Integer>>
     *              }
     * @param content: The entity in each spot in the land. This may also be null.
     * @return: Dynamic land UI component.
     */
    const refSvg = useRef()
    const contentToRender = []
    for (let i = 0; i < size.rows; i++) {
        for (let j = 0; j < size.columns; j++) {
            contentToRender.push(getRenderProperties(i, j, content[i][j]))
        }
    }

    useEffect(() => {
        // Get SVG and it's dimensions.
        const svg = d3.select(refSvg.current);
        const widthSvg = Number(svg.style('width').replace('px', ''));
        const heightSvg = Number(svg.style('height').replace('px', ''));
        const margins = {
            left: widthSvg/(size.rows*2+1), right: 0,
            top: heightSvg/(size.columns*2+1), bottom: 0
        };
        const widthPlot = widthSvg - margins.left - margins.right;
        const heightPlot = heightSvg - margins.top - margins.bottom;

        // Group that contains the whole plot.
        const gPlot = svg.selectAll('.group-plot')
                        .data(['g'])
                        .join('g')
                        .attr('class', 'group-plot')
                        .attr('width', widthPlot)
                        .attr('height', heightPlot)
                        .attr('transform', `translate(${margins.left}, ${margins.top})`);

        // Define groups that shall contain the x and y axes of this scatter plot.
        const gXAxis = gPlot.selectAll('.group-x-axis')
                            .data(['g'])
                            .join('g')
                            .attr('opacity', 0)
                            .attr('class', 'group-x-axis')
                            .attr('transform', `translate(${0}, ${heightPlot})`)
        const gYAxis = gPlot.selectAll('.group-y-axis')
                            .data(['g'])
                            .attr('opacity', 0)
                            .join('g')
                            .attr('class', 'group-y-axis')
        
        // Set the scale of both x and y axes.
        const scaleX = d3.scaleBand()
                        .domain(d3.range(size.rows))
                        .range([0, widthPlot])
        const scaleY = d3.scaleBand()
                        .domain(d3.range(size.columns))
                        .range([heightPlot, 0])
        gXAxis.call(d3.axisBottom(scaleX))
        gYAxis.call(d3.axisLeft(scaleY))

        // Add land content.
        const gContent = gPlot.selectAll('.group-land-content')
                            .data(['g'])
                            .join('g')
                            .attr('class', 'group-land-content');
        gContent.selectAll('.land-content')
            .data(contentToRender)
            .join('path')
            .attr('class', 'tree')
            .attr('fill', d => d.fill)
            .attr('stroke', '#000')
            .attr('stroke-width', 8)
            .attr('transform', d => `
                translate(${scaleX(d.x)}, ${scaleY(d.y)})
                scale(${d.scale})
            `)
            .transition()
            .duration(50)
            .attr('d', d => d.d);
    }, [])

    return (
        <svg className="w-full h-full" ref={refSvg}>
            
        </svg>
    )
}

export default LandPlot

