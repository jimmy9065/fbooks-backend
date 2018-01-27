var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var cors = require('cors');
var app = express();

var api = require('./router/api')

var corsOptions = {
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use('/api', api);

app.listen(8081);
