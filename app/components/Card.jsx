import React from 'react'

const Card = ({children, bgColor, heading}) => {
    /** A rounded card within which to place elements. */
    return (
        <div className="card p-3 w-full rounded-lg text-sm" style={{
            backgroundColor: bgColor
        }}>
            {heading != "" && <div className='text-center font-bold mb-2'>{heading}</div>}
            {children}
        </div>
    )
}

export default Card