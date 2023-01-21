var express = require('express');
var path = require('path')
var PG = require('../scripts/pg')
var router = express.Router();
var geoJson = require('../scripts/GeoJsonUtil')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.log('got home')
});


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

router.get('/data/routes3', function (req, res) {

    console.log('tryinf')
    res.sendFile(path.join(__dirname, '../data', 'routes3.geojson'));
})

router.get('/data/ranks', function (req, res) {

    res.sendFile(path.join(__dirname, '../data', 'ranks.geojson'));
})



router.get('/data/points', function (req, res) {

    var sql = "select id, ST_AsGeoJson(geom) as geometry from points;";
    // var strSql = req.query.code == undefined ? sql :
    //    sql + " where code='" + req.query.code + "'";
    
    PG.exec(sql, function (rawResult) {
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8'
        });

        try {
            var geojson = DataToGeoJson(rawResult)

            res.end(JSON.stringify(geojson));
        } catch (error) {}
    })
})

module.exports = router;
