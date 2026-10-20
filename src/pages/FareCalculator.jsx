import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function FareCalculator() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [from, setFrom] = useState('Deraniyagala');
  const [to, setTo] = useState('');
  const [tripType, setTripType] = useState('round');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('fare'); // fare | fuel

  const FUEL_KM_PER_LITER = 8;
  const FUEL_PRICE_PER_LITER = 382;
  const RATE_PER_KM = 120;

  useEffect(() => {
    if (!token) return navigate('/login');
    axios.get('http://localhost:5000/api/routes').then((res) => setRoutes(res.data));
  }, [token, navigate]);

  const locations = [...new Set(routes.map((r) => r.to_location))].sort();

  const handleCalculate = async () => {
    if (!to) return alert('Select destination');
    try {
      const res = await axios.get(
        `http://localhost:5000/api/routes/distance?from=${from}&to=${to}`
      );
      setResult(res.data);
    } catch {
      alert('Route not found');
      setResult(null);
    }
  };

  const handleReset = () => {
    setTo('');
    setResult(null);
    setTripType('round');
  };

  const oneWayKm = result?.distance_km || 0;
  const totalKm = tripType === 'round' ? oneWayKm * 2 : oneWayKm;

  const goingFare = oneWayKm * RATE_PER_KM;
  const returnFare = tripType === 'round' ? oneWayKm * RATE_PER_KM : 0;
  const totalFare = goingFare + returnFare;

  const fuelLiters = totalKm > 0 ? totalKm / FUEL_KM_PER_LITER : 0;
  const fuelCost = fuelLiters * FUEL_PRICE_PER_LITER;

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Fare & Fuel Calculator</h2>

        {/* Top buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('fare')}
            className={`px-5 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'fare'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Fare Calculator
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`px-5 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'fuel'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Fuel Calculator
          </button>
        </div>

        {/* Fare Calculator */}
        {activeTab === 'fare' && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Fare Calculator</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-1">From</label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">To</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">-- Select Destination --</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Trip Type</label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="one">One Way (Up only)</option>
                  <option value="round">Round Trip (Up + Down)</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleCalculate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>

            {result && (
              <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-base text-gray-800 font-medium">
                  {result.from_location} → {result.to_location}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {tripType === 'round' ? 'Round Trip (Up + Down)' : 'One Way (Up only)'}
                </p>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500">Distance (one way)</p>
                    <p className="font-semibold text-base">{oneWayKm} KM</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Going (Up)</p>
                    <p className="font-semibold text-base">Rs. {goingFare.toLocaleString()}</p>
                  </div>
                  {tripType === 'round' && (
                    <div>
                      <p className="text-gray-500">Return (Down)</p>
                      <p className="font-semibold text-base">Rs. {returnFare.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Total Fare</p>
                    <p className="font-bold text-lg text-gray-900">
                      Rs. {totalFare.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Rate: Rs. {RATE_PER_KM} per KM</p>
              </div>
            )}
          </div>
        )}

        {/* Fuel Calculator */}
        {activeTab === 'fuel' && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Fuel Calculator</h3>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
              <p>
                1 Liter ={' '}
                <span className="font-semibold text-gray-800">{FUEL_KM_PER_LITER} KM</span>
              </p>
              <p>
                1 Liter price ={' '}
                <span className="font-semibold text-gray-800">Rs. {FUEL_PRICE_PER_LITER}</span>
              </p>
            </div>

            {/* Same route inputs so fuel can calculate even if user opens fuel tab first */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-1">From</label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">To</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">-- Select Destination --</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Trip Type</label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="one">One Way (Up only)</option>
                  <option value="round">Round Trip (Up + Down)</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleCalculate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>

            {oneWayKm > 0 ? (
              <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500">Total Distance</p>
                    <p className="font-semibold text-base">
                      {totalKm} KM {tripType === 'round' ? '(Up + Down)' : '(Up only)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fuel needed</p>
                    <p className="font-semibold text-base">{fuelLiters.toFixed(2)} Liters</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fuel Cost</p>
                    <p className="font-bold text-lg text-gray-900">
                      Rs. {Math.round(fuelCost).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm">
                Select destination and click Calculate to see fuel cost.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default FareCalculator;