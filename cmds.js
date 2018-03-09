
const Sequelize = require('sequelize');
const {models} = require('./model');
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

const validateId = id => {
  return new Sequelize.Promise((resolve, reject) => {
    if (typeof id === "undefined"){
      reject(new Error(`Falta el parametro <id>.`));
    } else {
      id = parseInt(id);  //coger la parte entera y descartar lo demas
      if(Number.isNaN(id)) {
        reject(new Error(`El valor del parámetro <id> no es un número.`));
      } else {
        resolve(id);
      }
    }
  });
};


const makeQuestion = (rl, text) => {
  return new Sequelize.Promise((resolve, reject) => {
    rl.question(colorize(text, 'red'), answer => {
      resolve(answer.trim());
    });
  });
};

/**
*Añadir nuevo quiz
**/

exports.addCmd = rl => {
  makeQuestion(rl, 'Introduzca una pregunta: ')
  .then(q => {
    return makeQuestion(rl, 'Introduzca la respuesta: ')
    .then(a => {
      return {question: q, answer: a};
    });
  })
  .then(quiz => {
    return models.quiz.create(quiz);
  })
  .then(quiz => {
    log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
  })
  .catch(Sequelize.ValidationError, error => {
    error.log('El quiz es erroneo: ');
    error.errors.forEach(({message}) => errorlog(message));
  })
  .catch(error => {
    errorlog(error.message);
  })
  .then(() => {
    rl.prompt();
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
      models.quiz.findAll()
      .each(quiz=> {
          log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
      })
      
      .catch(error => {
        errorlog(error.message);
      })
      .then(()=> {
        rl.prompt();
      });
};


/**
*Muestra el quiz indicado
**/

exports.showCmd = (rl, id) => {
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz => {
    if (!quiz) {
      throw new Error(`No existe un quiz asociado al id=${id}.`);
    }
    log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
  })
  .catch(error => {
    errorlog(error.message);
  })
  .then(() => {
    rl.prompt();
  });
};

/**
*Borra un quiz que indiques
**/

exports.deleteCmd = (rl, id) => {
      
  validateId(id)
  .then(id => models.quiz.destroy({where: {id}}))
  .catch(error => {
    errorlog(error.message);
  })
  .then(() => {
    rl.prompt();
  });
};
/**
*Edita un quiz
**/

exports.editCmd = (rl, id) => {
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz => {
    if (!quiz) {
      throw new Error(`No existe un quiz asociado al id=${id}.`);
    }

    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
    return makeQuestion(rl, 'Introduzca la pregunta: ')
    .then(q => {
      process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
      return makeQuestion(rl, 'Introduzca la respuesta: ')
      .then(a => {
        quiz.question = q;
        quiz.answer = a;
        return quiz;
      });
    });
  })
  .then(quiz => {
    return quiz.save();
  })
  .then(quiz => {
    log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
  
  })
  .catch(Sequelize.ValidationError, error => {
    errorlog('El quiz es erróneo');
    error.errors.forEach(({message}) => errorlog(message));
  })
  .catch(error => {
    errorlog(error.message);
  })
  .then(error => {
    rl.prompt();
  });
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
      rl.question(colorize(`${quiz.question}?`, 'yellow'), respuesta => {
        
        if(respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){

          log('La respuesta es correcta');
          biglog("Correcta", "green");
          rl.prompt();
        } else {
          log('La respuesta es incorrecta');
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

exports.playCmd = rl =>{

  let aciertos = 0;
  let toBeResolved = [];

  for(let i=0; i < model.count(); i++){
    toBeResolved[i] = model.getByIndex(i);
  };

  const playOne = () => {

    if(toBeResolved.length === 0){

      log("Fin del juego! Aciertos: " + aciertos);
      biglog(aciertos, 'magenta');
      rl.prompt();
    } else {

      let id = Math.floor(Math.random() * (toBeResolved.length));
      rl.question(colorize(toBeResolved[id].question+"? ", 'yellow'), answer => {

        if (toBeResolved[id].answer.toLowerCase().trim() === answer.toLowerCase().trim()){
          aciertos++;
          log('CORRECTO - LLeva '+ aciertos + ' aciertos.', 'green');
          toBeResolved.splice(id, 1);
          playOne();

        } else{
          log('INCORRECTO.', 'red');
          log("Fin del juego! Aciertos: " + aciertos);
          biglog(aciertos, 'magenta');
          aciertos = 0;
          rl.prompt();
        }
      });

    }
  };
  playOne();
};

exports.quitCmd = rl =>{
  rl.close();
};