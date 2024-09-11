import React, { useState, useEffect, useCallback } from 'react';
import ItemEdit from '../ItemEdit';
import { fetchItems, updateItem } from '../../data/mockData';

interface Item {
    id: number;
    title: string;
    price: number;
}

const ItemsTable = () => {
    const [data, setData] = useState<Item[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: 'asc' | 'desc' }>({
        key: 'title',
        direction: 'asc',
    });
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

    // Memoize sortData function to prevent it from being redefined on every render
    const sortData = useCallback((key: keyof Item, direction: 'asc' | 'desc' = 'asc', items = data) => {
        const sortedData = [...items].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setSortConfig({ key, direction });
        setData(sortedData);

        // Save sorting config to localStorage
        localStorage.setItem('sortKey', key);
        localStorage.setItem('sortDirection', direction);
    }, [data]);

    // Fetch items from mockData on mount
    useEffect(() => {
        const loadItems = async () => {
            const items = await fetchItems();
            setData(items);

            // Check if there's a saved sorting configuration in localStorage
            const savedSortKey = localStorage.getItem('sortKey') as keyof Item | null;
            const savedSortDirection = localStorage.getItem('sortDirection') as 'asc' | 'desc' | null;

            if (savedSortKey && savedSortDirection) {
                sortData(savedSortKey, savedSortDirection, items);
            }
        };
        loadItems();
    }, [sortData]); // Include sortData in the dependency array

    const handleSave = async (updatedItem: Item) => {
        const savedItem = await updateItem(updatedItem);
        setData((prevData) =>
            prevData.map((item) => (item.id === savedItem.id ? savedItem : item))
        );
        setEditingItemId(null);
    };

    return (
        <div>
            <h2>Items Table</h2>
            <table className="min-w-full table-auto border-collapse border border-gray-400">
                <thead>
                    <tr>
                        <th
                            className="border px-4 py-2 cursor-pointer"
                            onClick={() =>
                                sortData('title', sortConfig.direction === 'asc' ? 'desc' : 'asc')
                            }
                        >
                            Title {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="border px-4 py-2 cursor-pointer"
                            onClick={() =>
                                sortData('price', sortConfig.direction === 'asc' ? 'desc' : 'asc')
                            }
                        >
                            Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id} className="group">
                            <td className="border px-4 py-2">
                                <span className="inline-block float-left">
                                    {item.title}
                                </span>
                                <button
                                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded inline-block float-left opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    onClick={() => setEditingItemId(item.id)}
                                >
                                    Open
                                </button>
                            </td>
                            <td className="border px-4 py-2">${item.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingItemId && (
                <ItemEdit
                    item={data.find((p) => p.id === editingItemId)!}
                    onSave={handleSave}
                    onCancel={() => setEditingItemId(null)}
                />
            )}
        </div>
    );
};

export default ItemsTable;
