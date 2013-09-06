API_GET = "http://www.guokr.com/apis/community/basket.json"

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
            console.log(JSON.stringify(cookie[i]));
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
    url = API_GET + '?retrieve_type=by_ukey&ukey=' + ukey;
    $.get(url, function(data) {
        toHtml(data);
    });
}

$('.flip').click(function(){
    $(this).find('.card').addClass('flipped').mouseleave(function(){
        $(this).removeClass('flipped');
    });
    return false;
});

$(document).ready(function(){
    getCookies();
    ukey = localStorage.ukey;
    token = localStorage.token;
    getBaskets(ukey);
});


