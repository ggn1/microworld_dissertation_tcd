const PopUp = ({children, handleClose}) => {
    /**
     * Displays chilren on a PopUp window
     * that triggers given function upon 
     * the user clicking on the transluscent 
     * background.
     * @param handleClose: Function to execute
     *                     upon an attempt to
     *                     close the popup. 
     */

    return (
        <div className='
            absolute z-20 top-0 left-0 w-screen max-h-screen-full
            flex justify-center *:select-none
        '>
            <div 
                className='absolute w-full h-full bg-black opacity-80'
                onClick={handleClose}
            ></div>
            <div className='
                absolute grid place-items-center bg-white rounded-xl 
                opacity-100 m-10 p-10 w-3/4 max-h-[80%] overflow-scroll
            '>
                <div className='flex flex-col gap-6 justify-center'>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default PopUp