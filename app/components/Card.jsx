"use client"

import { useEffect, useState } from 'react'

const Card = ({children, bgColor, heading, fgColor}) => {
    /** A rounded card within which to place elements. */

    // Need to render client side to avoid hydration error.
    const [isClient, setIsClient] = useState(false)
    useEffect(() => { setIsClient(true)}, [])

    return (
        isClient && <div className="card p-3 flex-1 w-full rounded-lg text-sm" style={{
            backgroundColor: bgColor
        }}>
            {heading != "" && <div className='text-center font-bold mb-2' style={{color: fgColor}}>
                {heading}
            </div>}
            {children}
        </div>
    )
}

export default Card