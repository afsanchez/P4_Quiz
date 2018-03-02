

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

exports.addCmd = rl =>{
  rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
    rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
      model.add(question, answer);
      log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
      rl.prompt();
    });
  });
};

/**
*Muestra los creditos y los autores de la practica
**/

exports.creditsCmd = rl => {
    	log('Autor de la practica:');
    	log('ADRIAN Fernandez Sanchez');
      log('Guillermo Valle')
    
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
*Borra un quiz que indiques
**/

exports.deleteCmd = (rl, id) =>{

  if (typeof id === "undefined") {

    errorlog(`Falta el parámetro id.`);

  } else {

    try{
      model.deleteByIndex(id);
    } catch(error) {
      errorlog(error.message);
    }
  }
  rl.prompt();
};

/**
*Edita un quiz
**/

exports.editCmd = (rl, id) => {
  if (typeof id === 'undefined'){
    errorlog('El valor del parámetro id no es válido');
    rl.prompt();
  } else {
    try {
      const quiz = model.getByIndex(id);
      process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
      rl.question(colorize('Introduce la pregunta: ', 'red'), question => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
        rl.question(colorize('Introduce la respuesta: ', 'red'), answer => {
          model.update(id, question, answer);
          log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question}  ${colorize('=>','magenta')} ${answer}`);
          rl.prompt();
        });
      });
    } catch (error) {
      errorlog(error.message);
      rl.prompt();
    }
  }
};

/**
*Prueba un quiz
**/

exports.testCmd = (rl, id) => {
  if (typeof id === 'undefined'){
    errorlog('El valor del parámetro id no es válido');
    rl.prompt();
  } else {
    try {
      const quiz = model.getByIndex(id);
      const pregunta = quiz.question + '?';
      rl.question(colorize(pregunta, 'red'), respuesta => {
        respuesta = respuesta.toLowerCase().trim();
        respuesta = respuesta.charAt(0).toUpperCase() + respuesta.slice(1);

        if(respuesta === quiz.answer){
          log('Su respuesta es correcta');
          biglog("Correcta", "green");
          rl.prompt();
        } else {
            log('Su respuesta es incorrecta');
          biglog("Incorrecta", "red");
          rl.prompt();
        }
      });
    } catch (error) {
      errorlog(error.message);
      rl.prompt();
    }
  }
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