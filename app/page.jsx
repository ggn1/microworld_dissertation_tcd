import Link from "next/link"

const LandingPage = () => {
    return (
        <main>
            <div>LandingPage</div>
            <div>
                <Link href={"/home"}>
                    HOME
                </Link>
            </div>
            <div>
                <Link href={"/walkthrough"}>
                    WALKTHROUGH
                </Link>
            </div>
        </main>
    )
}

export default LandingPage