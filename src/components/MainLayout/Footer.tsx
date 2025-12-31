import { Divider, Image } from "antd";

export default function Footer() {
  return (
    <footer className="bg-[#F2F2F2] border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* LOGO: dùng img */}
          <Image preview={false} src="/img/Logo.png" alt="Logo" className="h-10 w-auto max-w-full" />

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-3 text-sm text-gray-600">
            <a href="#">About Us</a>
            <a href="#">Contact Us</a>
            <a href="#">Blogs</a>
            <a href="#">Downloads</a>
            <a href="#">Forum</a>
            <a href="#">Techlabz Keybox</a>
          </nav>
        </div>

        <Divider className="my-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms & Services</a>
            <a href="#">Use</a>
            <a href="#">Refund Policy</a>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-gray-500" />
            <a href="mailto:info@logoipsum.com" className="break-all hover:text-blue-600">
              info@logoipsum.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
