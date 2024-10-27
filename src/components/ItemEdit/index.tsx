import React, { useState, useEffect } from 'react';

interface Item {
  id: number;
  name: string; // Use 'name' instead of 'title'
  price: number;
}

interface ItemEditProps {
  item: Item;
  onSave: (updatedItem: Item) => void;
  onCancel: () => void;
}

const ItemEdit = ({ item, onSave, onCancel }: ItemEditProps) => {
  const [editedName, setEditedName] = useState<string>(item.name);
  const [editedPrice, setEditedPrice] = useState<number>(item.price);
  const [isChanged, setIsChanged] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // State to control the visibility

  // Only update state when the item changes, not on every re-render
  useEffect(() => {
    setEditedName(item.name);
    setEditedPrice(item.price);
    setTimeout(() => setIsVisible(true), 10); // Add slight delay to trigger animation
  }, [item]);

  const handleClose = () => {
    if (isChanged) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        closeOffcanvas();
      }
    } else {
      closeOffcanvas();
    }
  };

  const closeOffcanvas = () => {
    setIsVisible(false); // Trigger slide-out animation
    setTimeout(() => onCancel(), 300); // Wait for animation to complete before closing
  };

  const handleSave = () => {
    onSave({ ...item, name: editedName, price: editedPrice });
    setIsChanged(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      ></div>

      {/* Offcanvas Wrapper with sliding from the right */}
      <div
        className={`fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg p-5 transform transition-transform duration-500 ease-in-out z-50 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit Item</h2>
          <button onClick={handleClose} className="text-red-500">X</button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Name</label> {/* Updated label */}
          <input
            type="text"
            value={editedName} // Bind input to 'editedName' state
            onChange={(e) => {
              setEditedName(e.target.value); // Update 'editedName' state
              setIsChanged(true);
            }}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Price</label>
          <input
            type="number"
            value={editedPrice} // Bind input to 'editedPrice' state
            onChange={(e) => {
              setEditedPrice(parseFloat(e.target.value)); // Update 'editedPrice' state
              setIsChanged(true);
            }}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemEdit;
