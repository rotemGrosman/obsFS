const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require('mongoose');
const compression = require('compression');

const config = require("./config.js");
const apiRouter = require("./routes/api");
const ExpectedTimesService = require("./services/expectedTimesService");
const RealRuningTimesService = require("./services/realRuningTimesService");

const mongoUri = process.env.MONGODB_ADDON_URI || config.mongodb.uri;
const expressPort = Number(process.env.NODE_PORT) ? process.env.NODE_PORT : config.express.defualtPort;

mongoose.connect(mongoUri, { useNewUrlParser: true });
const expectedTimesService = new ExpectedTimesService(mongoose);
const realRuningTimesService = new RealRuningTimesService({mongoose, expectedTimesService});

const app = express();

app.use(cors());
app.use(compression());
app.use(express.static(path.join(__dirname, 'react/build')));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use('/api', apiRouter({expectedTimesService, realRuningTimesService}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'react/build', 'index.html'));
});

app.listen(expressPort);
console.log(`listening on port ${expressPort}`);