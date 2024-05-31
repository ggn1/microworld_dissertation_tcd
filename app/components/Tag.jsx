"use client"

import { useState } from "react"

const Tag = ({
    children, borderRadius="9999px",
    bgColor="#EEEEEE", borderColor="#EEEEEE", 
    borderColorSelected="", onClick=()=>{},
    width="auto", height="auto", borderWidth="3px"
}) => {
    /**
     * A generic tag that may or maynot be selectable. 
     * If selectable, then it's border color changes on click.
     * @param children: Contents within this tag.
     * @param borderRadius: How curved the borders must be.
     * @param bgColor: Fill color of the tag.
     * @param borderColor: Color of the border.
     * @param selectable: Whether it is possible to select this tag.
     * @param onClick: Some function to execute upon clicking this tag.
     */

    const [selected, setSelected] = useState(false)

    const selectable = borderColorSelected != ""

    const handleClick = () => {
        /** 
         * Sends a regetrence to this tag, its "selected" state 
         * and a function to change the selected state to the
         * given onClick function.
         */
        onClick(selected, setSelected)
    }

    return (
        <div 
            onClick={handleClick}
            className={selectable && "hover:brightness-110"}
            style={{
                borderWidth: borderWidth,
                backgroundColor: bgColor,
                borderRadius: borderRadius,
                borderColor: 
                    selectable && selected ? 
                    borderColorSelected : 
                    borderColor,
                width: width,
                height: height
            }}
        >{children}</div>
    )
}

export default Tag