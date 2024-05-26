import Card from './Card'

const BdStatus = ({bdScore, bdCategory}) => {
    /** 
     * Component displays Biodiversity metrics of the land. 
     * @param bdScore: Biodiversity score [0, 1].
     * @param bdCategory: Classification of the land based on biodiversity.
     *                    This may be ["Unforested", "Plantation", "Forest", "Ecosystem"]
     */

    return (
        <div>
            <Card bgColor="#FFFFFF" heading="BIODIVERSITY">
                <div>
                    <span className='text-[#6E6E6E] mr-2'>Score:</span> 
                    <span>{bdScore}</span>
                </div>
                <div>
                    <span className='text-[#6E6E6E] mr-2'>Land Class:</span> 
                    <span>{bdCategory}</span>
                </div>
            </Card>
        </div>
    )
}

export default BdStatus