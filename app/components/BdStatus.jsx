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
                <div className='flex flex-col justify-between gap-2'>
                    <div className='flex'>
                        <p className='text-[#6E6E6E] mr-2'>Score:</p> 
                        <p>{bdScore}</p>
                    </div>
                    <div className='flex'>
                        <p className='text-[#6E6E6E] mr-2'>Land Class:</p> 
                        <p>{bdCategory}</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default BdStatus