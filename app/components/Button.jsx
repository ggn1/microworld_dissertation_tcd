const Button = ({children, onClick, outlineColor="#CCCCCC", bgColor="#EEEEEE", fgColor="#232323"}) => {
    /**
     * A button with some icon and/or text of chosen colors that
     * does something upon clicking.
     */
    return (
        <button 
            className="button rounded-md hover:brightness-105 hover:drop-shadow-lg" 
            onClick={onClick} 
            style={{
                backgroundColor: bgColor, color:fgColor,
                border: `3px solid ${outlineColor}`
            }}
        >
            {children}
        </button>
    )
}

export default Button