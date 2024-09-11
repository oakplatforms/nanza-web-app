interface Item {
    id: number;
    title: string;
    price: number;
}

// Initial data that will be modified by users
let items: Item[] = [
    { id: 1, title: 'Item 1', price: 50 },
    { id: 2, title: 'Item 2', price: 30 },
    { id: 3, title: 'Item 3', price: 70 },
    { id: 4, title: 'Item 4', price: 90 },
    { id: 5, title: 'Item 5', price: 40 },
];

// Function to fetch all items (simulates an API call)
export const fetchItems = (): Promise<Item[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(items);
        }, 500); // Simulate a delay
    });
};

// Function to update an item (simulates an API call)
export const updateItem = (updatedItem: Item): Promise<Item> => {
    return new Promise((resolve) => {
        items = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
        setTimeout(() => {
            resolve(updatedItem);
        }, 500); // Simulate a delay
    });
};
