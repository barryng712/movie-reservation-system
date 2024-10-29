require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./config/db');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandlerMiddleware = require('./middlewares/error-handler');

const authRoutes = require('./routes/authRoute');
const movieRoutes = require('./routes/movieRoute');
const showtimeRoutes = require('./routes/showtimeRoute');
const roomRoutes = require('./routes/roomRoute');
const reservationRoutes = require('./routes/reservationRoute');
const revenueRoutes = require('./routes/revenueRoute');

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(errorHandlerMiddleware);
app.use(xss());
app.use(helmet());
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/revenues', revenueRoutes);

const port = process.env.PORT || 3000;

//connect to the database
try {
    const main  = async () => {
        await sequelize.authenticate()
        console.log('Connection has been established successfully.')
        app.listen(port, ()=>{
            console.log(`Server is running on port ${port}`)
        })
    }
    main()
} catch (error) {
    console.error(error)
}