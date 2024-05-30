const Veil = ({
    children, isVeiled, veilColor="#000000", veilOpacity=50, borderRadius=0}) => {
    /** 
     * A component that disables interaction with
     * children by placing a transluscent veil over it.
     * @param children: Child components.
     * @param isVeiled: Whether children are to be veiled.
     */
    return (
        <div className='relative w-full h-full'>
            <div className='absolute w-full h-full z-0'>
                {children}
            </div>
            <div 
                className='absolute w-full z-10'
                style={{
                    height: isVeiled ? "100%" : "0%",
                    backgroundColor: veilColor,
                    opacity: `${veilOpacity}%`,
                    borderRadius: `${borderRadius}px`
                }}
            ></div>
        </div>
    )
}

export default Veil