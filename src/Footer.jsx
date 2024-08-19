import React from 'react';

function Footer() {
    return (
        <footer className="bg-gray-300 dark:bg-gray-800 pb-4 shadow-md">
            {/* Line at the top of the footer */}
            <hr className="border-gray-700 mb-4 " />

            <div className="container mx-auto flex justify-between items-center px-10">
                {/* Left side: Logo and social media icons */}
                <div className="flex flex-col items-start space-y-4">
                    <div className="flex items-center space-x-4 pb-10">
                        <img src="/logo.png" alt="Restaurant Logo" className="w-20 h-20" />
                        <h1 className="text-xl font-bold dark:text-gray-400">PlateVista</h1>

                    </div>
                    <div>          <p className="text-sm text-gray-600 dark:text-gray-400"></p>
</div>
                    
                    
                </div>

                {/* Center: Contact Information */}
                <div className="text-center pr-5">
                <div>
                <a href="/about" className="text-gray-400 hover:text-orange-500">About Us</a> | 
                <a href="/contact" className="text-gray-400 hover:text-orange-500"> Contact Us</a>
                    </div>
                   
                    <p className="text-gray-400">
                        Phone: <a href="tel:+12345678901" className="text-blue-500 hover:underline">+1 (234) 567-8901</a>
                    </p>
                    <p className="text-gray-400">
                        Email: <a href="mailto:info@platevista.com" className="text-blue-500 hover:underline">info@platevista.com</a>
                    </p>
                    <p className="text-gray-400">1234 Delicious St, Food City, FC 56789</p>
                    <p className="text-gray-400">------------------------------------------------------</p>

                    <p className="text-gray-400">© 2024 PlateVista. All rights reserved.</p>

                 
                </div>

                {/* Right side: Empty Div to Balance Layout */}
                <div className="flex space-x-8 pb-20 ">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <img src="/icons/facebook.png" alt="Facebook" className="w-10 h-10" />
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <img src="/icons/instagram.png" alt="Instagram" className="w-10 h-10" />
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                            <img src="/icons/twitter.png" alt="Twitter" className="w-10 h-10" />
                        </a>
                        <div className="w-10"></div>

                    </div>
            </div>

          
        </footer>
    );
}

export default Footer;
