import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Fuel() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [hires, setHires] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    date: '',
    liters: '',
    cost: '',
    odometer: '',
    hire_id: ''
  });

  const fetchData = () => {
    axios.get('http://localhost:5000/api/fuel').then((res) => setRecords(res.data));
  };

  const fetchHires = () => {
    axios.get('http://localhost:5000/api/hires').then((res) => setHires(res.data));
  };

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchData();
    fetchHires();
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const resetForm = () => {
    setForm({ date: '', liters: '', cost: '', odometer: '', hire_id: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r) => {
    setSelected(null);
    setForm({
      date: r.date || '',
      liters: r.liters ?? '',
      cost: r.cost ?? '',
      odometer: r.odometer ?? '',
      hire_id: r.hire_id ? String(r.hire_id) : ''
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date: form.date,
      liters: Number(form.liters) || null,
      cost: Number(form.cost),
      odometer: Number(form.odometer) || null,
      hire_id: form.hire_id ? Number(form.hire_id) : null
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/fuel/${editingId}`, payload);
        showToast('Updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/fuel', payload);
        showToast('Saved successfully');
      }
      resetForm();
      fetchData();
    } catch {
      alert('Error saving fuel record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this fuel record?')) {
      await axios.delete(`http://localhost:5000/api/fuel/${id}`);
      fetchData();
      setSelected(null);
      showToast('Deleted successfully');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Fuel Records</h2>
         <button
  onClick={() => {
    if (showForm) resetForm();
    else setShowForm(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  {showForm ? 'Cancel' : '+ Add Fuel'}
</button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Liters"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Cost (Rs)"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Odometer"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })}
              className="border p-2 rounded"
            />

            <select
              value={form.hire_id}
              onChange={(e) => setForm({ ...form, hire_id: e.target.value })}
              className="border p-2 rounded col-span-full"
            >
              <option value="">-- Select Hire (Optional) --</option>
              {hires.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.id} | {h.date} | {h.customer_name} | {h.from_location} → {h.to_location}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded col-span-full hover:bg-blue-700"
            >
              {editingId ? 'Update Fuel Record' : 'Save Fuel Record'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow px-4 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Liters</th>
                <th className="py-3 px-3">Cost</th>
                <th className="py-3 px-3">Odometer</th>
                <th className="py-3 px-3">Related Hire</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3 px-3">{r.date}</td>
                  <td className="py-3 px-3">{r.liters || '-'}</td>
                  <td className="py-3 px-3">Rs. {r.cost}</td>
                  <td className="py-3 px-3">{r.odometer || '-'}</td>
                  <td className="py-3 px-3">{r.hire_id || '-'}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap space-x-1">
  <button
    onClick={() => setSelected(r)}
    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
  >
    View
  </button>
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
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No fuel records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Fuel Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{selected.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Liters</span>
                <span className="font-medium">{selected.liters || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Cost</span>
                <span className="font-medium">Rs. {selected.cost}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Odometer</span>
                <span className="font-medium">{selected.odometer || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Related Hire</span>
                <span className="font-medium">{selected.hire_id || '-'}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleEdit(selected)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-gray-800 text-sm px-5 py-3 rounded-xl shadow-lg border border-gray-200">
          {toast}
        </div>
      )}
    </Layout>
  );
}

export default Fuel;