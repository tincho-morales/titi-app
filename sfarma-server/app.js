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
/***********************************/
/***********************************/


app.use(morgan('tiny'));

app.use(function(req, res, next) {
  							res.header("Access-Control-Allow-Origin", "*");
  							res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  							next();
});

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


/**************/
/* SERVICIO DE CONSULTA DE ARTÍCULOS 
 */
app.get("/article/:productCode", (req,res)=> {


	const productCode = req.params.productCode;

	console.log("Obteniendo identificador de artículo con código :" + productCode);

	let finalProductData = {};
	

	// Verifico si el producto es un prepack
	let prepacksArray = checkPrepacksByProductCode(productCode);

	
	if(prepacksArray && prepacksArray.length >0){
			// Si es un prepack mando los items del prepack
			finalProductData.productData = {};
			finalProductData.hasPrepack = true;
			finalProductData.prepacks = prepacksArray;
	}else{
			// Si no es un prepack consulto la información del item en la base de datos
			let productData = getProductDataFromProductCode(productCode);

			finalProductData.productData = productData[0];
			finalProductData.hasPrepack = false;
			finalProductData.prepacks = [];
	}
	
	res.json(finalProductData);

});


/**************/
/* SERVICIO DE CONSULTA DE ARTÍCULOS 
 */
app.get("/local/:localReferenceId", (req,res)=> {

	
	const localReferenceId = req.params.localReferenceId;

	console.log("Obteniendo identificador de almacen:" + localReferenceId);
	
	let finalLocalEntity = {};
	let localsData = getLocalIdByReferencesLocalId(localReferenceId);
	
	finalProductData = localsData[0];

	res.json(finalProductData);

});


/**************/
/* Obtengo todos los items, si es que los hay, de prepacks del 
   artículo*/
function checkPrepacksByProductCode(productCode){

	try {
		let data = fs.readFileSync(config.configData.prepacksFilePath);
		
		var rowsArray = [];
		var json = parser.toJson(data);
		var obj = JSON.parse(json);

		let dataRows = obj['Workbook']['Worksheet']['Table']['Row'];

		let enteredFirstItem = false;
		let realSaleCostData = 0;

	    dataRows.forEach(function (rowItem,index) {


	    	let cellList = rowItem['Cell'];

	    	let prepackCode = cellList[1]['Data']['$t'];
	    	if(prepackCode && productCode == prepackCode ){

	    		if(!enteredFirstItem){
	    			realSaleCostData =  cellList[4]['Data']['$t'];
	    			enteredFirstItem = true;
	    		}

	    		let productReference = getProductDataFromProductCode(cellList[7]['Data']['$t']);
	    		
	    		let productCodeData = "-";
	    		let productPresentationData = "-";
	    		if(productReference && productReference.length > 0){
	    			productCodeData = productReference[0].finalCode;
	    			productPresentationData = productReference[0].finalPresentation;
	    		}

	    		let newRowElement = {

	    			center: cellList[0]['Data']['$t'],
	    			code: cellList[1]['Data']['$t'],
	    			virtualPrepack: cellList[2]['Data']['$t'],
	    			inventory: cellList[3]['Data']['$t'],
	    			realSaleCost:realSaleCostData,
	    			provider: cellList[5]['Data']['$t'],
	    			quantity: cellList[6]['Data']['$t'],
	    			productCode: productCodeData,
	    			productDescription: cellList[8]['Data']['$t'],
	    			productCost: cellList[9]['Data']['$t'],
	    			productPresentation: productPresentationData
	    		}
	    		rowsArray.push(newRowElement);
	    	}
	    });

		return rowsArray;

	}catch(error){
		throw "Ocurrio un error verificando si el producto con el códigos "+productCode+" tiene prepacks en el archivo "
		      +config.configData.prepacksFilePath+" "+error ;
	}
}

/*************************************************
 * Consultas a la base de datos
 */

/* Obtiene los datos del producto en base al código del producto*/
function getProductDataFromProductCode(productCode){


	let finalResultData = [];

	try {
		const queryReferenceData = "SELECT * FROM REFERENCES_DATA WHERE SOURCE_CODE = ?";
		
		let resultData = connection.query(queryReferenceData,[productCode]);
		
		
			
		finalResultData = resultData.map((row) =>{
									return { sourceCode : row.source_code, sourceBarcode:row.source_barcode, 
					     					 finalPresentation: row.final_presentation,finalCode:row.final_code,
					     					 sourceDescription : row.source_description };
						  });

		return finalResultData;

	}catch(error){
		throw "Ocurrio un error consultando el producto con el código de artículo "+productCode+" en la base de datos: "+error;
	}
}

/**************/
/* Obtiene los datos del producto en base al código de barras*/
function getProductDataFromProductBarcode(productBarcode){

	let finalResultData = [];
	try {

		const queryTickets = "SELECT * FROM REFERENCES_DATA WHERE SOURCE_BARCODE = ?";

		let resultData = connection.query(queryTickets,[productBarcode]);

		
			
		finalResultData = resultData.map((row) =>{
			
			return { sourceCode : row.source_code, sourceBarcode:row.source_barcode, 
				     finalPresentation: row.final_presentation,finalCode:row.final_code,
				     sourceDescription : row.source_description };

		});

		return finalResultData;

	}catch(error){
		throw "Ocurrio un error consultando el producto con el código de barras "+productBarcode+" en la base de datos: "+error;
	}
	
}


/**************/
/* Obtiene los datos del producto en base al código de barras*/
function getLocalIdByReferencesLocalId(referenceLocalId){

	let finalResultData = [];
	try {

		const queryTickets = "SELECT * FROM REFERENCES_LOCALS WHERE REFERENCES_LOCAL_ID = ?";

		let resultData = connection.query(queryTickets,[referenceLocalId]);

		
		finalResultData = resultData.map((row) =>{
			
			return { localId : row.local_id, referencesLocalId:row.references_local_id};

		});

		return finalResultData;

	}catch(error){
		throw "Ocurrio un error consultando el local por código de referencia "+referenceLocalId+" en la base de datos: "+error;
	}
	
}

/***************************************************/

app.get("/loadArticleCodes", (req,res)=> {

	var csvData=[];
	fs.createReadStream("prueba.csv")
	    .pipe(parse({delimiter: ','}))
	    .on('data', function(csvrow) {

	        const queryTickets = "UPDATE references_data SET REFERENCE_CODE = ? WHERE REFERENCE_BARCODE = ? ";

	        connection.query(queryTickets,[csvrow[0],csvrow[1]], (error,rows, fields) =>{

	        });

	        sleep(5);
	        console.log(csvrow[1]);

	        //do something with csvrow
	        csvData.push(csvrow[1]);        
	    })
	    .on('end',function() {
	      //do something wiht csvData
	      //res.send(csvData);
	    })    
})


app.get("/test", (req,res)=> {

	let data = checkPrepacksByProductCode("100020062");

	res.json(data);
	
})



app.listen(config.configData.appRunningPort, () =>{
	console.log("Servidor ejecutado correctamente y escuchando en el puerto "+config.configData.appRunningPort);
}); 