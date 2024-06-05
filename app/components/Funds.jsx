import Card from "./Card"

const Funds = ({funds}) => {
    /** Displays that the user currently has. */

    return (
        <Card bgColor="#FFFFFF">
            <div className="-mt-2 flex gap-5 justify-center items-center w-full h-full">
                <div className="font-bold">FUNDS</div>
                <div>{funds}</div>
                <div className="font-bold">Bc</div>
            </div>
        </Card>
    )
}

export default Funds