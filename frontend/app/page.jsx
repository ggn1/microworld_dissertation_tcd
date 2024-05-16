const Home = () => {
    fetch(process.env.NEXT_PUBLIC_BACKEND)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error))

    return (
        <main className='h-screen w-screen p-5 grid grid-rows-9 grid-cols-10 gap-2'>
        </main>
    )
}

export default Home