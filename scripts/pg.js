const { Pool } = require('pg')

const pool = new Pool({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
})

pool.connect()

var PG = function () {
    console.log( "---- READY TO CONNECT ----" );
};

//query functions 
//@param STR query 
//@param value correlation value 
//@param callback CB 
var clientHelper = function (str, cb) {
    pool.query(str, function (err, result) {
        console.log("client helper is running")
        if (err) {
            //cb("kip");
            console.log("client helper error: " + err);

        } else {

            if (result.rows != undefined) {
                console.log("client helper done");
            } else { 
                cb();
            }
        }
    });
}

PG.prototype.exec = function (strSql, resHolder) {
    console.log("exec is running")
    pool.query(strSql, "", function (err, result) {
        console.log("pool query is running")
        if (err) {
            resHolder("err");
            console.log("exec error: " + err);
        } else {
            if (result.rows != undefined) {
                resHolder(result.rows);
                
            } else {
                resHolder();
            }
        }
    });
}

PG.prototype.save = function (tablename, column, values, geom, cb) {
    if (!tablename) return;
    var str = "INSERT INTO " + tablename;

    geometry = "'" + JSON.stringify(geom) + "'"

    var name =  values.name
    var email = values.email

    switch (tablename) {
        case 'draw_polygon':
        case 'draw_point':
            routes = values.routes
            long = str + " ( geom, " + column + ")" + " VALUES (" + geometry + ", '" + name + "', '" + routes + "', '" + email + "');";
            break;
        default:
            long = str + " ( geom, " + column + ")" + " VALUES (" + geometry + ", '" + name + "', '" + email + "');";

    }

    clientHelper(long, cb);
};

//delete 
//@param TableName table name 
//@param Fields field conditions and values, JSON format 
//@param CB callback
PG.prototype.remove = function (tablename, fields, cb) {
    if (!tablename) return;
    var str = "delete from " + tablename + " where ";
    var field = [];
    var value = [];
    var count = 0;
    for (var i in fields) {
        count++;
        field.push(i + "=$" + count);
        value.push(fields[i]);
    }
    str += field.join(" and ");
    clientHelper(str, value, cb);
}

//modify 
//@param TableName table name 
//@param Fields fields and values updated, JSON format 
//@param mainfields field conditions and values, JSON format
PG.prototype.update = function (tablename, mainfields, fields, cb) {
    if (!tablename) return;
    var str = "update " + tablename + " set ";
    var field = [];
    var value = [];
    var count = 0;
    for (var i in fields) {
        count++;
        field.push(i + "=$" + count);
        value.push(fields[i]);
    }
    str += field.join(",") + " where ";
    field = [];
    for (var j in mainfields) {
        count++;
        field.push(j + "=$" + count);
        value.push(mainfields[j]);
    }
    str += field.join(" and ");
    clientHelper(str, value, cb);
}

//query 
//@param TableName table name 
//@param Fields field conditions and values, JSON format 
//@param returnfields return field, an array of fields 
//@param CB callback
PG.prototype.select = function (tablename, fields, returnfields, cb) {
    if (!tablename) return;
    var returnStr = "";
    console.log("Select return fields: " + returnfields)
    if (returnfields.length == 0)
        returnStr = '*';
    else
        returnStr = returnfields.join(",");
    var str = "select " + returnStr + " from " + tablename; // + " where ";
    console.log('select:' + str)
    var field = [];
    var value = [];
    var count = 0;
    if (fields != '') {
        for (var i in fields) {
            count++;
            field.push(i + "='" + fields[i] + "'");
            value.push(fields[i]);
        }
    }
    if (count != 0) {
        str += " where " + field.join(" and ");
    }
    console.log('select:' + str)
    clientHelper(str, value, cb);
};
    
module.exports = new PG();