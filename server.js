
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gallery'
};

app.get('/api/albums', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.query('SELECT * FROM albums');
    await connection.end();
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/album/:id', async (req, res) => {
  const albumId = req.params.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.query('SELECT * FROM albums WHERE id = ?', [albumId]);
    await connection.end();
    if (results.length === 0) return res.status(404).json({ success: false, error: 'Album not found' });
    res.json({ success: true, data: results[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/authenticate-album', async (req, res) => {
  const { albumId, email, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.query(
      'SELECT * FROM album_access WHERE album_id = ? AND email = ? AND password_hash = ?',
      [albumId, email, password]
    );
    await connection.end();
    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log('API running on port 3001'));
