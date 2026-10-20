import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import jsPDF from 'jspdf';

const PIE_COLORS = ['#059669', '#b91c1c', '#1e40af'];

function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      axios.get('http://localhost:5000/api/summary'),
      axios.get('http://localhost:5000/api/summary/monthly')
    ])
      .then(([sumRes, monthRes]) => {
        setSummary(sumRes.data);
        setMonthly(monthRes.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, navigate]);

  const filteredMonthly = useMemo(() => {
    if (!fromDate && !toDate) return monthly;

    return monthly.filter((m) => {
      const key = String(m.month || '');
      let monthStart = null;

      if (/^\d{4}-\d{2}$/.test(key)) {
        monthStart = new Date(`${key}-01`);
      } else {
        const parsed = new Date(key);
        if (!isNaN(parsed)) {
          monthStart = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
        }
      }
      if (!monthStart || isNaN(monthStart)) return true;

      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && monthEnd < from) return false;
      if (to && monthStart > to) return false;
      return true;
    });
  }, [monthly, fromDate, toDate]);

  const totals = useMemo(() => {
    if (!fromDate && !toDate) {
      return {
        income: Number(summary?.income || 0),
        expenses: Number(summary?.expenses || 0),
        profit: Number(summary?.profit || 0),
        hires: Number(summary?.hireCount || 0)
      };
    }
    const income = filteredMonthly.reduce((s, m) => s + Number(m.income || 0), 0);
    const expenses = filteredMonthly.reduce((s, m) => s + Number(m.expenses || 0), 0);
    const profit = filteredMonthly.reduce((s, m) => s + Number(m.profit || 0), 0);
    const hires = filteredMonthly.reduce((s, m) => s + Number(m.hireCount || 0), 0);
    return { income, expenses, profit, hires };
  }, [summary, filteredMonthly, fromDate, toDate]);

  const pieData = [
    { name: 'Income', value: totals.income },
    { name: 'Expenses', value: totals.expenses },
    { name: 'Profit', value: Math.max(totals.profit, 0) }
  ].filter((d) => d.value > 0);

  const periodLabel =
    fromDate || toDate ? `${fromDate || '...'}  to  ${toDate || '...'}` : 'All Time';

  const clearFilter = () => {
    setFromDate('');
    setToDate('');
  };

  const handleDownloadPDF = async () => {
    try {
      const [hiresRes, fuelRes, repairsRes, expensesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/hires'),
        axios.get('http://localhost:5000/api/fuel'),
        axios.get('http://localhost:5000/api/expenses/repairs'),
        axios.get('http://localhost:5000/api/expenses/other')
      ]);

      const hires = hiresRes.data || [];
      const fuel = fuelRes.data || [];
      const repairs = repairsRes.data || [];
      const expenses = expensesRes.data || [];

      const inRange = (dateStr) => {
        if (!dateStr) return true;
        if (fromDate && dateStr < fromDate) return false;
        if (toDate && dateStr > toDate) return false;
        return true;
      };

      const hiresF = hires.filter((h) => inRange(h.date));
      const fuelF = fuel.filter((f) => inRange(f.date));
      const repairsF = repairs.filter((r) => inRange(r.date));
      const expensesF = expenses.filter((e) => inRange(e.date));

      const totalIncome = hiresF.reduce((s, h) => s + Number(h.amount || 0), 0);
      const totalCommission = hiresF.reduce((s, h) => s + Number(h.commission || 0), 0);
      const totalFuel = fuelF.reduce((s, f) => s + Number(f.cost || 0), 0);
      const totalRepairs = repairsF.reduce((s, r) => s + Number(r.cost || 0), 0);
      const totalOther = expensesF.reduce((s, e) => s + Number(e.amount || 0), 0);
      const totalDeductions = totalFuel + totalRepairs + totalOther + totalCommission;
      const netProfit = totalIncome - totalDeductions;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      let y = 0;

      // ===== HEADER (only company name) =====
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SENAVIRATHNA TRANSPORT', pageWidth / 2, 12, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });

      y = 38;

      // ===== INFO BLOCK (clean rows) =====
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);

      doc.text('Report Date', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(dateStr, margin + 45, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Period', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(periodLabel, margin + 45, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Prepared by', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(user?.username || 'Admin', margin + 45, y);

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Total Hires', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(hiresF.length), margin + 45, y);

      y += 6;
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);

      // ===== 1. INCOME =====
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text('1. Income', margin, y);

      y += 8;
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, y - 5, contentWidth, 12, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text('Hire Income', margin + 4, y + 3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 120, 80);
      doc.text(`Rs. ${totalIncome.toLocaleString()}`, pageWidth - margin - 4, y + 3, {
        align: 'right'
      });

      // ===== 2. DEDUCTIONS =====
      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text('2. Deductions', margin, y);

      const deductions = [
        { label: 'Fuel', value: totalFuel },
        { label: 'Repairs', value: totalRepairs },
        { label: 'Other Expenses', value: totalOther },
        { label: 'Commission', value: totalCommission }
      ];

      y += 8;
      deductions.forEach((item, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y - 4.5, contentWidth, 9, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(item.label, margin + 4, y);
        doc.text(`Rs. ${item.value.toLocaleString()}`, pageWidth - margin - 4, y, {
          align: 'right'
        });
        y += 9;
      });

      // Total deductions
      y += 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text('Total Deductions', margin + 4, y);
      doc.setTextColor(185, 28, 28);
      doc.text(`Rs. ${totalDeductions.toLocaleString()}`, pageWidth - margin - 4, y, {
        align: 'right'
      });

      // ===== 3. NET PROFIT =====
      y += 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text('3. Net Profit', margin, y);

      y += 6;
      const isProfit = netProfit >= 0;
      if (isProfit) {
        doc.setFillColor(232, 245, 233);
        doc.setDrawColor(46, 125, 50);
      } else {
        doc.setFillColor(255, 235, 238);
        doc.setDrawColor(198, 40, 40);
      }
      doc.setLineWidth(0.8);
      doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text('NET PROFIT', margin + 6, y + 10);
      doc.setTextColor(isProfit ? 27 : 183, isProfit ? 94 : 28, isProfit ? 32 : 28);
      doc.setFontSize(13);
      doc.text(`Rs. ${netProfit.toLocaleString()}`, pageWidth - margin - 6, y + 10, {
        align: 'right'
      });

      y += 24;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        'Formula: Hire Income - (Fuel + Repairs + Other Expenses + Commission)',
        margin,
        y
      );

      // ===== 4. COUNTS =====
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text('4. Record Counts', margin, y);

      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      const counts = [
        ['Hires', hiresF.length],
        ['Fuel records', fuelF.length],
        ['Repair records', repairsF.length],
        ['Other expenses', expensesF.length]
      ];

      counts.forEach(([label, value]) => {
        doc.text(label, margin + 4, y);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), pageWidth - margin - 4, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        y += 7;
      });

      // ===== SIGNATURE =====
      y = Math.max(y + 10, pageHeight - 55);

      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);

      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text('Authorization', margin, y);

      y += 9;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Owner / Manager: ................................', margin, y);
      doc.text('Signature: ........................', margin + 95, y);

      y += 9;
      doc.text(`Date: ${dateStr}`, margin, y);

      doc.setDrawColor(160);
      doc.rect(pageWidth - margin - 42, y - 16, 42, 24);
      doc.setFontSize(7);
      doc.setTextColor(140);
      doc.text('Official Stamp', pageWidth - margin - 21, y - 3, { align: 'center' });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(130);
      doc.text(
        'Senavirathna Transport  |  Confidential',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );

      doc.save(`Senavirathna_Report_${today.toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error generating PDF');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full p-10">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            {(fromDate || toDate) && (
              <button
                onClick={clearFilter}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-2 rounded-lg"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg"
            >
              Download PDF Report
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Period: <strong>{periodLabel}</strong>
          {' · '}
          Income <strong className="text-green-600">Rs. {totals.income.toLocaleString()}</strong>
          {' · '}
          Expenses <strong className="text-red-600">Rs. {totals.expenses.toLocaleString()}</strong>
          {' · '}
          Profit <strong className="text-blue-600">Rs. {totals.profit.toLocaleString()}</strong>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Overview</h3>
            {filteredMonthly.length === 0 ? (
              <p className="text-gray-500 text-center py-16">No data for selected period</p>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={filteredMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    formatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Income Breakdown</h3>
            {pieData.length === 0 ? (
              <p className="text-gray-500 text-center py-16">No data for pie chart</p>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;