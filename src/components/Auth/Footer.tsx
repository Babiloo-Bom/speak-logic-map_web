import React, { useState } from 'react';
import Image from "next/image";
import IMG_LOGOEEXAMPLE from "@/assets/images/LogoExample.png";

const Header: React.FC = () => {
    return (
        <footer className="bg-gray-100 py-8">
            <div className='container max-w-5xl mx-auto'>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Image src={IMG_LOGOEEXAMPLE} alt="Logo" />
                    </div>
                    <ul className="flex space-x-6 text-sm">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Blogs</a></li>
                        <li><a href="#">Downloads</a></li>
                        <li><a href="#">Forum</a></li>
                        <li><a href="#">Techlabz Keybox</a></li>
                    </ul>
                </div>
                <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
                <div className="flex justify-between text-xs text-gray-500 mt-6">
                    <ul className="flex space-x-6">
                        <li><a href="#">Privacy</a></li>
                        <li><a href="#">Terms & Services</a></li>
                        <li><a href="#">Use</a></li>
                        <li><a href="#">Refund Policy</a></li>
                    </ul>
                    <p>📧 info@logapipsum.com</p>
                </div>
            </div>
        </footer>
    )
}

export default Header;
