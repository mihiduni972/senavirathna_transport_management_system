import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Repairs() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [form, setForm] = useState({
    date: '',
    vehicle: '',
    description: '',
    workshop: '',
    cost: '',
    notes: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    axios.get('http://localhost:5000/api/expenses/repairs').then((res) => setRecords(res.data));
  };

  const fetchVehicles = () => {
    axios.get('http://localhost:5000/api/vehicles').then((res) => setVehicles(res.data));
  };

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchData();
    fetchVehicles();
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const resetForm = () => {
    setForm({ date: '', vehicle: '', description: '', workshop: '', cost: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r) => {
    setSelected(null);
    setForm({
      date: r.date || '',
      vehicle: r.vehicle || '',
      description: r.description || '',
      workshop: r.workshop || '',
      cost: r.cost || '',
      notes: r.notes || ''
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date: form.date,
      vehicle: form.vehicle,
      description: form.description,
      workshop: form.workshop,
      cost: Number(form.cost),
      notes: form.notes
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/expenses/repairs/${editingId}`, payload);
        showToast('Updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/expenses/repairs', payload);
        showToast('Saved successfully');
      }
      resetForm();
      fetchData();
    } catch {
      alert('Error saving repair');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this repair record?')) {
      await axios.delete(`http://localhost:5000/api/expenses/repairs/${id}`);
      fetchData();
      setSelected(null);
      showToast('Deleted successfully');
    }
  };

  const filteredRecords = vehicleFilter
    ? records.filter((r) => (r.vehicle || '').toLowerCase() === vehicleFilter.toLowerCase())
    : records;

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const vehicleList = [...new Set(records.map((r) => r.vehicle).filter(Boolean))].sort();
  const filteredTotal = filteredRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Repair Records</h2>
        <button
  onClick={() => {
    if (showForm) resetForm();
    else setShowForm(true);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  {showForm ? 'Cancel' : '+ Add Repair'}
</button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative inline-block">
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm pl-4 pr-10 py-2.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-400 min-w-[160px]"
            >
              <option value="">All Vehicles</option>
              {vehicleList.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 text-xs">
              ▼
            </span>
          </div>

          {vehicleFilter && (
            <p className="text-sm text-gray-600">
              Total repair cost for <strong>{vehicleFilter}</strong>:{' '}
              <strong>Rs. {filteredTotal.toLocaleString()}</strong>
            </p>
          )}
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

            <select
              value={form.vehicle}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              className="border p-2 rounded"
              required
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.number}>
                  {v.number} {v.model ? `(${v.model})` : ''}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Description (what was repaired)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Workshop / Place"
              value={form.workshop}
              onChange={(e) => setForm({ ...form, workshop: e.target.value })}
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
              type="text"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded col-span-full hover:bg-blue-700"
            >
              {editingId ? 'Update Repair' : 'Save Repair'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow px-4 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Workshop</th>
                <th className="py-3 px-3">Cost</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3 px-3">{r.date}</td>
                  <td className="py-3 px-3 max-w-[120px] truncate" title={r.vehicle}>
                    {r.vehicle || '-'}
                  </td>
                  <td className="py-3 px-3 max-w-[160px] truncate" title={r.description}>
                    {r.description || '-'}
                  </td>
                  <td className="py-3 px-3 max-w-[120px] truncate" title={r.workshop}>
                    {r.workshop || '-'}
                  </td>
                  <td className="py-3 px-3">Rs. {r.cost}</td>
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
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
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
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
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
              <h3 className="text-lg font-semibold text-gray-800">Repair Details</h3>
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
                <span className="text-gray-500">Vehicle</span>
                <span className="font-medium">{selected.vehicle || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-right max-w-[60%]">
                  {selected.description || '-'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Workshop</span>
                <span className="font-medium">{selected.workshop || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Cost</span>
                <span className="font-medium">Rs. {selected.cost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Notes</span>
                <span className="font-medium text-right max-w-[60%]">
                  {selected.notes || '-'}
                </span>
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

export default Repairs;