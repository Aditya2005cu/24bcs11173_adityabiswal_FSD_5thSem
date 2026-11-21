import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/transactions';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all transactions on load
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setTransactions(data);
      setError('');
    } catch (err) {
      setError('Could not connect to backend server. Make sure Express & MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          type,
          category,
          date,
        }),
      });

      if (!res.ok) throw new Error('Failed to add transaction');
      const created = await res.json();

      setTransactions([created, ...transactions]);
      setTitle('');
      setAmount('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTransactions(transactions.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Filtered list
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="container">
      <header className="header">
        <h1>Personal Expense & Budget Tracker</h1>
        <p>MERN Stack Full-Stack Project</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="card balance-card">
          <span>Total Balance</span>
          <h2>₹{balance.toLocaleString('en-IN')}</h2>
        </div>
        <div className="card income-card">
          <span>Total Income</span>
          <h2>+₹{totalIncome.toLocaleString('en-IN')}</h2>
        </div>
        <div className="card expense-card">
          <span>Total Expense</span>
          <h2>-₹{totalExpense.toLocaleString('en-IN')}</h2>
        </div>
      </div>

      <div className="main-grid">
        {/* Add Transaction Form */}
        <section className="panel">
          <h3>Add Transaction</h3>
          <form onSubmit={handleAddTransaction} className="tx-form">
            <label>
              Title
              <input
                type="text"
                placeholder="e.g., Canteen Lunch, Stipend"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label>
              Amount (₹)
              <input
                type="number"
                placeholder="e.g., 250"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>

            <div className="row">
              <label>
                Type
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <label>
                Category
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Academics">Academics</option>
                  <option value="Rent & Bills">Rent & Bills</option>
                  <option value="Salary / Allowance">Salary / Allowance</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <label>
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="btn-primary">
              + Add Transaction
            </button>
          </form>
        </section>

        {/* Transaction List */}
        <section className="panel">
          <div className="list-header">
            <h3>Transaction History</h3>
            <div className="filters">
              <input
                type="text"
                placeholder="Search title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="empty-state">No transactions found.</p>
          ) : (
            <ul className="tx-list">
              {filteredTransactions.map((tx) => (
                <li key={tx._id} className={`tx-item ${tx.type}`}>
                  <div>
                    <strong>{tx.title}</strong>
                    <div className="meta">
                      <span className="badge">{tx.category}</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                  <div className="tx-right">
                    <span className={`amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDelete(tx._id)}
                      className="btn-delete"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;