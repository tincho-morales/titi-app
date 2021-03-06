/***********************************/
/***********************************/
const express = require('express');
const app = express();
const morgan = require('morgan');
const mysql = require('mysql');
const config = require('./config.js');
const fs = require('fs');
const parser = require('xml2json');
const parse = require('csv-parse');
const sleep = require('system-sleep');
const mySql = require('sync-mysql');


const insertCodesFileName = config.configData.insertCodesFileName;
const insertDataTimeout = config.configData.insertDataTimeOut;
/***********************************/
/***********************************/


/*******************************************************************************************************/
/*******************************************************************************************************/

/*
 *   Conexión a la base de datos
 */
var connection = new mySql({

  		host: config.configData.databaseHost,
		user: config.configData.databaseUser,
		password: config.configData.databasePassword,
		database: config.configData.databaseSchema
});


console.log("----------------------------------------------");
console.log("Comenzando inserción de datos");

fs.createReadStream(insertCodesFileName)
    

  .pipe(parse({delimiter: ',',relax_column_count: true}))
  .on('data', function(csvrow) {

        const insertCodesQuery = "INSERT INTO REFERENCES_CODES (source_code, source_barcode,source_description,final_code,final_presentation, updated, has_lot) "+ 
        						  "VALUES (?,?,?,?,?, NOW(),?) ON DUPLICATE KEY UPDATE source_code=?, source_barcode=?,source_description=?, final_code=?, final_presentation=?, updated=NOW(), has_lot=? ";

    	try{
          var d = new Date().getTime();
          var hasLot = (csvrow[5].trim() == "true");
    		  connection.query(insertCodesQuery,[csvrow[0],csvrow[1],csvrow[2],csvrow[3],csvrow[4],hasLot,csvrow[0],csvrow[1],csvrow[2],csvrow[3],csvrow[4],hasLot], (error,rows, fields) =>{});

    	}catch(error) {
    		console.log("----------------------------------");
    		console.log("Error insertando datos:"+csvrow);
    		console.log(error);
    		console.log("----------------------------------");
    	}

        sleep(insertDataTimeout);
   
    })
  .on('end',function() {
      console.log("----------------------------------------------");
      console.log("Operación de inserción finalizada");
      console.log("----------------------------------------------");

  })    

