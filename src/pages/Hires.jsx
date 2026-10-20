import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const HIRE_CATEGORIES = [
  'Wedding Hire',
  'Funeral Hire',
  'Trip',
  'Convention Hire',
  'Party Hire',
  'Puja Hire',
  'Garment Hire',
  'Airport Hire',
  'Hospital Hire',
  'Office Hire',
  'Other'
];

function Hires() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [hires, setHires] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedHire, setSelectedHire] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [form, setForm] = useState({
    date: '',
    category: '',
    customer_name: '',
    customer_phone: '',
    from_location: '',
    to_location: '',
    start_km: '',
    end_km: '',
    discount: '',
    amount: '',
    payment_status: 'pending',
    referrer_name: '',
    commission: ''
  });

  const RATE_PER_KM = 120;

  const fetchHires = () => {
    axios
      .get('http://localhost:5000/api/hires')
      .then((res) => setHires(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHires();
  }, [token, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const totalKm =
    form.start_km !== '' && form.end_km !== ''
      ? Number(form.end_km) - Number(form.start_km)
      : 0;

  const calculatedAmount = totalKm > 0 ? totalKm * RATE_PER_KM : 0;
  const discountValue = Number(form.discount) || 0;
  const autoFinal =
    calculatedAmount - discountValue > 0 ? calculatedAmount - discountValue : 0;

  // KM හෝ discount වෙනස් වුණාම Final Amount auto update
  useEffect(() => {
    if (form.start_km === '' || form.end_km === '') return;
    setForm((prev) => ({
      ...prev,
      amount: autoFinal > 0 ? String(autoFinal) : ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.start_km, form.end_km, form.discount]);

  const resetForm = () => {
    setForm({
      date: '',
      category: '',
      customer_name: '',
      customer_phone: '',
      from_location: '',
      to_location: '',
      start_km: '',
      end_km: '',
      discount: '',
      amount: '',
      payment_status: 'pending',
      referrer_name: '',
      commission: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (hire) => {
    setSelectedHire(null);
    setForm({
      date: hire.date || '',
      category: hire.category || '',
      customer_name: hire.customer_name || '',
      customer_phone: hire.customer_phone || '',
      from_location: hire.from_location || '',
      to_location: hire.to_location || '',
      start_km: hire.start_km ?? '',
      end_km: hire.end_km ?? '',
      discount: '',
      amount: hire.amount ?? '',
      payment_status: hire.payment_status || 'pending',
      referrer_name: hire.referrer_name || '',
      commission: hire.commission ?? ''
    });
    setEditingId(hire.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.end_km) < Number(form.start_km)) {
      alert('End KM must be greater than Start KM');
      return;
    }

    const saveAmount = Number(form.amount);
    if (!saveAmount && saveAmount !== 0) {
      alert('Enter Final Amount');
      return;
    }

    const payload = {
      date: form.date,
      category: form.category,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      from_location: form.from_location,
      to_location: form.to_location,
      start_km: Number(form.start_km),
      end_km: Number(form.end_km),
      amount: saveAmount,
      payment_status: form.payment_status,
      referrer_name: form.referrer_name,
      commission: Number(form.commission) || 0
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/hires/${editingId}`, payload);
        showToast('Updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/hires', payload);
        showToast('Saved successfully');
      }
      resetForm();
      fetchHires();
      setCurrentPage(1);
    } catch (err) {
      alert('Error saving hire');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this hire?')) {
      await axios.delete(`http://localhost:5000/api/hires/${id}`);
      fetchHires();
      setSelectedHire(null);
      showToast('Deleted successfully');
    }
  };

  const firstName = (name) => {
    if (!name) return '-';
    return name.trim().split(' ')[0];
  };

  const totalPages = Math.ceil(hires.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHires = hires.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">All Hires</h2>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Hire'}
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

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border p-2 rounded"
              required
            >
              <option value="">-- Select Hire Category --</option>
              {HIRE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

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
              placeholder="From"
              value={form.from_location}
              onChange={(e) => setForm({ ...form, from_location: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="To"
              value={form.to_location}
              onChange={(e) => setForm({ ...form, to_location: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Start KM"
              value={form.start_km}
              onChange={(e) => setForm({ ...form, start_km: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="End KM"
              value={form.end_km}
              onChange={(e) => setForm({ ...form, end_km: e.target.value })}
              className="border p-2 rounded"
              required
            />

            <div className="border p-2 rounded bg-gray-50">
              Total KM: <strong>{totalKm > 0 ? totalKm : '-'}</strong>
            </div>
            <div className="border p-2 rounded bg-gray-50">
              Auto (Rs.120/km): <strong>Rs. {calculatedAmount.toLocaleString()}</strong>
            </div>

            <input
              type="number"
              placeholder="Discount (Rs)"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="border p-2 rounded"
            />

            {/* Editable Final Amount */}
            <div>
              <input
                type="number"
                placeholder="Final Amount (Rs)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-filled from KM. You can change this amount if needed.
              </p>
            </div>

            <input
              type="text"
              placeholder="Referrer name (who found this hire)"
              value={form.referrer_name}
              onChange={(e) => setForm({ ...form, referrer_name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Commission (Rs)"
              value={form.commission}
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
              className="border p-2 rounded"
            />

            <select
              value={form.payment_status}
              onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded col-span-full hover:bg-blue-700"
            >
              {editingId ? 'Update Hire' : 'Save Hire'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow px-4 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">From → To</th>
                <th className="py-3 px-3">KM</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Commission</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentHires.map((hire) => (
                <tr key={hire.id} className="border-t">
                  <td className="py-3 px-3">{hire.date}</td>
                  <td className="py-3 px-3 max-w-[100px] truncate" title={hire.category}>
                    {hire.category || '-'}
                  </td>
                  <td className="py-3 px-3 max-w-[100px] truncate" title={hire.customer_name}>
                    {firstName(hire.customer_name)}
                  </td>
                  <td
                    className="py-3 px-3 max-w-[140px] truncate"
                    title={`${hire.from_location} → ${hire.to_location}`}
                  >
                    {hire.from_location} → {hire.to_location}
                  </td>
                  <td className="py-3 px-3 font-semibold">{hire.total_km}</td>
                  <td className="py-3 px-3">Rs. {hire.amount}</td>
                  <td className="py-3 px-3">
                    {hire.commission ? `Rs. ${hire.commission}` : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded">
                      {hire.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-left whitespace-nowrap space-x-1">
                    <button
                      onClick={() => setSelectedHire(hire)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(hire)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hire.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-2.5 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {hires.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">
                    No hires yet
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

      {selectedHire && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedHire(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Hire Details</h3>
              <button
                onClick={() => setSelectedHire(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{selectedHire.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{selectedHire.category || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{selectedHire.customer_name || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{selectedHire.customer_phone || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">From</span>
                <span className="font-medium">{selectedHire.from_location || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">To</span>
                <span className="font-medium">{selectedHire.to_location || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Total KM</span>
                <span className="font-medium">{selectedHire.total_km ?? '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">Rs. {selectedHire.amount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Referrer</span>
                <span className="font-medium">{selectedHire.referrer_name || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Commission</span>
                <span className="font-medium">
                  {selectedHire.commission ? `Rs. ${selectedHire.commission}` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">
                  {selectedHire.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleEdit(selectedHire)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedHire(null)}
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

export default Hires;