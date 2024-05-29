"use client"

import {useState } from "react"

const Tag = ({
    children, selectable=false, borderRadius="9999px",
    bgColor="#EEEEEE", borderColor="#EEEEEE", 
    borderColorSelected="#FFD738",
    onClick=()=>{}, onDoubleClick=()=>{}
}) => {
    /**
     * A generic tag that may or maynot be selectable. 
     * If selectable, then it's border color changes on click.
     * @param children: Contents within this tag.
     * @param borderRadius: How curved the borders must be.
     * @param bgColor: Fill color of the tag.
     * @param borderColor: Color of the border.
     * @param borderColorSelected: Color that the border changes 
     *                             to upon selection.
     * @param selectable: Whether or not this tag may be selected.
     * @param onClick: Some function to execute upon clicking this
     *                 object.
     * @param onDoubleClick: Some function to execute upon double 
     *                       clicking this object.
     */

    const [selected, setSelected] = useState(false)

    const handleClick = (e) => {
        if (selectable) setSelected(prevVal => !prevVal)
        onClick(e)
    }

    return (
        <div 
            onDoubleClick={onDoubleClick} 
            onClick={handleClick}
            className={selectable ? "hover:brightness-110" : ""}
            style={{
                backgroundColor: bgColor,
                borderWidth: "3px",
                borderRadius: borderRadius,
                borderColor: selected ? borderColorSelected : borderColor
            }}
        >{children}</div>
    )
}

export default Tag