/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

var databaseUrl = "mongodb://vara:test123@ds119802.mlab.com:19802/free-code-camp";
const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const mongoose = require('mongoose');

const cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
var redirectRoute;

mongoose.connect(databaseUrl);

mongoose.connection.on('connected', function() {
  console.log("Connected to MongoDB server",{useNewUrlParser: true});
  redirectRoute = mongoose.model('Route',{
    shortId: Number,
    url: String
  });
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

//Create new short url with random ID.
app.post('/api/shorturl/new',function(req,res){
  if(req.body.url){
    let newId = Math.floor(Math.random() * 1000000);
    redirectRoute.findOne({
       shortId: newId
    }, function(err,route){
      if (err) return console.log(err);
      if(route > 0){
        console.log(route);
        newId = Math.floor(Math.random() * 1000000);
      }
    });

    const newUrl = new redirectRoute({
        shortId: Math.floor(Math.random() * 1000000),
        url: req.body.url 
    });

    newUrl.save(function(err,savedUrl){
        if (err) return console.log(err);
        res.json({
          original_url: savedUrl.url,
          short_url: savedUrl.shortId
        });
    });
  }
});

// Retrieve original url and redirect
app.get('/api/shorturl/:shortcut_id',function(req,res){
   
   //Find original link and redirect.
   redirectRoute.findOne({
      shortId: req.params.shortcut_id
   }, function(err,route){
     if (err) return console.log(err);
     console.log(route);
     const targetUrl = route.url;
     res.redirect(targetUrl);
   });
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});