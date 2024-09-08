import React from 'react';
import Link from 'next/link';

const Sidebar = () => (
    <aside className="w-64 bg-gray-700 p-5 text-white">
        <nav>
            <ul>
                <li>
                    <Link href="/products">
                        Products
                    </Link>
                </li>
                <li>
                    <Link href="/categories">
                        Categories
                    </Link>
                </li>
                <li>
                    <Link href="/settings">
                        Settings
                    </Link>
                </li>
            </ul>
        </nav>
    </aside>
);

export default Sidebar;
