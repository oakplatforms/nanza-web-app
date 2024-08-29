// src/app/page.tsx

// Use client directive to ensure this component is treated as a client component
"use client";

import React, { useState } from 'react';

export default function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      alert(`Login attempt with Username: ${username} and Password: ${password}`);
    };  

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <main className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-white p-4 text-center flex justify-between items-center">
                <h1>OPS Admin</h1>
                <button onClick={openModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Login
                </button>
            </header>
            {isModalOpen && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg">
                        <form onSubmit={handleSubmit} className="mb-5">
                            <div className="mb-3">
                                <label htmlFor="username" className="block mb-1 text-sm font-bold">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="w-full p-2 border rounded"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="block mb-1 text-sm font-bold">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full p-2 border rounded"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Log In</button>
                            <button type="button" onClick={closeModal} className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
                        </form>
                    </div>
                </div>
            )}
            <div className="flex flex-grow">
                <aside className="w-64 bg-gray-700 p-5 text-white">
                    <nav>
                        <ul>
                            <li><a href="#" className="block py-2">Products</a></li>
                            <li><a href="#" className="block py-2">Categories</a></li>
                            <li><a href="#" className="block py-2">Settings</a></li>
                        </ul>
                    </nav>
                </aside>
                <section className="flex-grow p-5">
                    <h2 className="text-lg font-bold">Dashboard</h2>
                    <p>No products available.</p>
                </section>
            </div>
        </main>
    );
}
