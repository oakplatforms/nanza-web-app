import React, { useState, useEffect, useCallback } from 'react';
import ItemEdit from '../ItemEdit';
import ItemCreate from '../ItemCreate';

interface Item {
  id: number;
  name: string;
  price: number;
}

const ItemsTable = () => {
  const [data, setData] = useState<Item[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Function to handle sorting
  const sortData = (key: keyof Item, direction: 'asc' | 'desc' = 'asc', items = data) => {
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
  };

  // Fetch items from the API on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/api/products'); // Fetch from your products API
        const items = await response.json();
        setData(items);

        // Apply saved sorting configuration
        const savedSortKey = localStorage.getItem('sortKey') as keyof Item | null;
        const savedSortDirection = localStorage.getItem('sortDirection') as 'asc' | 'desc' | null;

        if (savedSortKey && savedSortDirection) {
          sortData(savedSortKey, savedSortDirection, items); // Apply saved sorting
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadItems();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Create item using the POST method
  const handleCreate = async (newItem: Omit<Item, 'id'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const createdItem = await response.json();
      setData((prevData) => [...prevData, createdItem]); // Add new item to the table
      setIsCreating(false); // Close the create form
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  // Update item using the PUT method
  const handleSave = async (updatedItem: Item) => {
    try {
      const response = await fetch(`/api/products/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      const savedItem = await response.json();
      setData((prevData) =>
        prevData.map((item) => (item.id === savedItem.id ? savedItem : item))
      );
      setEditingItemId(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  // Function to handle manual sorting triggered by user interaction
  const handleSort = (key: keyof Item) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    sortData(key, direction);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Items Table</h2>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => setIsCreating(true)}
        >
          Add New Item
        </button>
      </div>

      <table className="min-w-full table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort('price')}
            >
              Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="group">
              <td className="border px-4 py-2">
                <span className="inline-block float-left">
                  {item.name}
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

      {editingItemId !== null && (
        <ItemEdit
          item={data.find((p) => p.id === editingItemId)!}
          onSave={handleSave}
          onCancel={() => setEditingItemId(null)}
        />
      )}

      {isCreating && (
        <ItemCreate
          onCreate={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </div>
  );
};

export default ItemsTable;
