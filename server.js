const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const PORT = process.env.PORT || 8888;
const dataBase = require('./db/dbConfig');
const server = express();

server.use(cors());
server.use(express.json());
server.use(morgan('dev'));
server.use(session({
    secret: 'asdfghjkl;',
    resave: true,
    saveUninitialized: true
}));



dataBase.once('open', () => {
    console.log('MongoDb connected.');
})

const usersRouter = require('./routes/userRoutes');

server.use('/users', usersRouter);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
