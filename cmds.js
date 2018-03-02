

const model = require('./model');
const{log, biglog, errorlog, colorize}= require("./out");

/**
*Muestra la ayuda
**/
exports.helpCmd = rl => {
  		log(" add : añadir un quiz al prgrama");
  		log(" credits : devuelve el nombre de los autores de la practica");
  		log(" list : listar todas las preguntas");
  		log(" show <id> : Muestra la pregunta y la respuesta asociada a id");
  		log(" delete <id> : Elimina la pregunta y la respuesta del quiz");
  		log(" edit <id> : Edita la pregunta y/o la respuesta con el id indicado");
  		log(" test <id> : Probar la pregunta con el id indicado");
  		log(" play/p : Inicia el programa");
  		log(" quit/q : Termina la ejecución del programa");
  		log(" help/h : muestra la ayuda del programa");
  		rl.prompt();

};

/**
*Añadir nuevo quiz
**/

exports.addCmd = rl => {
    	log('Añadir un nuevo quiz.');
    	rl.prompt();
    	

};

/**
*Muestra los creditos y los autores de la practica
**/

exports.creditsCmd = rl => {
    	log('Autores de la practica:');
    	log('Adrián Fernández Sánchez');
    	log('Guillermo Valle Gutiérrez');
    	rl.prompt();
};

/**
*Lista las pregunstas existentes 
**/

exports.listCmd = rl => {
    	model.getAll().forEach((quiz,id)=>{
        log(` [${colorize(id,'magenta')}] : ${quiz.question} `);
      });
    	rl.prompt();

};

/**
*Muestra el quiz indicado
**/

exports.showCmd =  (rl , id) => {
      if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
      }else{
        try{
          const quiz = model.getByIndex(id);
          log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
         }catch(error){
          errorlog(error.message);
         }
      }
    	
    	rl.prompt();
};

/**
*Borra el quiz indicado
**/

exports.deleteCmd = (rl , id) => {
    	log('Borra el quiz indicado');
    	rl.prompt();
};

/**
*Edita el quiz indicado
**/

exports.editCmd = (rl , id) => {
    	log('Edita el quiz indicado');
    	rl.prompt();

};

/**
*Testea la pregunta indicada
**/

exports.testCmd = (rl , id) => {
    	log('Prueba la pregunta');
    	rl.prompt();
};

/**
*Juega
**/

exports.playCmd = rl => {
    	log('Jugar');
    	rl.prompt();
};
exports.quitCmd = rl =>{
  rl.close();
};