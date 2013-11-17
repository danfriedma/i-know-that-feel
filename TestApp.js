;(function (){
	// the consumer key and secret
	var consumerKey = "34352e48-0544-447b-aac4-f5e584429704",
		consumerSecret = "aa014fff-f447-4f39-b0f0-5b39373d845d";

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
		for(var i=0, data;data=analyticData[i];i++) {
			// Printing of document sentiment score
			log(SemantriaActiveSession.tpl("Document {id}. Sentiment score: {sentiment_score}", data));
			// Printing of document themes
			log("<div style='margin-left: 15px;'/>Document themes:");
			if (data.themes) {
				for(var j=0, theme; theme=data.themes[j]; j++) {
					log(SemantriaActiveSession.tpl("<div style='margin-left: 30px;'/>{title} (sentiment: {sentiment_score})", theme));
				}
			} else {
				log("<div style='margin-left: 30px;'/>No themes were extracted for this text");
			}

			// Printing of document entities
			log("<div style='margin-left: 15px;'/>Entities:");
			if (data['entities']) {
				for(var j=0, entity; entity=data['entities'][j]; j++) {
					log(SemantriaActiveSession.tpl(
						"<div style='margin-left: 30px;'/>{title} : {entity_type} (sentiment: {sentiment_score})", entity
					));
				}
			} else {
				log("<div style='margin-left: 30px;'/>No entities were extracted for this text");
			}
			
			// Printing of document entities
			log("<div style='margin-left: 15px;'/>Topics:");
			if (data.topics) {
				for(var j=0, topic; topic=data.topics[j]; j++) {
					log(SemantriaActiveSession.tpl(
						"<div style='margin-left: 30px;'/>{title} : {type} (strength: {sentiment_score})", topic
					));
				}
			} else {
				log("<div style='margin-left: 30px;'/>No topics were extracted for this text");
			}
		}
	}

	function receiveResponse(entitiesCount) {
		// As Semantria isn't real-time solution you need to wait some time before getting of the processed results
		// Wait ten seconds while Semantria process queued document

		var analyticData = [];
		var timeout = setInterval(function() {
			console.log("welcome to hell");
			log("Retrieving your processed results...");
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
		}, 50);
	}

	window.runTestApp = function(initialTexts) {

		log("<h1>Semantria service demo</h1>");
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
					log("Document# " + id + " queued successfully");
				}
			}
		}
		// console.log(initialTexts.length);
		console.log("before");
		receiveResponse(initialTexts.length);
		console.log("after");
	}
})();