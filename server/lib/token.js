var fs = require('fs');

var adjectives = JSON.parse(fs.readFileSync('data/adjectives.json')),
	animals = JSON.parse(fs.readFileSync('data/animals.json'));

function random(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

function ucfirst(str) {
	return str.substring(0, 1).toUpperCase() + str.substring(1);
}

exports.generate = function() {
	var adj1 = random(adjectives),
		adj2 = random(adjectives),
		animal = random(animals);

	return ucfirst(adj1) + ucfirst(adj2) + ucfirst(animal);
};