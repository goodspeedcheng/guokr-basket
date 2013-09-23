API_BASKET = "http://www.guokr.com/apis/community/basket.json"
API_FRUIT = "http://www.guokr.com/apis/community/fruit.json"

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

function getCookies(domain, callback) {
    chrome.cookies.getAll({"domain": "www.guokr.com"}, function(cookie) {
        allCookieInfo = "";
        for (i=0; i<cookie.length; i++){
            //console.log(JSON.stringify(cookie[i]));
            if (cookie[i].name == "_32353_access_token"){
                localStorage.token = cookie[i].value;
            } else if (cookie[i].name == "_32353_ukey"){
                localStorage.ukey = cookie[i].value;
            }
            allCookieInfo = allCookieInfo + JSON.stringify(cookie[i]);
        }
    });
}

function toHtml(data) {
    ul = $('<ul>').appendTo('.baskets');
    $(data.result).each(function(index, basket) {
        var cardTemplate = $("#cardTemplate").html();
        var template = cardTemplate.format(basket.id, basket.title, basket.fruits_count)
        ul.append(template);
    });
}

function getBaskets(ukey) {
    url = API_BASKET + '?retrieve_type=by_ukey&ukey=' + ukey;
    $.get(url, function(data) {
        toHtml(data);
    });
}

function getCurrentLink(){
	chrome.tabs.getSelected(null, function(tab) {
	    localStorage.current_link = tab.url;
		localStorage.title = tab.title;
	});
}

function addToBasket(basketId, fruit_url,title, t){
	$.ajax({
	    url: API_FRUIT,
	    type: 'post',
	    data: {
		    retrieve_type : 'by_basket',
	        basket_id: basketId,
	        url: fruit_url,
	        //url: fruit_url,
	        source: 'other_site',
	        title: title,
	        summary: title,
		    access_token: localStorage.token
		},
	    success: function(f){
			id = f.result.id;
			t.data('fid', id);
		    t.toggleClass("rotated");
			var count = t.children(".right").text();
			t.children(".right").text(+count + 1);
		},
	    dataType: 'json'
	});
}

function hack_html(){
	chrome.tabs.executeScript(null,
	    {code:"$('html>*').css('background', 'black')"});
	    //{code:"document.body.style.backgroundColor='black'"});
}

function removeFromBasket(t){
	var id = t.data('fid');
	$.ajax({
		url: API_FRUIT + '?' + $.param({"fruit_id": id, "access_token": localStorage.token}),
		type: 'delete',
		success: function(d){
            t.toggleClass("rotated");
			t.data('fid', '');
			var count = t.children(".right").text();
			t.children(".right").text(+count - 1);
			t = null;
		},
		dataType: 'json'
	});
}

$(document).ready(function(){
    getCookies();
    ukey = localStorage.ukey;
    token = localStorage.token;
    getBaskets(ukey);
    $('.baskets').delegate('.basket','click', function(){
		var t = $(this)
		var bid = t.data('bid');
		t.toggleClass("added");
		getCurrentLink();
		link = localStorage.current_link;
		if (t.hasClass("added")){
			var title = localStorage.title;
			addToBasket(bid, link, title, t);
		}else{
			var id = t.data('fid');
			removeFromBasket(t);
		}
        return false;
    });
	$('.hack').click(function(){
		hack_html();
	});
});

