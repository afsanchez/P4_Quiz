
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

exports.testCmd = (rl,id) =>{
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz => {
    if (!quiz){
      throw new Error(`No existe un quiz asociado al id=${id}.`);
    }
  return makeQuestion(rl,colorize(quiz.question +'? ','red')
  )
  .then (respuesta => {
    if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
      log(`Su respuesta es correcta.`);
      log(`Correcta`);
    }else{
      log(`Su respuesta es incorrecta.`);
      log(`Incorrecta`);
    };
  });
  })
  .catch(Sequelize.ValidationError, error =>{
    errorlog('El quiz es erróneo:');
    error.errors.forEach(({message}) => errorlog(message));
  })
  .catch(error =>{
    errorlog(error.message);
  })
  .then(() => {
    rl.prompt();
  });
};

exports.playCmd = rl => {
  let score = 0; 
  let toBeResolved = []; 

  models.quiz.findAll() 
    .then(quizzes => {
      quizzes.forEach((quiz,id) => {
      toBeResolved[id] = quiz; // Array de preguntas por responder
  });

  const playOne = () => {
    if (toBeResolved.length === 0){
      log(`No hay nada más que preguntar`);
      log(`Fin`);
      log(`Final del examen. Aciertos: ${score}`);
      rl.prompt();
    }
    else {
      let aleatoriamente = Math.floor(Math.random() * toBeResolved.length);
      let quiz = toBeResolved[aleatoriamente];
      toBeResolved.splice(aleatoriamente, 1);
      return makeQuestion(rl, `${quiz.question}? `)
      .then(ans => {
        if (quiz.answer.toLowerCase().trim() === ans.toLowerCase().trim()) {
          score++;
          log(`CORRECTO - Lleva ${score} aciertos.`);
          playOne();
        }else{
          log('INCORRECTO.');
          log(`Fin del juego. Aciertos: ${score}`);
          log(`Fin`);
        }
      })
      .catch(error => {
        errorlog(error.message);
      })
      .then(() => {
        rl.prompt();
      });
    }
  };
  playOne();
  })
  .catch(error => {
    errorlog(error.message);
  })
  .then(() => {
    rl.prompt();
  });
};

exports.quitCmd = rl =>{
  rl.close();
};