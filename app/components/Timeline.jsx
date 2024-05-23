"use client"

import * as d3 from "d3"
import Button from "./Button"
import React, { useEffect, useRef, useState } from "react"

const Timeline = ({curTime, timeRange, unit, window}) => {
    /**
     * Displays a timeline of given time range such that 
     * time is displayed a window at a time. One may 
     * move from one time window to another.
     * @param curTime: The current time step.
     * @param timeRange: The [min, max] time to be displayed.
     * @param unit: A string that says what the unit of the time line is.
     * @param window: No. of timesteps to display at a time.
     * @return: Timeline component.
     */
    const refSvg = useRef()

    const [curWindow, setCurWindow] = useState(d3.range(timeRange[0], timeRange[0]+window+1))
    const [timeNow, setTimeNow] = useState(curTime)

    const shiftWindow = (direction) => {
        /** Shifts time window to the left/right. */
        if (direction == "left") {
            
        } else { // (direction == "right")
            console.log("shift window right")
        }
    }

    useEffect(() => {
        // Get SVG and it's dimensions.
        const svg = d3.select(refSvg.current)
        const widthSvg = Number(svg.style('width').replace('px', ''))
        const heightSvg = Number(svg.style('height').replace('px', ''))
        const margins = { left: 10, right: 10, top: 0, bottom: 0 }
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

        // Define groups that shall contain the x axis of this timeline plot.
        const gXAxis = gPlot.selectAll('.group-x-axis')
                            .data(['g'])
                            .join('g')
                            .attr('class', 'group-x-axis')
                            .attr('transform', `translate(${0}, ${(heightPlot/2)-2.5})`)
        gXAxis.select("path").attr("opacity", 0)
        gXAxis.selectAll(".tick")
            .select("text").attr("opacity", 0)
        gXAxis.selectAll(".tick")
            .select("line")
            .attr("stroke", d => d == timeNow ? "#FF0000" : "#CCCCCC")
            .attr("stroke-width", 8)
            .attr("stroke-linecap", "round")
            .attr("class", d => d != timeNow ? "hover:stroke-orange-300" : "")
            .on("click", (e, d) => {
                setTimeNow(prevVal => d)
            })
        
        // Set the scale of both x and y axes.
        const scaleX = d3.scaleBand()
                        .domain(curWindow)
                        .range([0, widthPlot])
        gXAxis.call(d3.axisBottom(scaleX))

    }, [curWindow, timeNow])

    return (
        <div className="timeline p-2 flex gap-1">
            <Button bgColor="#F2EAD5" onClick={() => shiftWindow("left")}>
                <span className="h-8 px-1">◀</span>
            </Button>
            <svg ref={refSvg} className="w-full bg-white h-8 rounded-full"></svg>
            <Button bgColor="#F2EAD5" onClick={() => shiftWindow("right")}>
                <span className="h-8 px-1">▶</span>
            </Button>
        </div>
    )
}

export default Timeline