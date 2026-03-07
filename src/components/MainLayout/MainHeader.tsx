import Link from "next/link";
import { Image } from "antd";

const MainHeader = () => (
  <header className="bg-[#F2F2F2] shadow">
    <div className="mx-12 px-4 py-4 flex items-center justify-between overflow-hidden">
      <div className="flex items-center gap-2">
        <Image preview={false} src="/img/Logo.png" alt="Logo" className="h-10 w-auto max-w-full" />
      </div>

      <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-800">
        <Link href="/providers" className="font-bold hover:underline">
          Provider
        </Link>
        <Link href="/manager-search">Problem</Link>
        <Link href="/manager-search">Function</Link>
        <a href="#">News</a>
      </nav>

      <button className="md:hidden text-2xl">☰</button>
    </div>
  </header>
);
export default MainHeader;
