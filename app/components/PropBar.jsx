import Card from './Card'
import { Tooltip } from 'react-tooltip'

const PropBar = ({title, proportions, labels, colors}) => {
    /** 
     * Displays given proportions using a single
     * stacked bar plot.
     * @param proportions: List of proportions.
     * @param labels: List of labels, one for each proportion.
     * @param colors: List of a color per proportion.
     */
    
    let propBars = []

    for(let i = 0; i < proportions.length; i++) {
        const prop = Math.round(proportions[i]*100)
        propBars.push(
            <a 
                style={{"minWidth": `${prop}%`}}
                data-tooltip-id={`tooltip-${i}`}
                data-tooltip-content={`${labels[i]}`}
                data-tooltip-place="top"
            >   
                <div 
                    key={`prop-bar-${i}`} 
                    className="rounded-full h-3"
                    style={{"backgroundColor": colors[i]}}
                >
                    <Tooltip id={`tooltip-${i}`}/>
                </div>  
            </a>
        )
    }

    return (
        <Card heading={title} bgColor="#FFFFFF">
            <div className='flex gap-1 justify-center'>
                {propBars}
            </div>
        </Card>
    )
}

export default PropBar
