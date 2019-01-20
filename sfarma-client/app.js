

var file = "";
var linesArray = [];

 // Metodo que modifica la ruta del archivo ingresado
 function fileChanged() {

    this.file = document.getElementById("selectedFile").files[0];   
    if(this.file && this.file.name)
      document.getElementById("fileName").innerHTML = "Archivo:"+this.file.name;
    else
      document.getElementById("fileName").innerHTML = "";
 }

/**************
 * Metodo para generar el archivo final en base al archivo de entrada
 */
function generateOutputFile(){

    if(!this.file){
      alert("Seleccione primero el archivo de entrada con los datos de la factura");
      return;
    }
    // Limpiamos el array de lineas
    resetValues();
    let fileReader = new FileReader();
    let lineIndex = 1;
	  fileReader.onload = (e) => {
    		let arrayOfLines = fileReader.result.split('\n');
    		for(let line of arrayOfLines){

            if(line){

                 let processedLine = "";
          		   var lineSplitedArray = line.split(',');

                 validateInput(lineSplitedArray,lineIndex);
                  
                 let articleData = getArticleByProductCode(lineSplitedArray[3],lineSplitedArray[10]);

                 if(articleData && articleData.hasPrepack == true){

                      // Procesamos los artículos con prepacks
                      processedLine += processPrepackLine(lineSplitedArray,articleData);
                      // Validaciones de la linea prepack
                      lineIndex = validateOutputPrepackLine(processedLine,lineIndex);
                 }else{
                      // Procesmamos los artículos simples
                      processedLine += processSimpleLine(lineSplitedArray,articleData);
                      // Validaciones de la linea básica
                      validateOutputBasicLine(processedLine,lineIndex);

                      lineIndex += 1;
                 }

          		   linesArray.push(processedLine);
          		   
          		}

              
        }
        if(checkFileGeneration()){

    		    var blob = new Blob(linesArray, {type: "text/plain;charset=utf-8"});
            saveAs(blob, configData.fileName + generateTodayDate());
        }else{
            alert("No se pudo completar la generación del archivo. Verifique los errores");
        }
    		
	}
  
	fileReader.readAsText(file);

}
/**************
 * Metodo para procesar los items de tipo prepack
 */
function processPrepackLine(lineSplitedArray,articleData){

      if(lineSplitedArray && articleData && articleData.prepacks && articleData.prepacks.length > 0){

          let processedLine = "";
          articleData.prepacks.forEach(function(prepackItem){

            if(checkIfGift(prepackItem.productDescription)){

                  processedLine += processPrepackGiftLine(lineSplitedArray,articleData,prepackItem);
        
            }else{
                  processedLine += processPrepackRegularLine(lineSplitedArray,articleData,prepackItem);
            }
              
          });
          return processedLine;
      }
}

/**************
 * Metodo para procesar los items de prepack regulaes
 */
function processPrepackRegularLine(lineSplitedArray,articleData,prepackItem){
      

      let processedLine = "";

      // Procesamos la cantidad del prepack
      

      processedLine += processLocalId(lineSplitedArray)+"|";
      processedLine += processCreatedDate(lineSplitedArray) + "|";
      processedLine += processConsecutiveNumber(lineSplitedArray) + "|";
      processedLine += processProviderCode() + "|";
      processedLine += processProviderName() + "|";
      processedLine += processPrepackItemObservations(prepackItem) + "|";
      processedLine += processPrepackItemCode(prepackItem)+ "|";
      processedLine += processPrepackItemQuantity(prepackItem, lineSplitedArray)+ "|";
      processedLine += processPrepackItemCost(prepackItem,articleData.prepacks,lineSplitedArray)+ "|";
      processedLine += processPrepackItemPresentation(prepackItem)+ "|";
      processedLine += processProductLot(lineSplitedArray) + "|";
      processedLine += processExpirationDate(lineSplitedArray);

      processedLine += "\n";

      return processedLine;

}


/**************
 * Metodo para procesar los items de prepack REGALO
 */
