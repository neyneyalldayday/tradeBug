import 'dotenv/config'
import express from 'express';
import routes from './routes'


// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
// app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Initialize Alpaca client

app.use(routes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});