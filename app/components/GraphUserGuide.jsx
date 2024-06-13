"use client"

import * as d3 from "d3"
import React, { useEffect, useRef } from "react"

const GraphUserGuide = ({handleTopicSelection}) => {
    /**
     * An interactive map that learners can use to explore 
     * each feature of the app.
     * @param handleContent: Function that is used to pass 
     *                       selected content to the parent.
     */
    const refSvg = useRef()

    const nodes = [
        { id: 0, content: [["heading", "WORLD"], ["paragraph", "This microworld is an oversimplified model of no single forest on Earth. It's an abstract representation of all of them and captures multiple general rules observed in nature with numbers inspired from real world figures."]] },
        { id: 1, content: [["heading", "TIME"],["paragraph", "The unit of time in this microworld is Year"], ["paragraph", "The TIMELINE may be used to move to different points in time in the simulation."], ["image", "help/time1.png"], ["paragraph", "Clicking the PLAY BUTTON runs the simulation. As the simulation plays, current year in the microworld is updated with every timestep. The number in the display changes to reflect this. Once clicked, the play button changes to a PAUSE BUTTON which may be clicked to pause the simulation. Clicking the RESET BUTTON restores the simulation to the initial state at year 0."], ["image", "help/time2.png"], ["paragraph", "In the TEXTBOX, you may type in any year within simulation range (0 to 300 years) and the microworld jumps to that point in time. Upon entering some input, the play/pause and reset buttons change to a CONFIRM BUTTON and CANCEL BUTTON as shown above. Clicking the confirm button applies the change to the year and cancel prevents this. If input is invalid (not an integer in the allowed range) then the input box turns red to indicate this and the change will not be applied even upon confirmation."]] },
        { id: 2, content: [["heading", "ENVIRONMENT"],["paragraph", "The environment is comprised of your piece of land and carbon reservoirs. The term 'carbon reservoir' simply means 'a location that can hold carbon compounds'."]] },
        { id: 3, content: [["heading", "TARGETS"],["paragraph", "You may set yourself targets as part of challenges. These are displayed in the TARGETS panel as follows."], ["image", "help/targets1.png"], ["paragraph", "Target CO2 concentration below which atmospheric CO2 levels must never dip as well as the minimum amount of income you’d like to gain each rotation can be set."], ["paragraph", "Failing to meet one or more of the targets indicates that you need to try again after tweaking your plan and/or settings."], ["paragraph", "Clicking on the EVALUATE SWITCH toggles it ON and OFF. Turning it ON allows you to visualize whether targets are being met. You may want to turn it OFF when experiment with ideas. If a target is met, then the corresponding SUCCESS CONDITION gains a green border. If that condition has failed, it turns red."], ["image", "help/targets2.png"]] },
        { id: 4, content: [["heading", "INCOME STREAMS"], ["paragraph", "There are 3 possible ways of generating income."], ["paragraph", "1. TIMBER: Trees may be felled and sold to generate income. Trees sell for 0.3 Barcons per Kg. Availability of this resource depends on how often and what trees are felled as part of your plan. 50% of the sold timber is burned to generate energy and the remaining 50% is used as lumber. All the carbon in the amount of wood burned gets immediately released back into the atmosphere (vegetation reservoir to air reservoir). The carbon in the lumber gets locked away (vegetation reservoir to lumber reservoir)."], ["paragraph", "2. NON-TIMBER FOREST PRODUCTS (NTFP): Resources like honey, mushrooms, and berries may be foraged from the forest and sold. Availability of this resource is less reliable and is directly proportional to the biodiversity score as well as amount of deadwood in the forest (mushrooms thrive on dead wood). That is, if biodiversity is high, then availability is also likely high. These products sell for 14 Barcons per Kg. Harvesting these resources, however, requires employing help. Thus, this income stream incurs a maximum maintenance cost of 600k Barcons per year."], ["paragraph", "3. RECREATION: Infrastructure such as roads, benches, cafés, signs, etc. can be built. This results in a fixed one-time cost of 240k Barcons. Managing the facility also requires a work force and hence incurs a maximum annual maintenance cost of 640k Barcons. Availability of people visiting the forest to engage in recreational activities is also subject to fluctuation and is directly proportional to the biodiversity score. Each visitor pays 5 Barcons."], ["image", "help/income_streams_1.png"]] },
        { id:5, content:[["heading", "BANK BALANCE"],["paragraph", "The currency (fictional) in this microworld is 'Barcon'."], ["paragraph", "Your total bank balance at every time step is displayed on the screen as follows. The symbol 'M' here, stands for million. Similarly, money related values in the thousands, are represented using the symbol 'k'."], ["image", "help/bank_balance_1.png"]] },
        { id:6, content:[["heading", "INCOME DEPENDENCY"],["paragraph", "It is also possible to set DEPENDENCY on each income stream using DEPENDENCY SLIDERS on the planning page. Total dependency will always amount to 100%. You may click on the circle next to a slider to lock its value in place."], ["image", "help/income_dependency_1.png"], ["paragraph", "If dependency on the 3 streams is set to be 60%, 30%, and 10% for Timber, NTFP and Recreation respectively, then this means that you’re expecting 60% of your target income per rotation to come from timber, 30% to come from NTFPs and 10% to come from forest recreation. The cost of maintenance and returns from the NTFP and Recreation income streams is scaled based on dependency set."], ["paragraph", "Upon tweaking dependency, corresponding expected sales per rotation for each income stream is updated in the EXPECTED ROTATION INCOME PANEL on the planning page."], ["image", "help/income_dependency_2.png"]] },
        { id:7, content:[["heading", "CARBON RESERVOIRS"],["paragraph", "In this microworld, there are 5 carbon reservoirs. Amount of carbon in all these reservoirs are expressed in Gigatons (Gt) of Carbon (1 Gt = 1012 kg)."], ["paragraph", "1. VEGETATION: The plants on land sequester carbon dioxide (CO2) from the atmosphere. Carbon sequestration refers to the process through which CO2 is removed from the atmosphere and held in solid or liquid form."], ["paragraph", "2. SOIL: The soil holds carbon in the form of organic material (plant/animal remains, microbes, etc.) or minerals."], ["paragraph", "3. LUMBER: This is a man-made reservoir. It refers to all wood that's preserved in use (furniture, construction, etc.) and not burned for energy. When we preserve wood, we significantly slow down its breakdown and re-entry into the carbon cycle via natural decay."], ["paragraph", "4. FOSSIL FUELS: Fossil fuels refer to energy dense coal, oil and gas trapped deep within the earth's surface that can be extracted and burned to generate heat to drive electricity production, machine operation, and more. These hydrocarbons (combinations of Hydrogen (H) + Carbon (C)) were formed from organic matter compressed over millions of under immerse heat and pressure, deep in the belly of planet Earth. So, unless you're willing to wait for another million years, fossil fuels, as we know it, are non-renewable."], ["paragraph", "5. AIR: Natural processes like respiration and anthropogenic (human generated) ones like burning of wood or fossil fuels, and so on, release carbon into the atmosphere in gaseous form, of which a large part is CO2. CO2 is a greenhouse gas that traps heat within the atmosphere and keeps the planet toasty. Mars has too little CO2. Venus has too much. On Earth, it's just right. Mars and Venus are both thought to have started out much like earth with similar conditions."], ["paragraph", "The amount of carbon in each reservoir at every time step is displayed in the CARBON PANEL as follows."], ["image", "help/carbon_reservoirs_1.png"]] },
        { id:8, content:[["heading", "AIR"], ["paragraph", "Atmospheric CO2 concentration is expressed in Parts Per Million (ppm). This is the standard."], ["paragraph", "Unlike Gt, which is a measure of weight or mass, ppm is a measure of the concentration of a substance in a solution or gas. It is a proportion, just like percent. 80 percent is 80 parts out of 100. 80 ppm is 80 parts out of 1,000,000. Here, this indicates the number of parts of CO2 per 1 million parts of the total air in the atmosphere."], ["paragraph", "CO2 concentrations in the world have been organized into an easy-to-read scale as shown below. Associated with each band in the scale, is a label that is indicative of the expected quality of life for humans at that level of atmospheric CO2 concentration after considering corresponding climate change."], ["image", "help/air_1.png"], ["image", "help/air_2.png"], ["paragraph", "In the microworld, current levels of CO2 at each point in the simulation shall be displayed as shown below. The number within the colored tile is the current concentration. Hovering over each tile, reveals its range and quality of life label."], ["image", "help/air_3.png"]]},
        { id:9, content:[["heading", "FOSSIL FUELS"], ["paragraph", "On Earth, humans burn fossil fuels for energy. In the year 2023, this led to an addition of around 9.95 Gt of carbon to the atmosphere."], ["paragraph", "In this microworld, such annual emissions due to burning of fossil fuels may be set using the FOSSIL FUEL USAGE setter as shown below. Any valid positive real number may be entered into the text field (invalid entry results in text turning red and no updates made to the value in the simulation) and that many Gt of C will move from the fossil fuels carbon reservoir to air with each time step."], ["image", "help/fossil_fuels_1.png"]]},
        { id:10, content:[["heading", "LAND"], ["paragraph", "Your land can contain up to 36 trees arranged in a 6 x 6 grid as shown below. Each of the 36 spots may either contain a tree or nothing."], ["image", "help/land_1.png"]]},
        { id:11, content:[["heading", "TREE"], ["paragraph", "Trees in this microworld may be of 2 types, CONIFEROUS and DECIDUOUS. The primary differences among the two are as follows."], ["table", <table key="coniferous_defiduous_diff"><tr><th>CONIFEROUS</th><th>DECIDUOUS</th></tr><tr><td>1. Slightly slower growth rate (meters grown per year) = 0.7 m/s.</td><td>1. Slightly faster growth rate (meters grown per year) = 0.9 m/s.</td></tr><tr><td>2. Taller. Max height = 70 m.</td><td>2. Shorter. Max height = 40 m.</td></tr><tr><td>3. Longer reproduction interval. Reproduces every 2.5 years.</td><td>3. Shorter reproduction interval. Reproduces every year.</td></tr><tr><td>4. Wood is less dense at 600kg/m3.</td><td>4. Wood is denser at 700kg/m3.</td></tr><tr><td>5. Evergreen. So, sequesters lesser carbon for maintenance.</td><td>5. Foliage changes in accordance with seasons. Sheds leaves in Autumn and regains them in Spring.</td></tr><tr><td>6. Remains a seedling for 4 years.</td><td>6. Remains a seedling for 3 years.</td></tr><tr><td>7. Remains a sapling for 22 years.</td><td>7. Remains a sapling for 18 years.</td></tr><tr><td>8. Matures at the age of 26 years.</td><td>8. Matures at the age of 21 years.</td></tr><tr><td>9. Enters the old growth stage of life at the age of 60.</td><td>9. Enters the old growth stage of life at the age of 47.</td></tr><tr><td>10. Enters the senescent stage of life at the age of 90.</td><td>10. Enters the senescent stage of life at the age of 70.</td></tr><tr><td>11. Lives longer. Dies at the age of 100.</td><td>11. Shorter lived. Dies at the age of 80.</td></tr></table>], ["paragraph", "Any tree on land may be at one of the following 6 life stages at any every given timestep: SEEDLING, SAPLING, MATURE, OLD GROWTH, SENESCENT and DEAD. A spot on the land is empty if there is no tree there. Each spot can have at most one live tree."], ["paragraph", "The following images shows the different symbols used to represent “no tree” as well as trees of varying type and age."], ["image", "help/tree_1.png"], ["paragraph", "Trees are under STRESS due to both environmental factors (CO2 concentration in the atmosphere) and age. When conditions are favorable, they recover from this stress. Trees die when stress rises beyond a certain threshold. Seedlings and Saplings are more impacted by environmental stressors (stress builds quicker)."], ["paragraph", "Dead wood, if not harvested, remains on land for a while until it DECAYs."], ["paragraph", "Trees can REPRODUCE in the mature and old growth stages. During this time, a parent tree can give rise to new seedlings of its type at a spot immediately adjacent to itself (up, down, left, right, top, left, top right, bottom left, bottom right)."]]},
        { id:12, content:[["heading", "BIODIVERSITY"], ["paragraph", "The land has an associated BIODIVERSITY SCORE computed based on how much variety there is. Mixed forests with both types of trees and trees of varying ages boasts have been shown to support more life. Thus, such forests here, have a greater biodiversity score. This score lies in the range 0 to 1 with 1."], ["paragraph", "The land is classified based on these scores as follows."],  ["image", "help/biodiversity_1.png"], ["paragraph", "Both the score and classification at every point in the simulation is displayed on the BIODIVERSITY PANEL as shown below."], ["image", "help/biodiversity_2.png"], ["paragraph", "More biodiverse forests have also been shown to be more resilient. Hence, in this microworld, higher biodiversity scores are linked to lower impact on a tree's health due to stress."]]},
        { id:13, content:[["heading", "MANAGEMENT"], ["paragraph", "Possible forest management actions include cutting down (felling) trees or planting them. Trees may be felled or planted every X no. of years. This X is the ROTATION PERIOD. Management actions such as FELL and PLANT may be scheduled at the end of each ROTATION."], ["paragraph", "This type of planning in rotations mimics real world practices. In agriculture and forestry harvests are often planned in rotations. A rotation is thus defined as 'the number of years between the formation or regeneration of a crop and its harvest'."],  ["paragraph", "Planning can be done using the planner that may be accessed via clicking the PLAN button within the PLAN VIEWER PANEL."], ["image", "help/management_1.png"], ["paragraph", "The plan viewer displays planned actions. It also shows the current rotation period on the top left (ROTATION PERIOD DISPLAY)."], ["paragraph", "Once a plan has been drafted. Actions that were most recently processed as well as the associated year is displayed under Previous Actions. Similarly, actions to be processed next along with the corresponding year, are displayed under Upcoming Actions. These action tags are horizontally scrollable if there are more of them than can fit within the view frame."], ["paragraph", "Clicking on the plan button will take you to the PLANNING PAGE. Here you will find the MANAGEMENT ACTION PLANNER as shown below."], ["image", "help/management_2.png"], ["paragraph", "The HOME BUTTON can be clicked to return to the home page."], ["paragraph", "Here, rotation period can be set by changing the value within the ROTATION PERIOD TEXT BOX. Invalid entries (integers ≤0, integers ≥ max no. of simulated years = 300, negative numbers, floating point numbers, input containing characters other than numbers) is highlighted in red and will not lead to an update of the rotation period value."], ["paragraph", "The blue year tags represent years at the beginning of each rotation as per set rotation period. This view frame is also horizontally scrollable. ACTION TAGS associated with actions added using the ACTION PICKER will appear under their corresponding year tags. These action tags under each year tag are vertically scrollable in case of view frame overflow."], ["paragraph", "Clicking an action tag, selects it. Clicking a selected action tag, deselects it. Multiple tags may be selected at once. Selected actions may then be deleted by clicking the DELETE BUTTON. Double clicking the DELETE BUTTON deletes all planned actions."], ["paragraph", "Clicking the SAVE BUTTON saves the current state of microworld along with the latest plan and other settings."], ["paragraph", "The UPLOAD BUTTON can be used to load previously saved states."], ["image", "help/management_3.png"], ["paragraph", "If rotation period is changed when previously planned actions exist for out-of-rotation years, then such years are highlighted in red suggesting that actions associated with them falls outside selected rotation period and thus should be deleted. If not deleted, they get processed."], ["image", "help/management_4.png"], ["paragraph", "An action tag displays information about the corresponding action and its execution status as shown below."], ["paragraph", "If an action was successfully executed for all no. of the specified type of tree, then execution status is green. If it was only possible to execute this action for a fraction of the originally specified no of trees, then the status is yellow indicating that this action was executed for how many ever trees as was available on land at the time, although that was lesser than the specified count. A red status indicates that the action could not be executed at all (perhaps because there was no instance of the given tree type and age on land)."], ["image", "help/management_5.png"], ["paragraph", "It’s the action picker that facilitates the addition of a new action to the plan."], ["image", "help/management_6.png"], ["paragraph", "To add a new action, first, the type of action must be selected. Then, the tree to apply that action to, must be selected. Finally, the maximum no. of trees to be affected as well as the year this action should be executed in, should be set using the text boxes."], ["paragraph", "If invalid numbers are entered into these text boxes, then the change is not applied and the text turns red."], ["paragraph", "If the REPEAT option is turned on, then this means that the picked action will be performed every rotation starting from the year associated with the picked action."], ["paragraph", "Once happy with the settings, clicking the ADD BUTTON adds a new action tag to the plan."], ["paragraph", "FELLING: Only mature, old growth, or senescent trees may be felled. Depending on the size of the tree felled, it can cost up to 3000 Barcons to fell a tree. The income that the felled tree fetches will depend on the wood density of the tree and its size."], ["paragraph", "PLANTING: Irrespective of the life stage chosen from the action picker, upon planting, the tree of chosen type will start out as a seedling. Planting a tree of either type incurs a fixed cost of 277 Barcons. "]]}
    ]
    
    const links = [
        { source: 0, target: 1 }, // World --> Time
        { source: 0, target: 2 }, // World --> Environment
        { source: 0, target: 3 }, // World --> Targets
        { source: 0, target: 4 }, // World --> Income Streams
        { source: 0, target: 5 }, // World --> Bank Balance
        { source: 4, target: 6 }, // Income Streams --> Income Dependency
        { source: 2, target: 7 }, // Environment --> Carbon Reservoirs
        { source: 7, target: 8 }, // Carbon Reservoirs --> Air
        { source: 7, target: 9 }, // Carbon Reservoirs --> Fossil Fuels
        { source: 2, target: 10 }, // Environment --> Land
        { source: 10, target: 11 }, // Land --> Tree
        { source: 10, target: 12 }, // Land --> Biodiversity
        { source: 10, target: 13 }, // Land --> Management
    ]

    useEffect(() => {
        // Initializes SVG elements.

        // Get SVG and it's dimensions.
        const svg = d3.select(refSvg.current)
        const widthSvg = Number(svg.style('width').replace('px', ''))
        const heightSvg = Number(svg.style('height').replace('px', ''))
        const margins = {left: 0, right: 0, top: 0, bottom: 0}
        const widthPlot = widthSvg - margins.left - margins.right
        const heightPlot = heightSvg - margins.top - margins.bottom

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
                                    .distance(100)
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
                            .attr('d', "m27.04747,89.85139c30.77202,-22.90028 139.7732,-144.94998 179.46188,-60.39583c39.68869,84.55416 -55.21904,97.49612 -97.49612,100.08451c-42.27708,2.58839 -132.00802,-20.70714 -103.5357,-29.33512c28.47232,-8.62798 205.34581,-84.55416 258.83925,-78.51457c53.49345,6.03958 -25.02111,-9.14564 -39.25728,-1.12163c-14.23617,8.02401 -228.78406,92.18291 -198.01204,69.28263z")
                            .attr('stroke-width', 2)
                            .attr("stroke", "#000000")
                            .attr('fill', '#A0D58A')
                            .style("scale", "0.2")
        nodePathGroup.attr("transform", d => {
            console.log(d)
            return `rotate(${d.id*2*10})`
        })
        nodePath.on("mouseover", (e) => {
                    d3.select(e.target).attr("fill", "#FFF000")
                })
                .on("mouseout", (e) => {
                    d3.select(e.target).attr("fill", "#A0D58A")
                })
        const nodeText = node.append("text")
                            .attr('fill', '#232323')
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
            handleTopicSelection(d.content)
        })
    }, [])

    return (
        <div className="flex flex-col pb-5 items-center justify-center h-full w-full">
            <svg 
                className="w-full h-full"
                ref={refSvg}
            ></svg>
            <div className="text-[#AAAAAA] text-xs tracking-[0.3em] font-bold">DOUBLE CLICK A TOPIC TO EXPLORE</div>
        </div>
    )
}

export default GraphUserGuide