import React, { useState, useEffect, useCallback } from 'react';

interface Product {
    title: string;
    price: number;
}

const ProductsTable = () => {
    const initialData: Product[] = [
        { title: 'Product 1', price: 50 },
        { title: 'Product 2', price: 30 },
        { title: 'Product 3', price: 70 },
        { title: 'Product 4', price: 90 },
        { title: 'Product 5', price: 40 },
    ];

    const [data, setData] = useState<Product[]>(initialData);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' | null }>({
        key: 'title',
        direction: null,
    });

    // Sort data function
    const sortData = useCallback(
        (key: keyof Product, direction: 'asc' | 'desc' = 'asc') => {
            setData((prevData) => {
                const sortedData = [...prevData].sort((a, b) => {
                    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
                    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
                    return 0;
                });

                return sortedData;
            });

            setSortConfig({ key, direction });

            // Save sorting config to localStorage
            localStorage.setItem('sortKey', key);
            localStorage.setItem('sortDirection', direction);
        },
        [setData, setSortConfig]
    );

    // Load sorting config from localStorage on mount
    useEffect(() => {
        const savedSortKey = localStorage.getItem('sortKey') as keyof Product | null;
        const savedSortDirection = localStorage.getItem('sortDirection') as 'asc' | 'desc' | null;
        if (savedSortKey && savedSortDirection) {
            sortData(savedSortKey, savedSortDirection);
        }
    }, [sortData]); // Include sortData in the dependency array

    return (
        <div>
            <h2>Products Table</h2>
            <table className="min-w-full table-auto border-collapse border border-gray-400">
                <thead>
                    <tr>
                        <th
                            className="border px-4 py-2 cursor-pointer"
                            onClick={() => sortData('title', sortConfig.direction === 'asc' ? 'desc' : 'asc')}
                        >
                            Title {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="border px-4 py-2 cursor-pointer"
                            onClick={() => sortData('price', sortConfig.direction === 'asc' ? 'desc' : 'asc')}
                        >
                            Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="border px-4 py-2">{item.title}</td>
                            <td className="border px-4 py-2">${item.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductsTable;
