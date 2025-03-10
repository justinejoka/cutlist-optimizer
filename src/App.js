import React, { useState, useEffect } from 'react';

const initialCart = [
  { id: 1, name: 'Apple', price: 1.2, storeSection: 'Fruits', quantity: 3 },
  { id: 2, name: 'Bread', price: 2.5, storeSection: 'Bakery', quantity: 2 },
  { id: 3, name: 'Milk', price: 1.5, storeSection: 'Dairy', quantity: 1 },
  { id: 4, name: 'Banana', price: 0.8, storeSection: 'Fruits', quantity: 5 },
  { id: 5, name: 'Cheese', price: 3.0, storeSection: 'Dairy', quantity: 1 },
];

const CartOptimizer = () => {
  const [cart, setCart] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load cart from localStorage or use initialCart on first render
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    } else {
      setCart(initialCart);
    }
  }, []);

  // Persist cart state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cart));
  }, [cart]);

  // Update sort criteria
  const handleSortChange = (e) => setSortBy(e.target.value);

  // Optimize (sort) cart based on selected criteria
  const optimizeCart = () => {
    const sortedCart = [...cart];
    if (sortBy === 'price') {
      sortedCart.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'storeSection') {
      sortedCart.sort((a, b) => a.storeSection.localeCompare(b.storeSection));
    }
    setCart(sortedCart);
  };

  // Remove an item from the cart
  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Update the quantity of an item
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  // Filter cart items based on search query (name or store section)
  const filteredCart = cart.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.storeSection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Cart List Optimization</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <label htmlFor="search" className="mr-2 font-medium">Search:</label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or section"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="sortBy" className="mr-2 font-medium">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">Select Criteria</option>
              <option value="price">Price</option>
              <option value="storeSection">Store Section</option>
            </select>
            <button
              onClick={optimizeCart}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Optimize Cart
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price ($)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Store Section</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total ($)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCart.map(item => (
                <tr key={item.id} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{item.storeSection}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-16 p-1 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                    />
                  </td>
                  <td className="px-4 py-3">{(item.price * item.quantity).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCart.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="text-2xl font-semibold mb-2">Cart Summary</h2>
          <div className="flex justify-between">
            <p className="text-lg">
              Total Items: <span className="font-bold">{totalItems}</span>
            </p>
            <p className="text-lg">
              Total Price: <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartOptimizer;
