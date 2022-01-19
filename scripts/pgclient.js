var pgclient = require('./pg')
var express = require('express')
const path = require("path");
var app = express()
var geoJson = require('./GeoJsonUtil')

const http = require('http');

const PORT = 5555

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader({
        'content-type': 'text/plain', 
        'host': 'https://rute-map.herokuapp.com', 
        'accept': '*'
    });
    res.end('Hello World');
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const static_path = path.join(__dirname, "public");
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));

//set the cross-domain 
function setCross(res) {
    //settings allow cross-domain name, the domain cross-domain allows any * represents
    res.header("Access-Control-Allow-Origin", "*");
    //allowed type header
    res.header("Access-Control-Allow-Headers", "content-type");
    //cross-domain request allows manner
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
}

function DataToGeoJson(ds) {
    var jsonDS = JSON.stringify(ds);
    // console.log("jsonDS ds: "+ ds + " - " + jsonDS)
    // the cb has the results.rows

    var geojson = {
        "type": "FeatureCollection"
    }
    var features = [];
    jsonDS = eval('(' + jsonDS + ')')

    for (var p in jsonDS) {
        var PO = jsonDS[p]

        var pRet = geoJson.ToGeoJson(PO);
        // console.log("PO: " + PO)

        features.push(pRet)
    }
    geojson.features = features;
    return geojson;
}
/*
app.get('/', function (req, res) {
    res.send('home')
}) */

app.get('/data/points', function (req, res) {

    setCross(res)
    var sql = "select id,ST_AsGeoJson(geom) as geometry from draw_point;";
    // var strSql = req.query.code == undefined ? sql :
    //    sql + " where code='" + req.query.code + "'";

    pgclient.exec(sql, function (ds) {
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8'
        });

            try {
                var geojson = DataToGeoJson(ds)

                res.end(JSON.stringify(geojson));
            } catch (error) {
        }
    })
})

app.get('/data/routes3.geojson', function (req, res) {

    setCross(res)
    res.sendFile(path.join(__dirname, '../data', 'routes3.geojson'));
})

app.get('/data/ranks.geojson', function (req, res) {

    setCross(res)
    res.sendFile(path.join(__dirname, '../data', 'ranks.geojson'));
})

app.post('/saver', function (req, res) {

    setCross(res)

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