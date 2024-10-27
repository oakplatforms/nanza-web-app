import React, { useState } from 'react';

interface Item {
  id: number;
  name: string;
  price: number;
}

interface ItemCreateProps {
  onCreate: (newItem: Omit<Item, 'id'>) => void;
  onCancel: () => void;
}

const ItemCreate = ({ onCreate, onCancel }: ItemCreateProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(''); // Price is either a number or empty string for form

  const handleSave = () => {
    if (name && price) {
      onCreate({ name, price: Number(price) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 z-40"
        onClick={onCancel}
      ></div>

      {/* Offcanvas Wrapper with sliding from the right */}
      <div
        className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg p-5 transform transition-transform duration-500 ease-in-out z-50"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Create New Item</h2>
          <button onClick={onCancel} className="text-red-500">X</button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter item name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter item price"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Add Item
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCreate;
