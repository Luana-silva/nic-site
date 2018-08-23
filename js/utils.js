//base url for WS requests

var urlPrefix = 'http://192.168.123.10:8080/'
// var urlPrefix = 'http://localhost:8080/'

// var urlPrefix = 'http://dev.mangobits.net:8080/'

// var urlPrefix = 'https://app.mangobits.com/'

var urlBase = urlPrefix + 'NICLandPagesWs/rs'
	  

/*
 * Params:
 * type: GET | POST | DELETE
 * data: obj sent to service  
 * url: url sufix of service
 * success: success callback function
 * error: error callback function
 */
$.service = function(params){
	
	$(document).ajaxStart(function() { Pace.restart(); });
	
	$.ajax({
			headers: {
					'Content-Type': 'application/json',
					'Authorization': "Bearer " + getToken() 
			},
			type: params.type,
			url: urlBase + params.url,
			data: params.data,
			dataType: 'json',
			cache: false,
			success: function(result) {
				if(result.success && params.success){
					params.success(result.data)
				}
				else if(params.error){
					params.error(result.desc)
				}
			},
			error: function(obj){
				document.location.href = "../errors/" + obj.status + ".html"
			}
	});
}	
	

$.fn.serializeObject = function(){
	
     var o = {};
     var a = this.serializeArray();
     $.each(a, function() {
         if (o[this.name] !== undefined) {
             if (!o[this.name].push) {
                 o[this.name] = [o[this.name]];
             }
             o[this.name].push(this.value || '');
         } else {
             o[this.name] = this.value || '';
         }
     });
     return o;
};


//get a param from a url
$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	
	if(results){
		return results[1] || 0;
	}
	else{
		return null;
	}
}

$.uuid = function(){

	return $.s4() + $.s4() + '-' + $.s4() + '-' + $.s4() + '-' +
	$.s4() + '-' + $.s4() + $.s4() + $.s4();
};



$.s4 = function(){
	return Math.floor((1 + Math.random()) * 0x10000)
	    .toString(16)
	    .substring(1);
};


$.success = function(message, callback){
	
	var dialog = bootbox.dialog({
	    message: '<p class="text-center">' + message + '</p>',
	    closeButton: false,
	    size: 'small'
	});
	
	setTimeout(function(){ 
		dialog.modal('hide');
		if(callback){
			callback();
		}
	}, 1500);
};


function storeToken(token){
  localStorage.setItem("token", token);
}


function getToken(){
  return localStorage.token
}


function showErrors(msg){
	
	$("#alertErrorMsg").text(msg)
    $("#alertError").fadeIn("fast");
	window.scrollTo(0, 0);
}


function hideErrors(){
	
	$("#alertError").fadeOut();
}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
