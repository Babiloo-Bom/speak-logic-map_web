import { Divider, Image } from "antd";

export default function Footer() {
  return (
    <footer className="bg-[#F2F2F2] border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top: Logo + Menu */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
          {/* Logo */}
          <Image src="/img/Logo.png" alt="Logo" preview={false} className="h-10 w-auto" />

          {/* Menu */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">
              About Us
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact Us
            </a>
            <a href="#" className="hover:text-blue-600">
              Blogs
            </a>
            <a href="#" className="hover:text-blue-600">
              Downloads
            </a>
            <a href="#" className="hover:text-blue-600">
              Forum
            </a>
            <a href="#" className="hover:text-blue-600">
              Techlabz Keybox
            </a>
          </nav>
        </div>

        {/* Divider */}
        <Divider />

        {/* Bottom: Policy + Email */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          {/* Policies */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <a href="#" className="hover:text-blue-600">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600">
              Terms & Services
            </a>
            <a href="#" className="hover:text-blue-600">
              Use
            </a>
            <a href="#" className="hover:text-blue-600">
              Refund Policy
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75M21.75 6.75L12 13.5 2.25 6.75"
              />
            </svg>

            <a href="mailto:info@logoipsum.com" className="hover:text-blue-600">
              info@logoipsum.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
