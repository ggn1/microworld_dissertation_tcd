"use client"

import * as d3 from "d3"
import React, { useEffect, useRef } from "react"

const GraphUserGuide = ({handleTopicSelection, nodes, links}) => {
    /**
     * An interactive map that learners can use to explore 
     * each feature of the app.
     * @param handleContent: Function that is used to pass 
     *                       selected content to the parent.
     * @param nodes: Topics to display.
     * @param links: Links connecting topics.
     */
    const refSvg = useRef()

    useEffect(() => {
        // Initializes SVG elements.

        // Get SVG and it's dimensions.
        const svg = d3.select(refSvg.current)
        const widthSvg = Number(svg.style('width').replace('px', ''))
        const heightSvg = Number(svg.style('height').replace('px', ''))

        // Clear any existing elements
        svg.selectAll('*').remove()

        // Drag behaviour.
        const drag = d3.drag()
                        .on("start", dragStarted)
                        .on("drag", dragged)
                        .on("end", dragEnded)

        function dragStarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.9).restart()
            d.fx = event.x
            d.fy = event.y
        }

        function dragged(event, d) {
            d.fx = event.x
            d.fy = event.y
        }

        function dragEnded(event, d) {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
        }

        // Create simulation with forces.
        const simulation = d3.forceSimulation(nodes)
                            .force(
                                'link', 
                                d3.forceLink(links)
                                    .id(d => d.id)
                                    .distance(120)
                            )
                            .force('charge', d3.forceManyBody().strength(-120))
                            .force("collide", d3.forceCollide(1)) // radius + 1
                            .force(
                                "center", 
                                d3.forceCenter(widthSvg/2, heightSvg/2)
                                .strength(0.01)
                            ).on('tick', ticked)

        // Draw links.
        const link = svg.append('g')
                        .selectAll('line')
                        .data(links)
                        .join('line')
                        .attr('stroke', '#826e58')
                        .attr('stroke-linecap', "round")
                        .attr('stroke-opacity', 0.6)
                        .attr('stroke-width', 3)

        // Draw nodes.
        const node = svg.append("g")
                            .selectAll("g")
                            .data(nodes)
                            .join("g")
        const nodePathGroup = node.append("g")
        const nodePath = nodePathGroup.append("path")
                            .attr('d', d => d.hide ? "" : "m27.04747,89.85139c30.77202,-22.90028 139.7732,-144.94998 179.46188,-60.39583c39.68869,84.55416 -55.21904,97.49612 -97.49612,100.08451c-42.27708,2.58839 -132.00802,-20.70714 -103.5357,-29.33512c28.47232,-8.62798 205.34581,-84.55416 258.83925,-78.51457c53.49345,6.03958 -25.02111,-9.14564 -39.25728,-1.12163c-14.23617,8.02401 -228.78406,92.18291 -198.01204,69.28263z")
                            .attr('stroke-width', 2)
                            .attr("stroke", "#000000")
                            .attr('fill', '#A0D58A')
                            .style("scale", "0.2")
        nodePathGroup.attr("transform", d => {
            return `rotate(${d.id*2*10})`
        })
        nodePath.on("mouseover", (e) => {
                    d3.select(e.target).attr("fill", "#FFF000")
                })
                .on("mouseout", (e) => {
                    d3.select(e.target).attr("fill", "#A0D58A")
                })
        const nodeText = node.append("text")
                            .attr('fill', d => d.hide ? "#826e58": '#232323')
                            .text(d => d.content[0][1])
                            .style("user-select", "none")
                            .style("font-weight", "bold")
        node.call(drag) // Make dragable

        // Update simulation on each tick.
        function ticked() {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y)
            node.attr("transform", d => `translate(${d.x},${d.y})`)
        }

        node.on("dblclick", (e, d, i) => {
            console.log(d)
            handleTopicSelection(d.content)
        })
    }, [nodes, links])

    return (
        <div className="flex flex-col py-5 items-center justify-center h-full w-full">
            <div className="text-[#AAAAAA] text-xs tracking-[0.3em] font-bold">
                CLICK & DRAG LEAVES
            </div>
            <svg 
                className="w-full h-full"
                ref={refSvg}
            ></svg>
            <div className="text-[#AAAAAA] text-xs tracking-[0.3em] font-bold">
                DOUBLE CLICK ON A LEAF TO EXPLORE
            </div>
        </div>
    )
}

export default GraphUserGuide