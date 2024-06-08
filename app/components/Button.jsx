const Button = ({
    children, onClick=(e)=>{}, onDoubleClick=(e)=>{}, outlineColor="#CCCCCC", 
    bgColor="#EEEEEE", fgColor="#232323", disabledColor=""
}) => {
    /**
     * A button with some icon and/or text of chosen colors that
     * does something upon clicking.
     * @param children: Child elements.
     * @param onClick: Function that is run when clicked. This 
     *                 function receives the click event as input.
     * @param onDoubleClick: Function that is run when double clicked.
     *                       This function receives the double click
     *                       event as input.
     * @param outlineColor: The color of the outline of this button.
     * @param bgColor: Color of this button's background.
     * @param fgColor: Color of the text in this button.
     * @param disabledColor: Color of this button when it is disabled.
     *                       By default, this is "" which indicates that 
     *                       this button is not disabled. If this color
     *                       is set, then that means that this button is
     *                       currently disabled.
     */
    return (
        <button 
            className={
                disabledColor != "" ?
                "button font-bold px-1 rounded-md" :
                "button font-bold px-1 rounded-md hover:brightness-110 hover:drop-shadow-lg"
            }
            onClick={(e) => onClick(e)} 
            onDoubleClick={(e) => onDoubleClick(e)}
            style={{
                backgroundColor: disabledColor != "" ? disabledColor : bgColor, 
                color: fgColor,
                border: `3px solid ${disabledColor != "" ? disabledColor : outlineColor}`
            }}
            disabled={disabledColor != ""}
        >
            {children}
        </button>
    )
}

export default Button