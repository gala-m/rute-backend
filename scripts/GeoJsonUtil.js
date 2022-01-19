function ToGeoJson(jsonObject) {
    var geoJson = {
        "type": "Feature"
    };

    // console.log("jsonObject: " + jsonObject)
    // console.log("jsonObject.geometry: " + jsonObject.geometry)

    geoJson.geometry = eval('(' + jsonObject.geometry + ')');

    delete jsonObject.geometry;
    // console.log(jsonObject)

    geoJson.properties = jsonObject;

    return geoJson
}

exports.ToGeoJson = ToGeoJson