function processPrepackGiftLine(lineSplitedArray,articleData,prepackItem){
      

      let processedLine = "";

      processedLine += processLocalId(lineSplitedArray)+"|";
      processedLine += processCreatedDate(lineSplitedArray) + "|";
      processedLine += processConsecutiveNumber(lineSplitedArray) + "|";
      processedLine += processProviderCode() + "|";
      processedLine += processProviderName() + "|";
      processedLine += "Producto OBSEQUIO" + "|"; 
      processedLine += processPrepackItemCode(prepackItem)+ "|";
      processedLine += processPrepackItemQuantity(prepackItem,lineSplitedArray)+ "|";
      processedLine += processPrepackItemCost(prepackItem,articleData.prepacks,lineSplitedArray)+ "|";
      processedLine += processPrepackItemPresentation(prepackItem)+ "|";
      processedLine += processProductLot(lineSplitedArray) + "|";
      processedLine += processExpirationDate(lineSplitedArray);

      processedLine += "\n";

      return processedLine;

}

/**************
 * Metodo para procesar los items simples
 */
function processSimpleLine(lineSplitedArray, articleData){

  if(lineSplitedArray){

      
      let processedLine = "";

      if(articleData){

          if(articleData.productData && checkIfGift(articleData.productData.sourceDescription)){

              processedLine += processGiftProduct(lineSplitedArray, articleData);

              return processedLine;

          }

          processedLine += processRegularProduct(lineSplitedArray, articleData);
      }

      return processedLine;
  }
}

/**************
 * Metodo que procesa los productos simples
 */
function processRegularProduct(lineSplitedArray, articleData){

   let processedLine = "";

   processedLine += processLocalId(lineSplitedArray)+"|";
   processedLine += processCreatedDate(lineSplitedArray) + "|";
   processedLine += processConsecutiveNumber(lineSplitedArray) + "|";
   processedLine += processProviderCode() + "|";
   processedLine += processProviderName() + "|";
   processedLine += processObservations() + "|";
   processedLine += processProductCode(articleData) + "|";
   processedLine += processProductQuantity(lineSplitedArray) + "|";
   processedLine += processProductTotalPrice(lineSplitedArray) + "|";
   processedLine += processProductPresentation(articleData)+ "|";
   processedLine += processProductLot(lineSplitedArray) + "|";
   processedLine += processExpirationDate(lineSplitedArray);

   processedLine += "\n";

   return processedLine;
}

/**************
 *  Metodo que procesa los productos que son obsequios
 */
function processGiftProduct(lineSplitedArray, articleData){

    let processedLine = "";

    processedLine += processLocalId(lineSplitedArray)+"|";
    processedLine += processCreatedDate(lineSplitedArray) + "|";
    processedLine += processConsecutiveNumber(lineSplitedArray) + "|";
    processedLine += processProviderCode() + "|";
    processedLine += processProviderName() + "|";
    processedLine += "Producto OBSEQUIO" + "|";
    processedLine += processProductCode(articleData) + "|";
    processedLine += processProductQuantity(lineSplitedArray) + "|";
    processedLine += 0.0 + "|";
    processedLine += processProductPresentation(articleData)+ "|";
    processedLine += processProductLot(lineSplitedArray) + "|";
    processedLine += processExpirationDate(lineSplitedArray);

    processedLine += "\n";

    return processedLine;
}

/**************
* Metodo que procesa la cantidad de los prepacks
*/
function getPrepackRealItemQuantity(prepackItem,lineSplitedArray){


    let intPrepackQuantity = parseInt(prepackItem.quantity.replace(".",""));
    let intGeneralItemQuantity = parseInt(lineSplitedArray[5]);

    return intPrepackRealQuantity = intPrepackQuantity * intGeneralItemQuantity;
}

/**************
* Metodo que realiza la consula AJAX para obtener información del artículo
* en función a su código de artículo. 
*/
function getArticleByProductCode(productCode, productBarcode){

		var articleData = ""
    jQuery.ajax({
    	async: false,
        url:servicesData.queryArticleCode+productCode+"/"+productBarcode,
        type:"GET",
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
         if(data)
         	  articleData = data;
        },
        error: function (request, status, error) {
            console.log(error);
        } 
    });
    return articleData;
}

/**************
* Metodo que consulta el identificador del local  
* a partir del local de referencia configurado
*/
function getLocalByLocalReference(localReference){

    var localData = ""
    jQuery.ajax({
      async: false,
        url:servicesData.queryLocalData+localReference,
        type:"GET",
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
         if(data)
            localData = data;
        },
        error: function (request, status, error) {
            console.log(error);
        } 
    });
    return localData;
}

