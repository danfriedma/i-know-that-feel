;(function (){
	// the consumer key and secret
	var consumerKey = "f0d4193f-48db-469b-84fc-6a4679aaf974",
		consumerSecret = "d28a7b8d-d02e-49b6-893f-ed7ae390739c";

	function log(message) {
		document.body.innerHTML += message + "<br/>";
	}

	window.getInitialText = function() {

	    console.log('Welcome!  Fetching your information.... ');
	    
	    FB.api('/me/statuses', 
	    	function(response) {
	    		var statuses = [];
	    		console.log(response);
	        	for (key in response.data) {
	        		var rawdata = response.data[key].message;
	        		if (rawdata) {
		        		var newdata = rawdata.replace(/^\w/, '');
		        		statuses.push(newdata)
		        	}
	        	}
	    		console.log(statuses);

	    		runTestApp(statuses);
	        }
	    )
	};

	function processResponse(analyticData) {
		var goodFeels = [];
		var badFeels = [];
		var overallTone = 0;
		var contributors = 0;

		//Custom compare function for sorting the pairs of values
		function custom_compare(a, b) {
			return a[0] - b[0]; 
		}

		for(var i=0, data;data=analyticData[i];i++) {
			
			if(data.sentiment_score == 0) {
				// If there is no overall sentiment score, continue to next iteration
				continue;
			}

			// Printing of document sentiment score
			//log(SemantriaActiveSession.tpl("Document {id}. Sentiment score: {sentiment_score}", data));

			//Keep track of overall sentiment score
			overallTone += data.sentiment_score;

			//Keep track of number of contributing documents to calibrate overallTone at the end
			contributors++;

			// Printing of document themes
			if (data.themes) {
				for(var j=0, theme; theme=data.themes[j]; j++) {
					

					console.log("title: "+theme.title);
					console.log("score: "+theme.sentiment_score);

					if(theme.sentiment_score>0) {
						goodFeels.push(
							{score: theme.sentiment_score, name: theme.title}
							);
					}
					else if(theme.sentiment_score<0) {
						badFeels.push(
							{score: theme.sentiment_score, name: theme.title}
							);
					}

					//log(SemantriaActiveSession.tpl("<div style='margin-left: 30px;'/>{title} (sentiment: {sentiment_score})", theme));
				}
			} else {
				//log("<div style='margin-left: 30px;'/>No themes were extracted for this text");
			}

			// Printing of document entities
			//log("<div style='margin-left: 15px;'/>Entities:");
			if (data['entities']) {
				for(var j=0, entity; entity=data['entities'][j]; j++) {
					
					console.log("title: "+entity.title);
					console.log("score: "+entity.sentiment_score);
					if(entity.sentiment_score>0)
						goodFeels.push(
							{score: entity.sentiment_score, name: entity.title}
							);
					else if(entity.sentiment_score<0) 
						badFeels.push(
							{score: entity.sentiment_score, name: entity.title}
							);

					//log(SemantriaActiveSession.tpl(
					//	"<div style='margin-left: 30px;'/>{title} : {entity_type} (sentiment: {sentiment_score})", entity
					//));
				}
			} else {
				//log("<div style='margin-left: 30px;'/>No entities were extracted for this text");
			}
			
			// Printing of document entities
			//log("<div style='margin-left: 15px;'/>Topics:");
			if (data.topics) {
				for(var j=0, topic; topic=data.topics[j]; j++) {
					
					if(topic.sentiment_score>0)
						goodFeels.push(
							{score: topic.sentiment_score, name: topic.title}
							);
					else if(topic.sentiment_score<0) 
						badFeels.push(
							{score: topic.sentiment_score, name: topic.title}
							);


					//log(SemantriaActiveSession.tpl(
					//	"<div style='margin-left: 30px;'/>{title} : {type} (strength: {sentiment_score})", topic
					//));
				}
			} else {
				//log("<div style='margin-left: 30px;'/>No topics were extracted for this text");
			}
		}

		overallTone /= contributors;

		//log("Overall sentiment score of: " + overallTone);
		goodFeels.sort(custom_compare).reverse();
		badFeels.sort(custom_compare).reverse();

		$('#fetching').hide();
		$('#buttonspace').show();
		$('h2').show();
		
		console.log("GOOD FEELS");

		for (var i=0;i<goodFeels.length;i++) {
 			$("#goodfeels").append("<p class=\"goodfeel\">" + goodFeels[i].name + "</p>");
 			 console.log(goodFeels[i].score);
		}

		console.log("BAD FEELS!!!");

		for (var i=0;i<badFeels.length;i++) {
 			$("#badfeels").append("<p class=\"badfeel\">" + badFeels[i].name + "</p>");
 			console.log(badFeels[i].score);
		}
	}

	function receiveResponse(entitiesCount) {
		// As Semantria isn't real-time solution you need to wait some time before getting of the processed results
		// Wait ten seconds while Semantria process queued document

		var analyticData = [];
		var timeout = setInterval(function() {
			//console.log("welcome to hell");
			//log("Retrieving your processed results...");
			// Requests processed results from Semantria service
			var processedDocuments = SemantriaActiveSession.getProcessedDocuments();

			if (processedDocuments && processedDocuments.length) {
				analyticData = analyticData.concat(processedDocuments);
				console.log("do you get here?, brah?");
			}
			console.log(analyticData);
			if(analyticData.length == entitiesCount) {
				console.log('its OVER iSh');
				clearInterval(timeout);
				processResponse(analyticData);
			} 
		}, 60);
	}

	window.runTestApp = function(initialTexts) {

		// session is a global object
		SemantriaActiveSession = new Semantria.Session(consumerKey, consumerSecret, "myApp");
		SemantriaActiveSession.override({
			onError: function() {
				console.warn("onError:");
				console.warn(arguments);
			},

			onRequest: function() {
				console.log("onRequest:");
				console.log(arguments);
			},

			onResponse: function() {
				console.log("onResponse:");
				console.log(arguments);
			},

			onAfterResponse: function() {
				console.log("onAfterResponse:");
				console.log(arguments);
			}
		});

		for(var i=0,text; text=initialTexts[i]; i++) {
			// Creates a sample document which need to be processed on Semantria
			var id = Math.floor(Math.random() * 10000000);
			// Queues document for processing on Semantria service
			if (typeof text != 'undefined' && text) {
				var status = SemantriaActiveSession.queueDocument({
					id: id,
					text: text
				});

				// Check status from Semantria service
				if (status == 202) {
					//log("Document# " + id + " queued successfully");
				}
			}
		}

		receiveResponse(initialTexts.length);

	}
})();