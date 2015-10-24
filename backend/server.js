// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/jumboAdvisor';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function (error, databaseConnection) {
	db = databaseConnection;
	console.log('initial connection made');
});

/*
app.post('/sendLocation', function (request, response) {
	// enable Cross-Origin Resource Sharing
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	// send back JSON
	response.set('Content-Type', 'application/json');

	// get parameters from request
	var login = request.body.login;
	var lat = request.body.lat;
	var lng = request.body.lng;
	var time = new Date().getTime();

	// if valid parameters (login,lat,lng)
	if (login != undefined && lat != undefined && lng != undefined) {
		loc = db.collection('locations', function (err, collection) {
			// entry to insert
			var entry = {'login': login, 'lat': parseFloat(lat), 'lng': parseFloat(lng), 'created_at': time};

		  	var id = collection.insert(entry, function(err, saved) {
				if (!err) {
					collection.find().toArray(function(er, cursor) {
						if (!err) {
							var return_array = {'characters': [], 'students':[]};

							// push last 100 locations
							for (var count = 0; count < 100; count++) {
								// make sure within bounds of DB data
								if (count < cursor.length) {
									return_array['students'].push(cursor[count]);
								}
							}

							// sort array based on time (see readme for algorithm source)
							return_array['students'].sort(function(a,b) {
								var x = a['created_at'];
								var y = b['created_at'];
								return ((x < y) ? 1 : ((x > y) ? -1 : 0));
							});

							// send array
							response.send(JSON.stringify(return_array));
						}
					});
				}
				else {
					response.send({"status":"Error: data did not go through"});
				}
			});
		});
	// else, send error message (message from ChickenOfTheSea)
	} else {
		response.send({"status":"Error: data did not go through"});
	}
});
*/

/*
app.get('/getCurrently', function (request, response) {
	// enable Cross-Origin Resource Sharing
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X -Requested-With");

	// send back JSON
	response.set('Content-Type', 'application/json');

	var password = request.query.password;
	var category = request.query.category;
	var return_array = [ ];

	// if user included login
	if (password === 'foodtape') {
		// if (['listening', 'reading', 'watching', 'working'].indexOf(category) >= 0) {
		res = db.collection('currently', function (err, collection) {
			collection.find().toArray(function(er, cursor) {
				if (!err) {
					for (i = 0; i < cursor.length; i++) {
						if (cursor[i][''])
					}
				}
			});
		});
		} else {
			console.log('invalid category');
			response.send([]);
		}
		

	// no login specified, send blank array
	} else {
		response.send([]);
	}
});
*/

app.get('/getDegreeList', function (request, response) {
	// enable cross-orign resource sharing
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	// send back JSON
	response.set('Content-Type', 'application/json');

	console.log('===============\nGET: /getDegreeList');

	degrees = db.collection('degree_list', function (err, collection) {
		collection.find().toArray(function(er, cursor) {
			if (!err) {
				degree_list = [ ]

				for (i = 0; i < cursor.length; i++) {
					degree_list.push(cursor[i]['degree'])
				}

				console.log('found ' + degree_list.length + ' majors');
				response.send(degree_list);
			}
		});
	});
});

app.get('/getDegreeSheet', function (request, response) {
	// enable cross-orign resource sharing
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	// send back JSON
	response.set('Content-Type', 'application/json');

	var degree = request.query.degree;

	console.log('===============\nGET: /getDegreeSheet, degree = ' + degree);

	if (degree != null) {
		degrees = db.collection('degrees', function (err, collection) {
			collection.find().toArray(function(er, cursor) {
				if (!err) {
					degree_i = null;
					for (i = 0; i < cursor.length; i++) {
						if (cursor[i]['name'] == degree) {
							degree_i = i;
						}
					}

					if (degree_i != null) {
						console.log('degree successfully found');
						response.send(cursor[degree_i]);
					} else {
						console.log('degree not found');
						response.send([])
					}
				}
			});
		});
	} else {
		console.log('degree null, not found');
		response.send([])
	}
});

app.get('/getCourseList', function (request, response) {
	// enable cross-orign resource sharing
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	// send back JSON
	response.set('Content-Type', 'application/json');

	console.log('===============\nGET: /getCourseList');

	degrees = db.collection('all_courses', function (err, collection) {
		collection.find().toArray(function(er, cursor) {
			if (!err) {
				course_list = [ ]

				for (i = 0; i < cursor.length; i++) {
					course_list.push(cursor[i])
				}

				console.log('found ' + course_list.length + ' courses');
				response.send(course_list);
			}
		});
	});
});

app.listen(process.env.PORT || 3000);