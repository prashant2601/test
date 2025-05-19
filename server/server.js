const express = require('express');
const connectDB = require('./Config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");

const authRoutes = require('./Routes/authRoutes');
const invoiceRoutes = require('./Routes/invoiceRoutes');
const customerRoutes = require('./Routes/customerRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const merchantRoutes = require('./Routes/merchantRoutes');
const emailRoutes = require('./Routes/emailRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const dashboardRoutes = require('./Routes/dashboardRoutes');
const expenseRoutes = require('./Routes/expenseRoutes');

const loadCronJobs = require('./Utils/jobsLoader');
const loadAgendaJobs = require('./JobsInLine/agendaJobsLoader');
const agenda = require('./agenda');

const authMiddleware = require('./Middlewares/authMiddleware');
const roleMiddleware = require('./Middlewares/roleMiddleware');


dotenv.config();

const app = express();

// Connect Database
connectDB();

app.use(cookieParser());

// app.use(cors())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.API_DOMAIN  
    : ['http://localhost:3001', 'http://localhost:3000'], 
  credentials: true, // This is important for cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Last-Active']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// Serve assets from the 'dist/assets' folder
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expense', expenseRoutes);

//Catch all other routes and return the index.html file from dist
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  // Ensure Agenda is ready before loading jobs
agenda.on('ready', async () => {
  await loadAgendaJobs(agenda);
});

(async function () {
  await agenda.start();
})();
loadAgendaJobs(agenda);
loadCronJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));