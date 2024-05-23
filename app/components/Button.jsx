const Button = ({children, onClick, bgColor="#EEEEEE", fgColor="#232323"}) => {
    /**
     * A button with some icon and/or text of chosen colors that
     * does something upon clicking.
     */
    return (
        <button className="button rounded-sm hover:brightness-110 hover:drop-shadow-lg" onClick={onClick} style={{
            backgroundColor: bgColor, color:fgColor
        }}>
            {children}
        </button>
    )
}

export default Button