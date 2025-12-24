import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="flex w-full h-[6vh] min-h-[50px] items-center border-b-2 border-[#6A97C6] bg-white px-2 shadow-sm">
      <Link href={'/'} className="relative flex h-full items-center">
        <Image
          src="/tittle.svg"
          alt="Logo do Site"
          width={120}
          height={40}
          priority
          className="h-[60%] w-auto object-contain"
        />
      </Link>
    </header>
  )
}