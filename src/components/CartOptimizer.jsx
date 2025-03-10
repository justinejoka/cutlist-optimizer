import React, { useState, useEffect } from 'react';

// Initial mock cutting orders (unoptimized)
const initialOrders = [
  { id: 1, timberType: 'Pine', requiredLength: 4.0, grade: 'A', quantity: 5 },
  { id: 2, timberType: 'Oak', requiredLength: 3.5, grade: 'B', quantity: 3 },
  { id: 3, timberType: 'Cedar', requiredLength: 2.0, grade: 'A', quantity: 10 },
  { id: 4, timberType: 'Fir', requiredLength: 5.0, grade: 'C', quantity: 2 },
  { id: 5, timberType: 'Spruce', requiredLength: 3.0, grade: 'B', quantity: 4 },
];

// Cost per meter for different timber types
const costMap = {
  Pine: 50,
  Oak: 80,
  Cedar: 70,
  Fir: 60,
  Spruce: 55,
};

const CartOptimizer = () => {
  const [orders, setOrders] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrder, setNewOrder] = useState({
    timberType: '',
    requiredLength: '',
    grade: '',
    quantity: '',
  });
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editedOrder, setEditedOrder] = useState({});

  // Load orders from localStorage or use initialOrders on first render
  useEffect(() => {
    const storedOrders = localStorage.getItem('cuttingOrders');
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders);
      if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
        setOrders(parsedOrders);
      } else {
        setOrders(initialOrders);
      }
    } else {
      setOrders(initialOrders);
    }
  }, []);

  // Persist orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('cuttingOrders', JSON.stringify(orders));
  }, [orders]);

  // Handle changes for new order inputs
  const handleNewOrderChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new cutting order
  const handleAddOrder = () => {
    if (
      !newOrder.timberType ||
      !newOrder.requiredLength ||
      !newOrder.grade ||
      !newOrder.quantity
    ) {
      alert('Please fill in all fields.');
      return;
    }
    const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;
    const orderToAdd = {
      id: newId,
      timberType: newOrder.timberType,
      requiredLength: parseFloat(newOrder.requiredLength),
      grade: newOrder.grade,
      quantity: parseInt(newOrder.quantity),
    };
    setOrders([...orders, orderToAdd]);
    setNewOrder({ timberType: '', requiredLength: '', grade: '', quantity: '' });
  };

  // Sorting handlers
  const handleSortFieldChange = (e) => setSortField(e.target.value);
  const handleSortOrderChange = (e) => setSortOrder(e.target.value);

  // Optimize orders based on chosen sort field and order
  const optimizeOrders = () => {
    const sortedOrders = [...orders];
    if (sortField === 'timberType') {
      sortedOrders.sort((a, b) => {
        const cmp = a.timberType.localeCompare(b.timberType);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    } else if (sortField === 'requiredLength') {
      sortedOrders.sort((a, b) =>
        sortOrder === 'asc'
          ? a.requiredLength - b.requiredLength
          : b.requiredLength - a.requiredLength
      );
    } else if (sortField === 'grade') {
      sortedOrders.sort((a, b) => {
        const cmp = a.grade.localeCompare(b.grade);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    } else if (sortField === 'quantity') {
      sortedOrders.sort((a, b) =>
        sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity
      );
    }
    setOrders(sortedOrders);
  };

  // Reset sort controls and restore initial unoptimized orders
  const resetSort = () => {
    setSortField('');
    setSortOrder('asc');
    setOrders(initialOrders);
  };

  // Remove an order
  const handleRemoveOrder = (id) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  // Handle order editing
  const startEditing = (order) => {
    setEditingOrderId(order.id);
    setEditedOrder({ ...order });
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setEditedOrder({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditedOrder = (id) => {
    setOrders(
      orders.map((order) =>
        order.id === id
          ? {
              ...order,
              timberType: editedOrder.timberType,
              requiredLength: parseFloat(editedOrder.requiredLength),
              grade: editedOrder.grade,
              quantity: parseInt(editedOrder.quantity),
            }
          : order
      )
    );
    cancelEditing();
  };

  // Change order quantity inline
  //const handleQuantityChange = (id, newQuantity) => {
   // if (newQuantity < 1) return;
    //setOrders(
     // orders.map((order) =>
       // order.id === id ? { ...order, quantity: newQuantity } : order
     // )
    //);
  //};

  // Confirm and empty all orders
  const handleEmptyOrders = () => {
    if (window.confirm('Are you sure you want to empty all orders?')) {
      setOrders([]);
    }
  };

  // Export orders as CSV
  const exportCSV = () => {
    const header = ['ID', 'Timber Type', 'Required Length', 'Grade', 'Quantity', 'Cost'];
    const csvRows = [
      header.join(','),
      ...orders.map((order) => {
        const cost = (
          order.requiredLength *
          order.quantity *
          (costMap[order.timberType] || 0)
        ).toFixed(2);
        return [
          order.id,
          order.timberType,
          order.requiredLength,
          order.grade,
          order.quantity,
          cost,
        ].join(',');
      }),
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cutting_orders.csv';
    a.click();
  };

  // Filter orders based on search query (timber type or grade)
  const filteredOrders = orders.filter(
    (order) =>
      order.timberType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary calculations
  const totalPieces = orders.reduce((acc, order) => acc + order.quantity, 0);
  const totalRequiredLength = orders.reduce(
    (acc, order) => acc + order.requiredLength * order.quantity,
    0
  );
  const totalCost = orders.reduce((acc, order) => {
    const costPerOrder = order.requiredLength * order.quantity * (costMap[order.timberType] || 0);
    return acc + costPerOrder;
  }, 0);

  // Generate order statistics (count by timber type)
  const orderStats = orders.reduce((acc, order) => {
    acc[order.timberType] = (acc[order.timberType] || 0) + order.quantity;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-4xl font-extrabold text-center text-emerald-700 mb-6">
          Timber CutList Optimization
        </h1>

        {/* New Order Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-600">
            Add Cutting Order
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="timberType"
              placeholder="Timber Type (e.g., Pine)"
              value={newOrder.timberType}
              onChange={handleNewOrderChange}
              className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <input
              type="number"
              name="requiredLength"
              placeholder="Required Length (m)"
              value={newOrder.requiredLength}
              onChange={handleNewOrderChange}
              className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <input
              type="text"
              name="grade"
              placeholder="Grade (A, B, C)"
              value={newOrder.grade}
              onChange={handleNewOrderChange}
              className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={newOrder.quantity}
              onChange={handleNewOrderChange}
              className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleAddOrder}
              className="w-full md:w-auto px-6 py-3 bg-teal-500 text-white font-semibold rounded hover:bg-teal-600 transition"
            >
              Add Order
            </button>
            <button
              onClick={exportCSV}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Search, Sorting & Empty Orders Controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="search" className="font-medium text-gray-700">
              Search:
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by timber type or grade"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="sortField" className="font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sortField"
              value={sortField}
              onChange={handleSortFieldChange}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">Select Field</option>
              <option value="timberType">Timber Type</option>
              <option value="requiredLength">Required Length</option>
              <option value="grade">Grade</option>
              <option value="quantity">Quantity</option>
            </select>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <button
              onClick={optimizeOrders}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
            >
              Optimize Orders
            </button>
            <button
              onClick={resetSort}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Reset Sort
            </button>
            <button
              onClick={handleEmptyOrders}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Empty Orders
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Timber Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Required Length (m)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Grade
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Total Length (m)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Cost ($)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <input
                        type="text"
                        name="timberType"
                        value={editedOrder.timberType}
                        onChange={handleEditChange}
                        className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    ) : (
                      order.timberType
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <input
                        type="number"
                        name="requiredLength"
                        value={editedOrder.requiredLength}
                        onChange={handleEditChange}
                        className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    ) : (
                      order.requiredLength.toFixed(2)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <input
                        type="text"
                        name="grade"
                        value={editedOrder.grade}
                        onChange={handleEditChange}
                        className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    ) : (
                      order.grade
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <input
                        type="number"
                        name="quantity"
                        value={editedOrder.quantity}
                        onChange={handleEditChange}
                        className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    ) : (
                      order.quantity
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(order.requiredLength * order.quantity).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {(
                      order.requiredLength *
                      order.quantity *
                      (costMap[order.timberType] || 0)
                    ).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <>
                        <button
                          onClick={() => saveEditedOrder(order.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(order)}
                          className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveOrder(order.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Orders Summary & Statistics */}
        <div className="mt-6 p-4 bg-emerald-50 rounded border border-emerald-100">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">
            Orders Summary
          </h2>
          <div className="flex justify-between mb-4">
            <p className="text-lg">
              Total Pieces: <span className="font-bold">{totalPieces}</span>
            </p>
            <p className="text-lg">
              Total Required Length: <span className="font-bold">{totalRequiredLength.toFixed(2)} m</span>
            </p>
            <p className="text-lg">
              Total Cost: <span className="font-bold">${totalCost.toFixed(2)}</span>
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Order Statistics (by Timber Type):
            </h3>
            <ul className="list-disc list-inside">
              {Object.entries(orderStats).map(([timber, count]) => (
                <li key={timber} className="text-gray-700">
                  {timber}: {count} pieces
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartOptimizer;
