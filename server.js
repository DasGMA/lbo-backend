const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 8888;
const server = express();

server.use(cors());
server.use(express.json());

const dataBase = require('./db/dbConfig');
dataBase.once('open', () => {
    console.log('MongoDb connected.');
})


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
