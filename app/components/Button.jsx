const Button = ({
    children, onClick, outlineColor="#CCCCCC", 
    bgColor="#EEEEEE", fgColor="#232323", disabledColor=""
}) => {
    /**
     * A button with some icon and/or text of chosen colors that
     * does something upon clicking.
     */
    return (
        <button 
            className={
                disabledColor != "" ?
                "button font-bold px-1 rounded-md" :
                "button font-bold px-1 rounded-md hover:brightness-110 hover:drop-shadow-lg"
            }
            onClick={onClick} 
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