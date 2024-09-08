import React, { useState, useEffect } from 'react';

const ProductsTable = () => {
    const initialData = [
        { title: 'Product 1', price: 50 },
        { title: 'Product 2', price: 30 },
        { title: 'Product 3', price: 70 },
        { title: 'Product 4', price: 90 },
        { title: 'Product 5', price: 40 },
    ];

    const [data, setData] = useState(initialData);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
        key: 'title',
        direction: null,
    });

    // Load sorting config from localStorage on mount
    useEffect(() => {
        const savedSortKey = localStorage.getItem('sortKey');
        const savedSortDirection = localStorage.getItem('sortDirection');
        if (savedSortKey && savedSortDirection) {
            sortData(savedSortKey, savedSortDirection as 'asc' | 'desc');
        }
    }, []);

    const sortData = (key: string, direction: 'asc' | 'desc' = 'asc') => {
        const sortedData = [...data].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setSortConfig({ key, direction });
        setData(sortedData);

        // Save sorting config to localStorage
        localStorage.setItem('sortKey', key);
        localStorage.setItem('sortDirection', direction);
    };

    return (
        <div>
            <h2>Products Table</h2>
            <table className="min-w-full table-auto border-collapse border border-gray-400">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">#</th>
                        <th className="border px-4 py-2 cursor-pointer" onClick={() => sortData('title', sortConfig.direction === 'asc' ? 'desc' : 'asc')}>
                            Title {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className="border px-4 py-2 cursor-pointer" onClick={() => sortData('price', sortConfig.direction === 'asc' ? 'desc' : 'asc')}>
                            Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="border px-4 py-2">{index + 1}</td>
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
