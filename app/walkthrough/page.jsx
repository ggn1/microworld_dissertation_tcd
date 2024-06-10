import Link from "next/link"

const Walkthrough = () => {
  return (
    <div>
        <Link href={"/home"}>
            HOME
        </Link>
        <div>Walkthrough</div>
        <Link href={"/"}>
            TITLE
        </Link>
    </div>
  )
}

export default Walkthrough