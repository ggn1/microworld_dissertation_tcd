import React from 'react'

const PopUp = ({children, handleClose}) => {
    /**
     * A popup window.
     */
    return (
        <div className='absolute top-0 left-0 w-screen h-full overflow-hidden flex justify-center *:select-none overflow-hidden'>
            <div 
                className='absolute w-full h-full bg-black opacity-80'
                onClick={handleClose}
            ></div>
            <div className='
                absolute grid place-items-center bg-white rounded-xl 
                opacity-100 m-10 p-10 w-3/4 max-h-96 overflow-scroll
            '>
                <div className='flex flex-col gap-6 justify-center'>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default PopUp