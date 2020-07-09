const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const PORT = process.env.PORT || 8888;
const dataBase = require('./db/dbConfig');
const server = express();

server.use(cors({origin: true, credentials: true}));

server.use(helmet());
server.use(express.json());
server.use(morgan('dev'));
server.use(session({
    secret: 'asdfghjkl;',
    resave: true,
    saveUninitialized: true
}));

dataBase.once('open', () => {
    console.log('MongoDb connected.');
});

const usersRouter = require('./routes/userRoutes');
const categoriesRouter = require('./routes/categoryRoutes');
const businessRouter = require('./routes/businessRoutes');
const addressRouter = require('./routes/addressRoutes');

server.use('/users', usersRouter);
server.use('/categories', categoriesRouter);
server.use('/businesses', businessRouter);
server.use('/address', addressRouter);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
