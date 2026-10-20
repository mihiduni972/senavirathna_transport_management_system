import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Expenses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ date: '', category: '', amount: '', notes: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    axios.get('http://localhost:5000/api/expenses/other').then(res => setRecords(res.data));
  };

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchData();
  }, [token, navigate]);

  const resetForm = () => {
    setForm({ date: '', category: '', amount: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r) => {
    setForm({
      date: r.date || '',
      category: r.category || '',
      amount: r.amount || '',
      notes: r.notes || ''
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date: form.date,
      category: form.category,
      amount: Number(form.amount),
      notes: form.notes
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/expenses/other/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/expenses/other', payload);
      }
      resetForm();
      fetchData();
    } catch {
      alert('Error saving expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await axios.delete(`http://localhost:5000/api/expenses/other/${id}`);
      fetchData();
    }
  };

  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Expenses</h2>
         <button
  onClick={() => {
    if (showForm) resetForm();
    else setShowForm(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  {showForm ? 'Cancel' : '+ Add Expense'}
</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="border p-2 rounded"
              required
            />

            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border p-2 rounded"
              required
            >
              <option value="">-- Select Category --</option>
              <option value="Finance">Finance</option>
              <option value="Home">Home</option>
              <option value="Insurance">Insurance</option>
              <option value="Building">Building</option>
              <option value="Parents">Parents</option>
              <option value="Party">Party</option>
              <option value="Trip">Trip</option>
              <option value="Vehicle Repair">Vehicle Repair</option>
              <option value="Fuel">Fuel</option>
              <option value="Medicine">Medicine</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="number"
              placeholder="Amount (Rs)"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Notes"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="border p-2 rounded"
            />

            <button type="submit" className="bg-blue-600 text-white py-2 rounded col-span-full hover:bg-blue-700">
              {editingId ? 'Update Expense' : 'Save Expense'}
            </button>
          </form>
        )}

       <div className="bg-white rounded-xl shadow px-4 overflow-hidden">
  <table className="w-full text-left">
    <thead className="bg-gray-50">
      <tr>
        <th className="py-3 px-3">Date</th>
        <th className="py-3 px-3">Category</th>
        <th className="py-3 px-3">Amount</th>
        <th className="py-3 px-3">Notes</th>
        <th className="py-3 px-3 text-center">Action</th>
      </tr>
    </thead>
    <tbody>
      {currentRecords.map((r) => (
        <tr key={r.id} className="border-t">
          <td className="py-3 px-3">{r.date}</td>
          <td className="py-3 px-3">{r.category}</td>
          <td className="py-3 px-3">Rs. {r.amount}</td>
          <td className="py-3 px-3">{r.notes || '-'}</td>
          <td className="py-3 px-3 text-center whitespace-nowrap space-x-1">
            <button
              onClick={() => handleEdit(r)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
      {records.length === 0 && (
        <tr>
          <td colSpan="5" className="p-6 text-center text-gray-500">
            No records
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Expenses;