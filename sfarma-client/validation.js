


var generateFile = true;

/*********************
 * Metodo que reinicia el log por pantalla
 */
function resetScreenLog(){
	
	const logDiv = document.getElementById('logData');
	logDiv.innerHTML = "";
}

/*********************
 * Metodo que reinicia el log por pantalla
 */
function addLineToScreenLog(line){

	const logDiv = document.getElementById('logData');
	logDiv.innerHTML +=  "<div>"+new Date().toLocaleString()+": "+ line + "</div>";

}

/*********************
 * Metodo que resetea los valores manejados por el validador
 */
function resetGenerateFile(){

	generateFile = true;
}

/*********************
 * Metodo que retorna si genera el archivo o no
 */
function checkFileGeneration(){

	return generateFile;
}

/*********************
 *
 */
function validateInput(splittedArray,lineIndex){


	if(!splittedArray ||  !Array.isArray(splittedArray)){
		addLineToScreenLog("Error procesando archivo de entrada. Error procesando linea "+lineIndex);
		generateFile = false;
	}

	if(splittedArray.length < 15){

		addLineToScreenLog("El archivo ingresado tiene información incompleta. Error procesando linea "+lineIndex);
		generateFile = false;
	}
}


/*********************
 * Metodo que chequea la linea prepack
 */
function validateOutputPrepackLine(outputLine,lineIndex){

	let lineSplitedArray = outputLine.split('\n');

	let lineIndexNumber  = lineIndex;
	
	if(Array.isArray(lineSplitedArray) && lineSplitedArray.length >0){

		lineSplitedArray.forEach(function (prepackLine) {

			if(prepackLine && prepackLine != ""){
				
				validateOutputLine(prepackLine,lineIndexNumber);
				lineIndexNumber += 1;	
			}
			
		});

	}else{
		addLineToScreenLog("Ocurrio un error procesando prepacks en la linea "+lineIndexNumber);
		generateFile = false;
	}

	return lineIndexNumber;
}

/*********************
 * Metodo que chequea la linea basica
 */
function validateOutputBasicLine(outputLine,lineIndex){
	
	validateOutputLine(outputLine,lineIndex);
}
/*********************
 * Metodo que chequea la linea pasada por parametro
 */
function validateOutputLine(outputLine,lineIndex){

	
	var lineSplitedArray = outputLine.split('|');

	if(!lineSplitedArray ||  !Array.isArray(lineSplitedArray)){
		addLineToScreenLog("Ocurrio un error generando archivo de salida");
		generateFile = false;
	}

	if(!lineSplitedArray[0] || lineSplitedArray[0] == '-' || lineSplitedArray[0] == ''){
		addLineToScreenLog("Error homologando local de referencia en la linea: "+lineIndex);
		generateFile = false;
	}

	if(!lineSplitedArray[6] || lineSplitedArray[6] == '-' || lineSplitedArray[6] == '' || lineSplitedArray[6] == '0'){
		addLineToScreenLog("Error homologando codigo de producto en la linea: "+lineIndex);
	}

	if(!lineSplitedArray[10] || lineSplitedArray[10] == '-' || lineSplitedArray[10] == ''){
		addLineToScreenLog("Error homologando lote  la linea: "+lineIndex);
	}

}