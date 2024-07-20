"use client"

import { useEffect, useState } from 'react'
import PopUp from '../components/PopUp'
import { useRouter } from 'next/navigation'
import GraphUserGuide from '../components/GraphUserGuide'
import { challenge } from '../world/page'

export const getHelpJsxContent = (data) => {
    /**
     * Given data, returns a list of 
     * components to render as help.
     * @param data: A list containing 2 item lists
     *              such that the first item is the 
     *              type of content ("heading", "paragraph", 
     *              "image") and the second item is 
     *              the content itself.
     */
    let toRender = []
    for (const d of data) {
        if (d[0] == "heading") {
            toRender.push(
                <div className='font-bold text-2xl text-center'>
                    {d[1]}
                </div>
            )
        } else if (d[0] == "paragraph") {
            toRender.push(
                <div>
                    {d[1]}
                </div>
            )
        } else if (d[0] == "image") {
            toRender.push(
                <div className='flex items-center justify-center'>
                    <img src={d[1]}/>
                </div>
            )   
        } else if (d[0] == "table") {
            toRender.push(
                <div className='flex items-center justify-center'>
                    {d[1]}
                </div>
            )   
        }
    }
    return toRender
}

const Help = () => {
    const router = useRouter()
    const [popUpContent, setPopUpContent] = useState("")
    const [nodes, setNodes] = useState([])
    const [links, setLinks] = useState([])

    const setNodesLinks = (challengeNum) => {
        /** 
         * Given the challenge number, returns relavent nodes 
         * and links.
         * @param challengeNum: A number indicating which challenge 
         *                      the world is set to.
         */
        let nodesNew = []
        let linksNew = []
        if ([0, 1, 2, 3, 4, 5].includes(challengeNum)) {
            nodesNew = [
                { id: 0, content: [["heading", "WORLD"], ["paragraph", "This microworld contains a single forest. You are now the owner of this forest. The forest helps keep CO2 levels in the air in check and also acts as a source of wood."]] },
                { id: 1, content: [["heading", "TIME"],["paragraph", "The unit of time in this microworld is Year"], ["paragraph", "The TIMELINE may be used to move to different points in time in the simulation."], ["image", "help/time1.png"], ["paragraph", "Clicking the PLAY BUTTON runs the simulation, and the current year in the microworld is updated with every timestep. The number in the display changes to reflect this. Once clicked, the play button changes to a PAUSE BUTTON. Clicking the pause button pauses the simulation and it changes back into the play button. The RESET BUTTON may be clicked to go back to year 0. The BACK and NEXT buttons can be clicked to go one year before or after."], ["image", "help/time2.png"], ["paragraph", "In the TEXTBOX, you may type in any year within simulation range (0 to 300 years) and the microworld jumps to that point in time. Upon entering some input, the play/pause and reset buttons change to a CONFIRM BUTTON and CANCEL BUTTON as shown above. Clicking the confirm button applies the change to the year and cancel prevents this. If input is invalid (not an integer in the allowed range) then the input box turns red to indicate this and the change will not be applied even upon confirmation."]]},
                { id: 3, content: [["heading", "CO2"], ["paragraph", "Natural processes like respiration and anthropogenic (human generated) ones like burning of wood or fossil fuels, and so on, release carbon into the atmosphere in gaseous form, of which a large part is CO2. CO2 is a greenhouse gas that traps heat within the atmosphere and keeps the planet toasty. Mars has too little CO2. Venus has too much. On Earth, it's just right. Mars and Venus are both thought to have started out much like earth with similar conditions."], ["paragraph", "Atmospheric CO2 concentration is expressed in Parts Per Million (ppm). This is the standard. It is a measure of the concentration of a substance in a solution or gas. It is a proportion, just like percent. 80 percent is 80 parts out of 100. 80 ppm is 80 parts out of 1,000,000. Here, this indicates the number of parts of CO2 per 1 million parts of the total air in the atmosphere."], ["paragraph", "CO2 concentration in the microworld has been organized into an easy-to-read scale as shown below. Associated with each band in the scale, is a label that is indicative of the expected quality of life for humans at that level of atmospheric CO2 concentration after considering climate change related effects."], ["image", "help/air_1.png"], ["image", "help/air_2.png"], ["paragraph", "Current levels of CO2 at each point in the simulation is displayed in the ATMOSPHERIC CO2 CONCENTRATION panel as shown below. The number within a colored tile is the current concentration. Hovering over each tile, reveals its range and quality of life label."], ["image", "help/air_3.png"]]},
                {id: 4, content:[["heading", "LAND"], ["paragraph", "Your land has 36 spots arranged in a 6 x 6 grid. Each of these 36 spots may either contain a tree or nothing. Hover over land content to view its type"], ["image", "help/land_1.png"]]},
                {id: 5, content:[["heading", "TREE"], ["paragraph", "Trees in this microworld are of 2 types, CONIFEROUS (triangular symbols) and DECIDUOUS (circular symbols). At any given time, a tree may be in one of 6 possible life stages: SEEDLING, SAPLING, MATURE, OLD GROWTH, SENESCENT and DEAD. A spot on the land is empty if there is no tree there. Each spot can have at most one live tree. The following image shows the different symbols used to represent “empty land spot” as well as trees of varying type and age."], ["image", "help/tree_1.png"], ["paragraph", "New trees spawn either naturally as they reproduce or if you decide to plant a tree in an empty spot. During reproduction, a parent tree can give rise to new seedlings of its type at one free spot adjacent to itself. Where there are no free spots or it is not the time for reproduction, it does not occur."], ["paragraph", "Trees that die naturally, remain on land as dead wood for a while until it decays. This decay also releases some CO2 into the air."], ["paragraph", "The primary differences among the two types of trees are as follows."], ["table", <table key="coniferous_defiduous_diff"><tr><th>CONIFEROUS</th><th>DECIDUOUS</th></tr><tr><td>1. Slightly slower growth rate (meters grown per year) = 0.7 m/s.</td><td>1. Slightly faster growth rate (meters grown per year) = 0.9 m/s.</td></tr><tr><td>2. Taller. Max height = 70 m.</td><td>2. Shorter. Max height = 40 m.</td></tr><tr><td>3. Longer reproduction interval. Reproduces every 2.5 years.</td><td>3. Shorter reproduction interval. Reproduces every year.</td></tr><tr><td>4. Wood is less dense at 600kg/m3.</td><td>4. Wood is denser at 700kg/m3.</td></tr><tr><td>5. Evergreen. So, absorbs a lesser amount of carbon for maintenance.</td><td>5. Foliage changes in accordance with seasons. Sheds leaves in Autumn and regains them in Spring.</td></tr><tr><td>6. Lives longer.</td><td>6. Shorter lived.</td></tr></table>]]},
                {id: 6, content: [["heading", "MANAGEMENT"], ["paragraph", "Possible forest management actions include cutting down (felling) trees or planting them. Trees may be felled or planted every X no. of years. This X is the ROTATION PERIOD. Management actions such as FELL and PLANT may be scheduled at the end of each ROTATION. This type of planning in rotations mimics real world practices. In agriculture and forestry harvests are often planned in rotations. A rotation is thus defined as 'the number of years between the formation or regeneration of a crop and its harvest'"], ["paragraph", "Planning can be done using the planner that may be accessed by clicking the PLAN button within the PLAN VIEWER PANEL as shown below."], ["paragraph", "The plan viewer displays planned actions. It also shows the current rotation and set rotation period on the top left (ROTATION DISPLAY and ROTATION PERIOD DISPLAY)."], ["paragraph", "Once a plan has been drafted. Actions that were most recently processed as well as the associated year is displayed under Previous Actions. Similarly, actions to be processed next along with the corresponding year, are displayed under Upcoming Actions. These action tags are horizontally scrollable if there are more of them than can fit within the view frame."], ["image", "help/management_1.png"], ["paragraph", "Clicking on the plan button will take you to the PLANNING PAGE. Here you will find the MANAGEMENT ACTION PLANNER as shown below."], ["image", "help/management_2.png"], ["paragraph", "The HOME BUTTON can be clicked to return to the home page."], ["paragraph", "Rotation period can be set by changing the value within the ROTATION PERIOD TEXT BOX. Invalid entries (integers ≤0, integers ≥ max no. of simulated years = 300, negative numbers, floating point numbers, input containing characters other than numbers) is highlighted in red and will not lead to an update of the rotation period value."], ["The blue year tags represent years at the beginning of each rotation as per set rotation period. This view frame is also horizontally scrollable. ACTION TAGS associated with actions added using the ACTION PICKER will appear under their corresponding year tags. These action tags under each year tag are vertically scrollable in case of view frame overflow."], ["Clicking an action tag, selects it. Clicking a selected action tag, deselects it. Multiple tags may be selected at once. Selected actions may then be deleted by clicking the DELETE BUTTON. Double clicking the DELETE BUTTON deletes all planned actions."], ["paragraph", "Clicking the SAVE BUTTON saves the current state of microworld along with the latest plan and other settings."], ["paragraph", "The UPLOAD BUTTON can be used to load previously saved states."], ["image", "help/management_3.png"], ["paragraph", "If you choose to add an action for a year that falls within a rotation and not at the beginning of one, then such years appear in red to indicate this."], ["image", "help/management_4.png"], ["paragraph", "An action tag displays information about the corresponding action and its execution status. If an action was successfully executed for all no. of the specified type of tree, then execution status is green. If it was only possible to execute this action for a fraction of the originally specified no of trees, then the status is yellow indicating that this action was executed for how many ever trees as was available on land at the time, although that was lesser than the specified count. A red status indicates that the action could not be executed at all (perhaps because there was no instance of the given tree type and age on land)."], ["image", "help/management_5.png"], ["paragraph", "It's the action picker that facilitates the addition of a new action to the plan."], ["image", "help/management_6.png"], ["paragraph", "To add a new action, first, the type of action must be selected. Then, the tree to apply that action to, must be selected. Finally, the maximum no. of trees to be affected as well as the year this action should be executed in, should be set using the text boxes."], ["paragraph", "If invalid numbers are entered into these text boxes, then the change is not applied and the text turns red."], ["If the REPEAT option is turned on, then this means that the picked action will be performed every rotation starting from the year associated with the picked action."], ["paragraph", "Once happy with the settings, clicking the ADD BUTTON adds a new action tag to the plan."]]},
                {id: 7, content:[["heading", "ACTIONS"], ["paragraph", "There are 2 possible management actions."], ["paragraph", "1. FELLING: Only mature, old growth, or senescent trees may be felled. Depending on the size of the tree felled, it can cost up to 3000 coins to fell a tree. The income that the felled tree fetches will depend on the wood density of the tree and its size. Nevertheless, felling a tree always leads to some income from timber."], ["paragraph", "2. PLANTING: Irrespective of the life stage chosen from the action picker, upon planting, the tree of chosen type will start out as a seedling. Planting a tree of either type incurs a fixed cost of 277 coins."], ["image"]]},
                {id: 8, content:[["heading", "COINS"], ["paragraph", "Coins are the currency of this microworld. The COIN PANEL displays your bank balance, income, and expenses."],["paragraph", "BANK BALANCE is the total amount of coins that you have at any given point in the simulation."], ["paragraph", "INCOME refers to no. of coins you have earned. Overall income is how much you've earned so far in the simulation, yearly income is how much you've earned this year alone, and rotation income is how much you have earned in this rotation alone."], ["paragraph", "EXPENSES refer to how much you have spent overall, this year, and this rotation. Felling/planting a tree costs coins that comprise this expenditure."], ["image", "help/coins_1.png"], ["paragraph", "By default, it is income/expense per rotation that is visible below the icon representing type of income stream. You may click on 'OVERALL', 'YEAR' or 'ROTATION' to update this. Hover over the icon to view the name of the income stream."], ["image", "help/coins_2.png"]].concat(challengeNum == 0 || challengeNum == 5 ? [["paragraph", "When there are multiple sources of income, a breakup of income and expenses per stream is displayed using a color coded proportion bar. Hover over each color to view the income stream and its contribution."], ["image", "help/coins_3.png"]] : [])}, 
                {id: 10, content:[["heading", "INCOME STREAMS"], ["paragraph", "Income can be generated from the forest via the TIMBER income stream by selling wood from felled trees. When the fell action gets executed successfully, harvested timber is sold and gets used. Half of all harvested wood gets used as lumber (construction, furniture, etc.) and the other half is burned for heat/to generate power. The lumber use case does not lead to immediate release of carbon stored in the wood because it gets preserved. The energy use case on the other hand, leads to immediate release of carbon in the wood into the atmosphere as CO2."]].concat(challengeNum == 0 || challengeNum == 5 ? [["paragraph", "There are more ways of earning from a forest other than the TIMBER INCOME STREAM."], ["image", "help/management_7.png"], ["paragraph", "You may harvest and sell other resources found in the forest like honey, mushrooms, and berries. Around 14 kgs of such produce may be available per year, but it may be a bit more or less. This is the NON-TIMBER FOREST PRODUCTS income stream. It is less reliable than the timber income stream. Each kg of produce sells for 170 coins. Maintaining this income stream costs 1620 coins per year to pay workers for harvesting. Switch on the corresponding dependency switch in the planning page to consider this income stream."], ["paragraph", "Another option is to open the forest up for public recreational use. You can earn around 465 coins per year this way. However, this too can vary a little depending on no. of visitors and hence is less reliable than timber. This is the FOREST RECREATION income stream. It requires both an initial one-time investment of 40024 coins to establish necessary infrastructure and a yearly maintenance payment of 413 coins in employee wages to sustain it. Switch on the corresponding dependency switch in the planning page to consider this income stream. In the real world, it may be possible for a portion, or all of the initial investment cost to be paid for using a government grant or other aid money."]] : [])}
            ]
            linksNew = [
                { source: 0, target: 1 }, // World --> Time
                { source: 0, target: 3 }, // World --> CO2
                { source: 0, target: 4 }, // World --> Land
                { source: 4, target: 5 }, // Land --> Tree
                { source: 4, target: 6 }, // Land --> Management
                { source: 6, target: 7 }, // Management --> Actions
                { source: 0, target: 8 }, // World --> Coins
                { source: 6, target: 10 }, // Management --> Income Streams
            ]
        }

        if (challenge != 1) {
            nodesNew.push({ id: 2, content: [["heading", "TARGET"], ["paragraph", "You may set yourself a target as part of challenges. The TARGET panel displays this as follows"], ["image", "help/targets1.png"], ["paragraph", "You may type into the TEXTBOX, the CO2 concentration below which atmospheric CO2 levels must never dip."], ["paragraph", "The VIEW switch can be toggled on and off. When on, the target panel displays whether the target is being currently met or not."], ["paragraph", "If the success condition is satisfied, then a green border indicates this. If the target could not be met, then a red border shows this. The point in time at which the target first failed, is also indicated (notation Y2, Y3 and so on, means Year 2, Year 3, etc.)."], ["image", "help/targets2.png"]].concat(challengeNum == 0 ? [["paragraph", "Similarly, a target income value can also be set. This is the minimum income you're looking to earn every rotation."], ["paragraph", "If you fail to meet this target, the rotation at which this failure first occurred is displayed beside the target field using the notation of letter R followed by the rotation number."], ["image", "help/targets3.png"]] : [])})
            linksNew.push({ source: 0, target: 2 }) // World --> Target
        }

        if(challengeNum == 0 || challengeNum == 4 || challengeNum == 5) {
            nodesNew.push(
                {id: 9, content:[["heading", "FOSSIL FUEL USAGE"], ["paragraph", "In 2023, 36.8 GtCO2 which is about 10 GtC was released into the atmosphere due to fossil fuel usage."], ["paragraph", "By, default, annual emissions due to fossil fuel use is set to 0 GtC. This can be changed by typing any positive whole number into the textbox as shown below."], ["image", "help/fossil_fuel_usage1.png"]]}
            )
            linksNew.push(
                { source: 0, target: 9 }, // World --> CO2 Emissions
            )
        }

        if(challengeNum == 0) {
            // Add ENVIRONMENT that explains about carbon reservoirs.
            nodesNew.push(
                {id: 11, content: [["heading", "ENVIRONMENT"], ["paragraph", "In this world, there are 5 carbon reservoirs. Amount of carbon in all these reservoirs are expressed in Gigatonnes (Gt) of Carbon (1 Gt = 10 to the power 12 kgs)."], ["paragraph", "1. VEGETATION: The plants on land sequester carbon dioxide (CO2) from the atmosphere. Carbon sequestration refers to the process through which CO2 is removed from the atmosphere and held in solid or liquid form."], ["paragraph", "2. SOIL: The soil holds carbon in the form of organic material (plant/animal remains, microbes, etc.) or minerals."], ["paragraph", "3. AIR: Natural processes like respiration and anthropogenic (human generated) ones like burning of wood or fossil fuels, and so on, release carbon into the atmosphere in gaseous form, of which a large part is CO2. CO2 is a greenhouse gas that traps heat within the atmosphere and keeps the planet toasty. Mars has too little CO2. Venus has too much. On Earth, its just right. Mars and Venus are both thought to have started out much like earth with similar conditions."], ["paragraph", "4. FOSSIL FUELS: Fossil fuels refer to energy dense coal, oil and gas trapped deep within the earth's surface that can be extracted and burned to generate heat to drive electricity production, machine operation, and more. These hydrocarbons (combinations of Hydrogen (H) + Carbon (C)) were formed from organic matter compressed over millions of under immerse heat and pressure, deep in the belly of planet Earth. So, unless you're willing to wait for another million years, fossil fuels, as we know it, are non-renewable."],  ["paragraph", "5. LUMBER: This is a man-made reservoir. It refers to all wood that's preserved in use (furniture, construction, etc.) and not burned for energy. When we preserve wood, we significantly slow down its breakdown and re-entry into the carbon cycle via natural decay."], ["paragraph", "The carbon panel displays the exact amount of carbon in each reservior throughout the simulation."], ["image", "help/carbon_reservoirs_1.png"]]}
            )

            // Replace World --> Land connection with
            // World --> Environment and Environment --> Land.
            for (let i = 0; i < linksNew.length; i++) {
                const l = linksNew[i]
                if (l.source == 0 && l.target == 4) {
                    linksNew.splice(i, 1)
                }
            }
            linksNew.push(
                { source: 0, target: 11 }, // World --> Environment
            )
            linksNew.push(
                { source: 11, target: 4 }, // Management --> Income Streams
            )

            // Add Biodiversity Score.
            nodesNew.push(
                {id: 12, content: [["heading", "BIODIVERISTY"], ["paragraph", "The land has an associated BIODIVERSITY SCORE computed based on how much variety of species there is in the forest. Mixed forests with both types of trees and trees of varying ages have been shown to support more life. Thus, such forests here, have a greater biodiversity score. This score lies in the range 0 to 1."], ["paragraph", "The land is classified based on these scores as follows."], ["image", "help/biodiversity_1.png"], ["paragraph", "Both the score and classification at every point in the simulation is displayed at the top of the land panel."], ["image", "help/biodiversity_2.png"], ["paragraph", "More biodiverse forests have also been shown to be more resilient. Hence, in this microworld, higher biodiversity scores are linked to lower impact on a tree's health due to stress."]]}
            )
            linksNew.push(
                { source: 4, target: 12 }, // Land --> Biodiverisity
            )
        }

        setNodes(nodesNew)
        setLinks(linksNew)
    }

    const detectKeyDown = (e) => {
        /** 
         * Function that receives a keypress event.
         */
        if (e.key === "w" || e.key === "W") router.push('/world')
        else if (e.key === "Escape") router.push('/')
    }

    const handlePopUpClose = () => {
        /**
         * Handles the event when a use wants to close the popup.
         */
        setPopUpContent("")
    }

    useEffect(() => {
        setNodesLinks(challenge)
        document.addEventListener('keydown', detectKeyDown, true)
    }, [])

    return (
        <main className='w-screen h-screen relative bg-[#dcedf2]'>
            <div className='w-full h-full absolute'>
                <GraphUserGuide 
                    handleTopicSelection={(data) => setPopUpContent(getHelpJsxContent(data))} 
                    nodes={nodes} links={links}
                />
            </div>
            {popUpContent != "" && 
                <PopUp handleClose={handlePopUpClose}>
                    {popUpContent}
                </PopUp>
            }
        </main>
    )
}

export default Help