import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Vehicles() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ number: '', model: '', notes: '' });

  const fetchData = () => {
    axios.get('http://localhost:5000/api/vehicles').then((res) => setRecords(res.data));
  };

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchData();
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const resetForm = () => {
    setForm({ number: '', model: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r) => {
    setForm({ number: r.number || '', model: r.model || '', notes: r.notes || '' });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/vehicles/${editingId}`, form);
        showToast('Updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/vehicles', form);
        showToast('Saved successfully');
      }
      resetForm();
      fetchData();
    } catch {
      alert('Error saving vehicle (number may already exist)');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
      fetchData();
      showToast('Deleted successfully');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Vehicles</h2>
        <button
  onClick={() => {
    if (showForm) resetForm();
    else setShowForm(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  {showForm ? 'Cancel' : '+ Add Vehicle'}
</button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Vehicle number (e.g. ABC-1234)"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Model (e.g. Toyota Hiace)"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border p-2 rounded col-span-full"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded col-span-full hover:bg-blue-700"
            >
              {editingId ? 'Update Vehicle' : 'Save Vehicle'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow px-4 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3">Number</th>
                <th className="py-3 px-3">Model</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3 px-3 font-medium">{r.number}</td>
                  <td className="py-3 px-3">{r.model || '-'}</td>
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
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No vehicles registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-gray-800 text-sm px-5 py-3 rounded-xl shadow-lg border border-gray-200">
          {toast}
        </div>
      )}
    </Layout>
  );
}

export default Vehicles;