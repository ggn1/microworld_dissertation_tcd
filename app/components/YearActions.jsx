import Tag from "./Tag"

const YearActions = ({year, actions, maxHeight}) => {
    /**
     * Component that embodies a year tag and all
     * associated action tags in the main planner.
     * @param year: The year of interest.
     * @param actions: All actions associated with this year.
     * @param maxHeight: Max height of the viewer.
     */

    const colorBad = "#F44A4A"
    const colorGood = "#32CE51"
    const colorDefault = "#CCCCCC"
    const borderColorDefault = "#DDDDDD"
    const borderColorSelected = "#FCF412"
    const actionSuccessColors = {"-1": colorDefault, "1":colorGood, "0":colorBad}

    return (
        <div>
            <Tag borderColor="#6892FF" bgColor="#6892FF">
                <div className='
                    rounded-full py-1 w-32 text-center
                    font-bold text-[#FFFFFF]
                '>{year}</div>
            </Tag>
            <div 
                className='mt-3 mb-3 flex flex-col gap-3 overflow-hidden hover:overflow-scroll'
                style={{maxHeight: maxHeight}}
            >{[
                actions.map((action, i) => <Tag 
                    key={`action-tag-${year}-${i}`}
                    selectable={true} 
                    bgColor="#EEEEEE"
                    borderColor={borderColorDefault}
                    borderColorSelected={borderColorSelected}
                    borderRadius={"10px"}
                >
                    <div className='
                        py-2 w-32 flex gap-1
                        items-center justify-center 
                    '>
                        <img src={
                            action.actionType == "fell" ? "axe.png" : "shovel.png"
                        } className='max-h-8 w-auto'/>
                        <b>{action.count}</b>
                        <img src={
                            action.actionType == "plant" ? 
                            `mature_${action.treeType}.png` : 
                            `${action.treeLifeStage}_${action.treeType}.png`
                        } className='max-h-8 w-auto'/>
                        <div 
                            className='rounded-full w-4 h-4'
                            style={{backgroundColor: actionSuccessColors[
                                action.success.toString()
                            ]}}
                        ></div>
                    </div>
                </Tag>)
            ]} </div>
        </div>
    )
}

export default YearActions