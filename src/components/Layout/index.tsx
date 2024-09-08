// src/components/Layout/index.tsx
import React from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Main content wrapper */}
            <div className="flex flex-grow">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content */}
                <main className="flex-grow p-5">
                    {children} {/* This will render the page content */}
                </main>
            </div>
        </div>
    );
};

export default Layout;
