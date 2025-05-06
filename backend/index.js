const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const user_db = require('./user_db');
const path = require('path');
const bcrypt = require('bcrypt'); // ✅ Add bcrypt

const app = express();
const PORT = 3000;
const saltRounds = 10;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({message:`server is running`});
  });

app.post('/add-expense', (req, res) => {
    const { amount, date, category, userEmail } = req.body;

    // Get user_id from email
    const getUserQuery = 'SELECT id FROM users WHERE email = ?';
    user_db.query(getUserQuery, [userEmail], (err, results) => {
        if (err || results.length === 0) {
            console.error("User lookup failed:", err);
            return res.status(400).send("Invalid user.");
        }

        const userId = results[0].id;

        const insertQuery = `INSERT INTO expenses (amount, date, category, user_id) VALUES (?, ?, ?, ?)`;
        user_db.query(insertQuery, [amount, date, category, userId], (err) => {
            if (err) {
                console.error("Error inserting expense:", err);
                return res.status(500).send("Error saving expense.");
            }

            res.send("Expense added successfully.");
        });
    });
});





// Route to handle signup (with hashing)
app.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds); // ✅ Hash password

        const query = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
        user_db.query(query, [fullname, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.send('Error registering user.');
            }
            res.send('User registered successfully!');
        });
    } catch (err) {
        console.error('Hashing error:', err);
        res.send('Error while processing password.');
    }
});

// Route to handle login (with hashed password check)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    user_db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.send('error');
        }

        if (results.length > 0) {
            const user = results[0];

            const match = await bcrypt.compare(password, user.password); // ✅ Compare hash

            if (match) {
                res.send('success');
            } else {
                res.send('fail');
            }
        } else {
            res.send('fail');
        }
    });
});


// Utility to get current month range
function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${now.getMonth() + 1}-01`;
  const lastDay = `${now.getFullYear()}-${now.getMonth() + 1}-31`;
  return [firstDay, lastDay];
}

app.get('/api/stats', (req, res) => {
    const email = req.query.userEmail;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    const getUserIdQuery = 'SELECT id FROM users WHERE email = ?';
    user_db.query(getUserIdQuery, [email], (err, results) => {
        if (err || results.length === 0) {
            console.error("User lookup failed:", err);
            return res.status(400).json({ error: 'Invalid user' });
        }

        const userId = results[0].id;
        const [startDate, endDate] = getCurrentMonthRange();

        const statsQuery = `
            SELECT IFNULL(SUM(amount), 0) as totalSpent
            FROM expenses 
            WHERE user_id = ? AND date BETWEEN ? AND ?
        `;

        user_db.query(statsQuery, [userId, startDate, endDate], (err, results) => {
            if (err) {
                console.error("Stats fetch error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            const totalSpent = results[0].totalSpent;
            const budget = 2000;
            const percentUsed = Math.round((totalSpent / budget) * 100);
            const remaining = budget - totalSpent;

            res.json({ 
                totalSpent: totalSpent // Returns as raw number
            });
        });
    });
});

app.get('/api/total-spent', (req, res) => {
    const email = req.query.userEmail;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    const getUserIdQuery = 'SELECT id FROM users WHERE email = ?';
    user_db.query(getUserIdQuery, [email], (err, userResults) => {
        if (err) {
            console.error("User lookup failed:", err);
            return res.status(500).json({ 
                error: "Database error",
                details: err.message 
            });
        }

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userResults[0].id;
        console.log(`Fetching expenses for user ID: ${userId}`);

        const totalQuery = `
            SELECT IFNULL(SUM(amount), 0) AS totalSpentAllTime
            FROM expenses
            WHERE user_id = ?
        `;

        user_db.query(totalQuery, [userId], (err, expenseResults) => {
            if (err) {
                console.error("Total spent fetch error:", err);
                return res.status(500).json({ 
                    error: "Database error",
                    details: err.message 
                });
            }

            console.log("Raw query results:", expenseResults);

            let rawValue = expenseResults?.[0]?.totalSpentAllTime;
            console.log("💡 Raw totalSpent value:", rawValue, typeof rawValue);

            let totalSpent = 0;

            if (Buffer.isBuffer(rawValue)) {
                totalSpent = parseFloat(rawValue.toString());
            } else if (typeof rawValue === 'string') {
                totalSpent = parseFloat(rawValue);
            } else if (typeof rawValue === 'number') {
                totalSpent = rawValue;
            }

            if (isNaN(totalSpent)) {
                console.warn("⚠️ totalSpent is NaN — resetting to 0");
                totalSpent = 0;
            }

            res.json({ totalSpent: totalSpent.toFixed(2) });
        });
    });
});

app.get('/api/last-expense', (req, res) => {
    const email = req.query.userEmail;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    const getUserIdQuery = 'SELECT id FROM users WHERE email = ?';
    user_db.query(getUserIdQuery, [email], (err, results) => {
        if (err || results.length === 0) {
            console.error("User lookup failed:", err);
            return res.status(400).json({ error: 'Invalid user' });
        }

        const userId = results[0].id;

        const lastExpenseQuery = `
            SELECT amount, DATE_FORMAT(date, '%Y-%m-%d') AS date 
            FROM expenses 
            WHERE user_id = ? 
            ORDER BY date DESC 
            LIMIT 1
        `;

        user_db.query(lastExpenseQuery, [userId], (err, expenseResults) => {
            if (err) {
                console.error("Last expense fetch error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (expenseResults.length === 0) {
                return res.json({ amount: 0, date: "No data" });
            }

            const { amount, date } = expenseResults[0];
            res.json({ amount, date });
        });
    });
});



app.get('/api/last-6-days', (req, res) => {
    const email = req.query.userEmail;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    const getUserIdQuery = 'SELECT id FROM users WHERE email = ?';
    user_db.query(getUserIdQuery, [email], (err, results) => {
        if (err || results.length === 0) {
            console.error("User lookup failed:", err);
            return res.status(400).json({ error: 'Invalid user' });
        }

        const userId = results[0].id;

        const query = `
        SELECT 
            DATE(date) as day, 
            SUM(amount) as total 
        FROM expenses 
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 5 DAY)
        GROUP BY day
        ORDER BY day ASC
        `;

        // Add this after your database query
console.log("User query results:", results);

        user_db.query(query, [userId], (err, results) => {
            if (err) {
                console.error("6-day chart fetch error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            res.json(results); // [{ day: '2025-04-08', total: 500 }, ...]
        });
    });
});







    app.get('/status', (req, res) => {
        res.send('ok'); // confirm server is alive
    });
    
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
    