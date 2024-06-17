"use client"

import { useContext } from "react"
import { PopUpContextWorld } from '../world/page'
import { PopUpContextPlanner } from '../planner/page'
import { getHelpJsxContent } from '../help/page'

const Help = ({children, helpData, page}) => {
    /**
     * Displays help icon and content on click
     * on the page's popup.
     * @param children: Content to wrap within this component.
     * @param helpData: Data in the form of a list of 2-item lists
     *                  such that the first item is the type of
     *                  content ("heading", "paragraph", "image")
     *                  and the second item is the content itself.
     * @param page: The page from which this help is being called
     *              (world, planner).
     */
    const [popUpContent, setPopUpContent] = useContext(
        page == "world" ? PopUpContextWorld : PopUpContextPlanner
    )
    return (
        <div className='relative h-full'>
            <div className="h-full">{children}</div>
            <div className='absolute top-0 right-0'>
                <img 
                    src="question.png" 
                    className='h-4 w-auto hover:scale-125' 
                    onClick={() => setPopUpContent(getHelpJsxContent(helpData))}
                />
            </div>
        </div>
    )
}

export default Help