import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Calls() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    customer_phone: '',
    from_location: 'Deraniyagala',
    to_location: '',
    notes: ''
  });
  const [estimated, setEstimated] = useState(null);

  const fetchCalls = () => {
    axios.get('http://localhost:5000/api/calls/waiting').then((res) => setCalls(res.data));
  };

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchCalls();
    axios.get('http://localhost:5000/api/routes').then((res) => setRoutes(res.data));
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const locations = [...new Set(routes.map((r) => r.to_location))].sort();

  const handleToChange = async (to) => {
    setForm({ ...form, to_location: to });
    if (!to) {
      setEstimated(null);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/routes/distance?from=${form.from_location}&to=${to}`
      );
      setEstimated(res.data);
    } catch {
      setEstimated(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/calls', {
      ...form,
      distance_km: estimated?.distance_km || null,
      estimated_amount: estimated?.amount || null
    });
    setShowForm(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      customer_name: '',
      customer_phone: '',
      from_location: 'Deraniyagala',
      to_location: '',
      notes: ''
    });
    setEstimated(null);
    fetchCalls();
    showToast('Call saved successfully');
  };

  const handleConvert = async (id) => {
    if (window.confirm('Convert this call to a Hire?')) {
      await axios.post(`http://localhost:5000/api/calls/${id}/convert`);
      fetchCalls();
      setSelectedCall(null);
      showToast('Converted successfully');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this call?')) {
      await axios.delete(`http://localhost:5000/api/calls/${id}`);
      fetchCalls();
      setSelectedCall(null);
      showToast('Deleted successfully');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Waiting Calls</h2>
          <button
  onClick={() => setShowForm(!showForm)}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  {showForm ? 'Cancel' : '+ Add Call'}
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
              type="text"
              placeholder="Customer Name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              value={form.from_location}
              onChange={(e) => setForm({ ...form, from_location: e.target.value })}
              className="border p-2 rounded"
              placeholder="From"
            />
            <select
              value={form.to_location}
              onChange={(e) => handleToChange(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">-- Select Destination --</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border p-2 rounded"
            />

            {estimated && (
              <div className="col-span-full bg-gray-50 border border-gray-200 p-3 rounded">
                Distance: <strong>{estimated.distance_km} KM</strong> | Estimated Fare:{' '}
                <strong>Rs. {estimated.amount.toLocaleString()}</strong>
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded col-span-full hover:bg-blue-700"
            >
              Save Call
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow px-4 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">From → To</th>
                <th className="py-3 px-3">KM</th>
                <th className="py-3 px-3">Estimated</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-3 px-3">{c.date}</td>
                  <td className="py-3 px-3 max-w-[120px] truncate" title={c.customer_name}>
                    {c.customer_name}
                  </td>
                  <td
                    className="py-3 px-3 max-w-[180px] truncate"
                    title={`${c.from_location} → ${c.to_location}`}
                  >
                    {c.from_location} → {c.to_location}
                  </td>
                  <td className="py-3 px-3">{c.distance_km || '-'}</td>
                  <td className="py-3 px-3">
                    Rs. {c.estimated_amount?.toLocaleString() || '-'}
                  </td>
                  <td className="py-3 px-3 max-w-[100px] truncate" title={c.notes || ''}>
                    {c.notes || '-'}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap space-x-1">
                    <button
                      onClick={() => setSelectedCall(c)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleConvert(c.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
                    >
                      Convert
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {calls.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    No waiting calls
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCall && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCall(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Call Details</h3>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{selectedCall.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{selectedCall.customer_name || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{selectedCall.customer_phone || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">From</span>
                <span className="font-medium">{selectedCall.from_location || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">To</span>
                <span className="font-medium">{selectedCall.to_location || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Distance</span>
                <span className="font-medium">
                  {selectedCall.distance_km ? `${selectedCall.distance_km} KM` : '-'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Estimated Fare</span>
                <span className="font-medium">
                  {selectedCall.estimated_amount
                    ? `Rs. ${selectedCall.estimated_amount.toLocaleString()}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Notes</span>
                <span className="font-medium text-right max-w-[60%]">
                  {selectedCall.notes || '-'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleConvert(selectedCall.id)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Convert
              </button>
              <button
                onClick={() => setSelectedCall(null)}
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

export default Calls;