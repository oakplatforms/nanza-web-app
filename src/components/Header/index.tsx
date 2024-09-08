import React from 'react';
import Link from 'next/link';

const Header = () => (
    <header className="bg-gray-800 text-white p-4 text-center flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
            OPS Admin
        </Link>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
        </button>
    </header>
);

export default Header;
