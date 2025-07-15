import React, { useState } from 'react';
import Church from "./assets/hermon-church.webp";

const Footer = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="flex fixed inset-x-0 bottom-0 z-20 justify-center items-center no-underline focus:underline-none focus:no-underline">
      <div 
        className="mx-auto h-12 w-[370px] sm:w-96 bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80 rounded-full relative overflow-hidden transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background image - blurred but more visible on hover */}
        <img
          className={`object-cover absolute inset-0 w-full h-full blur-sm transition-all duration-500 ease-in-out ${isHovered ? 'opacity-40' : 'opacity-10'}`}
          src={Church}
          alt="Church"
        />
        
        {/* Church name - fades out on hover */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="flex items-center space-x-2 z-10">
            <i className="icon-home-circled text-gray-800 dark:text-gray-200" />
            <span className="filter drop-shadow-md font-bold text-lg md:text-xl text-gray-800 dark:text-gray-200">Iglesia Hermón</span>
          </div>
        </div>
        
        {/* Content that appears on hover */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} flex flex-col justify-center items-center h-full`}
        >
          {/* Social media links */}
          <div className="flex flex-row justify-center items-center space-x-3 text-center">
            <a href="https://www.facebook.com/people/Iglesia-Evangelica-Hermon/100064624004737/" className="pointer-cursor" target="_blank" rel="noreferrer">
              <button type="button" className="text-white bg-[#3b5998] hover:bg-gray-200 hover:text-[#3b5998] dark:bg-gray-800 dark:hover:bg-gray-400 dark:text-gray-400 dark:hover:text-gray-800 hover:drop-shadow-md w-6 h-6 icon-facebook-squared active:no-underline no-underline focus:outline-none rounded-full flex items-center justify-center transition-all duration-200 text-[10px]">
              </button>
            </a>
            <a href="https://x.com/IglesiaHermon/" className="pointer-cursor" target="_blank" rel="noreferrer">
              <button type="button" className="text-white bg-[#00aced] hover:bg-gray-200 hover:text-[#00aced] dark:bg-gray-800 dark:hover:bg-gray-400 dark:text-gray-400 dark:hover:text-gray-800 hover:drop-shadow-md w-6 h-6 icon-twitter-2 active:no-underline no-underline focus:outline-none rounded-full flex items-center justify-center transition-all duration-200 text-[10px]">
              </button>
            </a>
            <a href="https://instagram.com/iglesiaevangelicahermon/" className="pointer-cursor" target="_blank" rel="noreferrer">
              <button type="button" className="text-white bg-[#bc2a8d] hover:bg-gray-200 hover:text-[#bc2a8d] dark:bg-gray-800 dark:hover:bg-gray-400 dark:text-gray-400 dark:hover:text-gray-800 hover:drop-shadow-md w-6 h-6 icon-instagram-1 active:no-underline no-underline focus:outline-none rounded-full flex items-center justify-center transition-all duration-200 text-[10px]">
              </button>
            </a>
          </div>
          
          {/* Small copyright */}
          <div className="text-gray-800 dark:text-gray-400 text-[10px] mt-1">
            © {new Date().getFullYear()} Fundación Cultural Hermón RTV
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;