
// Modelo de datos

let quizzes = [
	{question: "Capital de Italia",answer: "Roma"},
	{question: "Capital de Francia",answer: "París"},
	{question: "Capital de España",answer: "Madrid"},
	{question: "Capital de Portugal",answer: "Lisboa"},
];

//Devuelve numero total de preguntas existentes
exports.count = () => quizzes.length;

//Añadir un quizz
const add = (question,answer) => {
	 quizzes.push({
	 	question: (question || "").trim(),
	 	answer: (answer || "").trim()
	 });
};

//Actualiza la quizz en la posicion index

exports.update = (id , question, answer) =>{
	const quiz = quizzes[id];
	if (typeof quizz === "indefined"){
		throw new Error (`El valor del parámetro id no es válido`);
	}
	quizzes.splice(id ,1, {
		question: (question || "").trim(),
	 	answer: (answer || "").trim()
	 });
};

//Devuelve los quizzes existentes (clonado)
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

//Devuelve un clon de quizz almacenado en la posicion dada
exports.getByIndex = id => {

	const quiz = quizzes[id];
	if (typeof quizz === "indefined"){
		throw new Error (`El valor del parámetro id no es válido`);
	}
	return JSON.parse(JSON.stringify(quiz));
};

//Eliminar quizz posicion dada por id
exports.deleteByIndex = id =>{
	const quiz = quizzes[id];
	if (typeof quizz === "indefined"){
		throw new Error (`El valor del parámetro id no es válido`);
	}
	quizzes.splice(id, 1);
};
