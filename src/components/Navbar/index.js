import Link from "next/link";
import { Home, BarChart3, UserCog } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex w-fit items-center gap-4 rounded-lg bg-white p-2 shadow-lg border border-gray-100">

      <Link href={'/'} className="group flex justify-center items-center aspect-square hover:bg-gray-100 rounded-full transition p-2">
        <Home className="size-6 text-gray-600 group-hover:text-[#6A97C6]" />
      </Link>

      <div className="h-6 w-px border-1 rounded-full bg-gray-300"></div>

      <Link href={'/dashboard/'} className="group flex justify-center items-center aspect-square hover:bg-gray-100 rounded-full transition p-2">
        <BarChart3 className="size-6 text-gray-600 group-hover:text-[#6A97C6]" />
      </Link>

      <div className="h-6 w-px border-1 rounded-full bg-gray-300"></div>

      <Link href={'/userConfig'} className="group flex justify-center items-center aspect-square hover:bg-gray-100 rounded-full transition p-2">
        <UserCog className="size-6 text-gray-600 group-hover:text-[#6A97C6]" />
      </Link>

    </nav>
  )
}