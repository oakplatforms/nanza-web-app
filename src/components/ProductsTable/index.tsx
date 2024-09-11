import React, { useState, useCallback } from 'react';
import ItemEdit from '../ItemEdit';

interface Product {
    id: number;
    title: string;
    price: number;
}

const ItemsTable = () => {
    const initialData: Product[] = [
        { id: 1, title: 'Product 1', price: 50 },
        { id: 2, title: 'Product 2', price: 30 },
        { id: 3, title: 'Product 3', price: 70 },
        { id: 4, title: 'Product 4', price: 90 },
        { id: 5, title: 'Product 5', price: 40 },
    ];

    const [data, setData] = useState<Product[]>(initialData);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);

    const handleSave = useCallback((updatedProduct: Product) => {
        setData((prevData) =>
            prevData.map((product) =>
                product.id === updatedProduct.id ? updatedProduct : product
            )
        );
        setEditingProductId(null);
    }, []);

    return (
        <div>
            <h2>Products Table</h2>
            <table className="min-w-full table-auto border-collapse border border-gray-400">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">#</th>
                        <th className="border px-4 py-2">Title</th>
                        <th className="border px-4 py-2">Price</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id}>
                            <td className="border px-4 py-2">{index + 1}</td>
                            <td className="border px-4 py-2">{item.title}</td>
                            <td className="border px-4 py-2">${item.price}</td>
                            <td className="border px-4 py-2">
                                <button
                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                    onClick={() => setEditingProductId(item.id)}
                                >
                                    Open
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingProductId && (
                <ItemEdit
                    product={data.find((p) => p.id === editingProductId)!}
                    onSave={handleSave}
                    onCancel={() => setEditingProductId(null)}
                />
            )}
        </div>
    );
};

export default ItemsTable;
