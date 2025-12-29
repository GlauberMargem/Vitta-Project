import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex w-fit items-center gap-4 rounded-lg bg-white p-2 shadow-lg border border-gray-100">

      <Link href={'/'} className="group flex justify-center items-center aspect-square hover:bg-gray-100 rounded-full transition">
        <span className=" material-symbols-outlined !text-3xl px-2 text-gray-600 group-hover:text-[#6A97C6]">
          home
        </span>
      </Link>

      <div className="h-6 w-px border-1 rounded-full bg-gray-300"></div>

      <Link href={'/dashboard/'} className="group flex justify-center items-center aspect-square hover:bg-gray-100 rounded-full transition">
        <span className="material-symbols-outlined !text-3xl px-2 text-gray-600 group-hover:text-[#6A97C6]">
          bar_chart
        </span>
      </Link>

      <div className="h-6 w-px border-1 rounded-full bg-gray-300"></div>

      <Link href={'/userConfig'} className="group flex justify-center items-center aspect-square hover:bg-gray-100 rounded-full transition">
        <span className="material-symbols-outlined !text-3xl px-2 text-gray-600 group-hover:text-[#6A97C6]">
          manage_accounts
        </span>
      </Link>

    </nav>
  )
}