const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'senavirathna.db'));

// Tables හදනවා
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    from_location TEXT,
    to_location TEXT,
    start_km REAL,
    end_km REAL,
    total_km REAL,
    amount REAL NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    referrer_name TEXT,
    commission REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS fuel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    liters REAL,
    cost REAL NOT NULL,
    odometer REAL,
    hire_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    vehicle TEXT,
    description TEXT,
    workshop TEXT,
    cost REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT UNIQUE NOT NULL,
    model TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT,
    amount REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    distance_km REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    from_location TEXT,
    to_location TEXT,
    distance_km REAL,
    estimated_amount REAL,
    notes TEXT,
    status TEXT DEFAULT 'waiting',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Existing DB එකට columns එකතු කරනවා (නැත්නම්)
try {
  db.exec(`ALTER TABLE hires ADD COLUMN category TEXT`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE hires ADD COLUMN referrer_name TEXT`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE hires ADD COLUMN commission REAL DEFAULT 0`);
} catch (e) {}

// Default admin users
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(
    'admin',
    hashedPassword,
    'admin'
  );

  const hashedPassword2 = bcrypt.hashSync('manager123', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(
    'manager',
    hashedPassword2,
    'assistant'
  );
}

// Default routes (from Deraniyagala)
const routeExists = db.prepare('SELECT id FROM routes LIMIT 1').get();
if (!routeExists) {
  const insertRoute = db.prepare(
    'INSERT INTO routes (from_location, to_location, distance_km) VALUES (?, ?, ?)'
  );

  const defaultRoutes = [
    ['Deraniyagala', 'Dehiowita', 15],
    ['Deraniyagala', 'Avissawella', 23],
    ['Deraniyagala', 'Yatiyanthota', 25],
    ['Deraniyagala', 'Ruwanwella', 23],
    ['Deraniyagala', 'Kegalle', 59],
    ['Deraniyagala', 'Hanwella', 44],
    ['Deraniyagala', 'Homagama', 56],
    ['Deraniyagala', 'Maharagama', 66],
    ['Deraniyagala', 'Nugegoda', 69],
    ['Deraniyagala', 'Battaramulla', 63],
    ['Deraniyagala', 'Malabe', 57],
    ['Deraniyagala', 'Kaduwela', 54],
    ['Deraniyagala', 'Colombo Fort', 70],
    ['Deraniyagala', 'Pettah', 68],
    ['Deraniyagala', 'Borella', 68],
    ['Deraniyagala', 'Wellawatte', 74],
    ['Deraniyagala', 'Mount Lavinia', 73],
    ['Deraniyagala', 'Horana', 64],
    ['Deraniyagala', 'Bandaragama', 70],
    ['Deraniyagala', 'Panadura', 81],
    ['Deraniyagala', 'Kalutara', 88],
    ['Deraniyagala', 'Kadawatha', 62],
    ['Deraniyagala', 'Kiribathgoda', 66],
    ['Deraniyagala', 'Gampaha', 60],
    ['Deraniyagala', 'Negombo', 79],
    ['Deraniyagala', 'Katunayake Airport', 75],
    ['Deraniyagala', 'Eheliyagoda', 32],
    ['Deraniyagala', 'Ratnapura', 31],
    ['Deraniyagala', 'Parakaduwa', 39],
    ['Deraniyagala', 'Kuruwita', 22],
    ['Deraniyagala', 'Kandy', 97],
    ['Deraniyagala', 'Peradeniya', 92],
    ['Deraniyagala', 'Kadugannawa', 84],
    ['Deraniyagala', 'Gampola', 84],
    ['Deraniyagala', 'Matale', 121],
    ['Deraniyagala', 'Nuwara Eliya', 115],
    ['Deraniyagala', 'Galle', 163],
    ['Deraniyagala', 'Hikkaduwa', 153],
    ['Deraniyagala', 'Ambalangoda', 141],
    ['Deraniyagala', 'Elpitiya', 132],
    ['Deraniyagala', 'Matara', 194],
    ['Deraniyagala', 'Tangalle', 154],
    ['Deraniyagala', 'Hambantota', 161],
    ['Deraniyagala', 'Kataragama', 169],
    ['Deraniyagala', 'Tissamaharama', 163],
    ['Deraniyagala', 'Weerawila', 163],
    ['Deraniyagala', 'Kurunegala', 83],
    ['Deraniyagala', 'Anuradhapura', 189],
    ['Deraniyagala', 'Polonnaruwa', 210],
    ['Deraniyagala', 'Trincomalee', 252],
    ['Deraniyagala', 'Batticaloa', 309],
    ['Deraniyagala', 'Jaffna', 391],
    ['Deraniyagala', 'Ampara', 298],
    ['Deraniyagala', 'Puttalam', 167],
    ['Deraniyagala', 'Chilaw', 126],
    ['Deraniyagala', 'Wennappuwa', 99],
    ['Deraniyagala', 'Nattandiya', 106],
    ['Deraniyagala', 'Badulla', 160],
    ['Deraniyagala', 'Bandarawela', 133],
    ['Deraniyagala', 'Ella', 144],
    ['Deraniyagala', 'Haputale', 121],
    ['Deraniyagala', 'Monaragala', 205],
    ['Deraniyagala', 'Wellawaya', 173],
    ['Deraniyagala', 'Bibile', 217]
  ];

  defaultRoutes.forEach((r) => insertRoute.run(r[0], r[1], r[2]));
}

module.exports = db;