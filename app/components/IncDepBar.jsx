import Card from './Card'
import { Tooltip } from 'react-tooltip'

const IncDepBar = ({proportions, labels, colors}) => {

    let propBars = []
    for(let i = 0; i < proportions.length; i++) {
        const prop = Math.round(proportions[i]*100)
        propBars.push(
            <a 
                style={{"minWidth": `${prop}%`}}
                data-tooltip-id={`tooltip-${labels[i]}`}
                data-tooltip-content={`${labels[i]} = ${prop}%`}
                data-tooltip-place="top"
            >   
                <div 
                    key={`prop-bar-${labels[i]}`} 
                    className="rounded-md h-8"
                    style={{"backgroundColor": colors[i]}}
                >
                    <Tooltip id={`tooltip-${labels[i]}`}/>
                </div>  
            </a>
        )
    }

    return (
        <Card heading="INCOME DEPENDENCY" bgColor="#FFFFFF">
            <div className='flex gap-1 justify-center'>
                {propBars}
            </div>
        </Card>
    )
}

export default IncDepBar