/**************
 * Metodo que chequea si la descripción
 * pasada por párametro es un regalo
 * YYYYMMDD
 */
function checkIfGift(description){

    if(description.includes("OBS.") ||
       description.includes("OBSEQUIO")){

        return true;
    }
    return false;

}
/**************
 * Metodo que genera la fecha de hoy con el formato
 * YYYYMMDD
 */
function generateTodayDate(){

    var date = new Date();
    return moment(date).format('YYYYMMDD');
}

/*************
* Metodo que resetea los valores auxiliares para generar las lineas
*/
function resetValues(){

    this.linesArray = [];
    resetScreenLog();
    resetGenerateFile();
}


function getPrepackTotalCost(prepacks){

  let totalPrepacksCost = 0;

  if(prepacks){
      prepacks.forEach(function(prepack){
      
          if(!isNaN(prepack.productCost)){

            totalPrepacksCost += parseInt(prepack.productCost.replace(".",""));
          }
      });
  }
  return totalPrepacksCost;
}

function onClickFile(){

  document.getElementById('selectedFile').click();

}
/************************************************
* Line processors
*************************************************/

function processLocalId(splittedArray){

  if(splittedArray && splittedArray[0]){

      let localData = getLocalByLocalReference(splittedArray[0]);
      if(localData && localData.finalLocalId)
          return localData.finalLocalId;
  }
  return "-";
}


function formatDate(inputDate){

      let createdDate  = moment(inputDate, "YYYYMMDD");
      return createdDate.format("YYYY/MM/DD");
}

function processCreatedDate(splittedArray){

    if(splittedArray && splittedArray[1]){

        let createdStringDate = splittedArray[1];
        if(createdStringDate)
            return this.formatDate(createdStringDate);
    }
    return "-";

}


function processConsecutiveNumber(splittedArray){

  if(splittedArray && splittedArray[2]){

    return splittedArray[2];
  }
  return "-";
}

function processProviderCode(){


  if(configData && configData.providerCode)
      return configData.providerCode;

    return "-";
}

function processProviderName(){

  return configData.providerName;
}

function processObservations(){

  return "-";
}

function processProductCode(articleData){
        
    if(articleData && articleData.productData){

        return articleData.productData.finalCode;
    }
    return "-";

}

function processProductQuantity(splittedArray){

    if(splittedArray && splittedArray[5]){

        return splittedArray[5];
    }
    return "-";

}


function processProductTotalPrice(splittedArray){
      
    if(splittedArray && splittedArray[18]){

        return splittedArray[18];
    }
    return "-";
}

function processProductPresentation(articleData){

  if(articleData && articleData.productData && articleData.productData.finalPresentation){

        return articleData.productData.finalPresentation;
  }
  return " ";
}

function processProductLot(splittedArray){
      
      if(splittedArray && splittedArray[21]){

          return splittedArray[21];
      }
      return "-";
}

function processExpirationDate(splittedArray){
      
      if(splittedArray && splittedArray[22]){

          var expirationDate = splittedArray[22];
          return this.formatDate(expirationDate);

      }
      return this.formatDate(configData.defaultExpirationDate);
}


function processPrepackItemObservations(articleData){

    return "-";

}


function processPrepackItemCode(articleData){

    if(articleData){
      
      return articleData.productCode;
    }
    return "-";

}

function processPrepackItemQuantity(prepackItem, lineSplitedArray){

    if(prepackItem){

      return getPrepackRealItemQuantity(prepackItem,lineSplitedArray);
    }
    return "-";

}


function processPrepackItemCost(prepack, prepacks,lineSplitedArray){


    if(prepack && prepacks && prepacks.length > 0){

        let productCost = parseInt(prepack.productCost.replace(".",""));
        let realSaleCost = parseInt(prepack.realSaleCost.replace(".",""));
        let allProdcutQuantity = getPrepackRealItemQuantity(prepack,lineSplitedArray);

        let prepacksTotalCost = getPrepackTotalCost(prepacks);
        let porcentageCost = productCost / prepacksTotalCost;

        let realCostAverage = porcentageCost * realSaleCost;

        let finalItemCost = realCostAverage * allProdcutQuantity;

        return finalItemCost.toFixed(2);
    }
    return "-";

}


function processPrepackItemPresentation(articleData){

    if(articleData && articleData.productPresentation){

      return articleData.productPresentation;
    }
    return " ";

}



