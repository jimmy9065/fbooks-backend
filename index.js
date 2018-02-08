var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var url = require('url');
var cors = require('cors');
var app = express();

var api = require('./router/api')

var corsOptions = {
  //origin: true,
  origin: [
    /jimmy9065.ddns.net[:0-9]*/,
    /[[a-z].]*jimmyliu.info[:0-9]*/,
    'http://localhost:8080',
  ],
  optionsSuccessStatus: 200,
  credentials: true
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', api);

app.use(function(req, res, next){
  res.status(404).send('Request not supported yet')
})

app.listen(8081);
