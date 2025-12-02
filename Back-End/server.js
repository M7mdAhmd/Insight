const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const userRoutes = require('./routes/user');
const paperRoutes = require('./routes/paper');
const searchRoutes = require('./routes/search');
const reviewRoutes = require('./routes/review');
const downloadRoutes = require('./routes/download');
const fieldRoutes = require('./routes/field');
const authorRoutes = require('./routes/author');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/stats', require('./routes/stats'));

const dbConfig = {
    user: 'sa',
    password: 'InsightAdmin1225',
    server: 'localhost\\SQLEXPRESS',
    database: 'ResearchDB',
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};

sql.connect(dbConfig)
   .then(() => console.log('Database connected successfully'))
   .catch(err => console.error('Database connection failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
