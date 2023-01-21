var express = require('express')
const path = require("path");
var app = express()

const http = require('http');

var module  = require('../app')
var PG = module.method2

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'none' /data/ranks.geojson",
        {
            'content-type': 'text/plain', 
            'host': '0.0.0.0'
        }
    );
    res.end('Hello World');
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const static_path = path.join(__dirname, "public");
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.send('home')
}) 

app.get('/data/points', function (req, res) {

    var sql = "select id,ST_AsGeoJson(geom) as geometry from points;";
    // var strSql = req.query.code == undefined ? sql :
    //    sql + " where code='" + req.query.code + "'";

    pgclient.exec(sql, function (ds) {
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8'
        });

        try {
            var geojson = DataToGeoJson(ds)

            res.end(JSON.stringify(geojson));
        } catch (error) {}
    })
})

app.get('/data/routes3', function (req, res) {

    res.sendFile(path.join(__dirname, '../data', 'routes3.geojson'));
})

app.get('/data/ranks', function (req, res) {

    res.sendFile(path.join(__dirname, '../data', 'ranks.geojson'));
})

app.post('/saver', function (req, res) {

    res.json({
        geomReceived : req.body.geom,
    })
    
    const tablename = req.body.table

    var keyNames = Object.keys(req.body.properties);
    var fields = keyNames.toString()

    const geom = req.body.geom

    const values = req.body.properties

    pgclient.save(tablename, fields, values, geom, function (req, res) {
        console.log(res)
    })  
})