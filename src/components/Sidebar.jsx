import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Fare Calculator', path: '/fare' },
    { name: 'Waiting Calls', path: '/calls' },
    { name: 'Hires', path: '/hires' },
    { name: 'Fuel', path: '/fuel' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Repairs', path: '/repairs' },
    { name: 'Expenses', path: '/expenses' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-blue-800 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="bg-white/15 rounded-lg p-2 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7 text-white"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-white font-bold text-sm tracking-wide">SENAVIRATHNA</p>
            <p className="text-teal-500 text-xs tracking-widest">TRANSPORT</p>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
              location.pathname === item.path
                ? 'bg-blue-600 font-semibold'
                : 'hover:bg-blue-700'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      <div className="border-t border-blue-600 pt-4">
        <p className="text-sm text-blue-200 mb-2">
          {user?.username} ({user?.role})
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;