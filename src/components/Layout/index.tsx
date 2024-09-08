import React, { ReactNode } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-grow">
                <Sidebar />
                <main className="flex-grow p-5">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
