import React, { useState } from 'react';
import Image from "next/image";
import IMG_LOGO from "@/assets/images/Logo.png";
import ICONUSER from "@/assets/images/IconUser.png";
import ICONBELL from "@/assets/images/IconBell.png";

const Header: React.FC = () => {
    return (
        <header>
            <div className="bg-black text-white text-sm">
                <div className="max-w-[1440px] mx-auto flex justify-between px-16 py-4">
                    <ul className="flex space-x-6">
                        <li><a href="#">Training</a></li>
                        <li><a href="#">Manager Module</a></li>
                        <li><a href="#">Rating</a></li>
                        <li><a href="#">Privacy</a></li>
                        <li><a href="#">Support us</a></li>
                        <li><a href="#">About Us</a></li>
                    </ul>
                    <div className="flex space-x-4">
                        <button><Image src={ICONBELL} alt="IconBell" /></button>
                        <button><Image src={ICONUSER} alt="IconUser" /></button>
                    </div>
                </div>
            </div>

            <div className="bg-[#F2F2F2]">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center px-16 py-4">
                    <div>
                        <Image src={IMG_LOGO} alt="Logo" />
                    </div>
                    <ul className="flex space-x-8">
                        <li><a href="#" className="font-bold text-gray-800">Provider</a></li>
                        <li><a href="#" className="font-bold text-gray-800">Problem</a></li>
                        <li><a href="#" className="font-bold text-gray-800">Function</a></li>
                        <li><a href="#" className="font-bold text-gray-800">News</a></li>
                    </ul>
                </div>
            </div>
        </header>
    )
}

export default Header;
