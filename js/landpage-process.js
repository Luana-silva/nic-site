var event;
var leftComp;
var rightComp;
var addressInfo;

$(function() {

    getLocation();

    returnId();

    getIp();

    //start numerals
    numeral.locale('pt-br');

    $.ajax({
        url:'comp_left.html',
        type:'GET',
        success: function(data){
            leftComp = data;
            processData();
        }
    });

    $.ajax({
        url:'comp_right.html',
        type:'GET',
        success: function(data){
            rightComp = data;
            processData();

        }
    });
});


var id;

function returnId() {

    var urlComplet = window.location.href.split("?e=");

    console.info(urlComplet[1]);

    this.id=urlComplet[1];
}

function getIp(callback)
{
    function response(s)
    {
        callback(window.userip);

        s.onload = s.onerror = null;
        document.body.removeChild(s);
    }

    function trigger()
    {
        window.userip = false;

        var s = document.createElement("script");
        s.async = true;
        s.onload = function() {
            response(s);
        };
        s.onerror = function() {
            response(s);
        };

        s.src = "https://l2.io/ip.js?var=userip";
        document.body.appendChild(s);
    }

    if (/^(interactive|complete)$/i.test(document.readyState)) {
        trigger();
    } else {
        document.addEventListener('DOMContentLoaded', trigger);
    }
}


getIp(function (ip){

    this.ip=window.userip;

    console.log(ip);
});

var ip;

var x=document.getElementById("demo");

var navigator;

function getLocation()
{
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    }else{
        navigator = null
        x.innerHTML="Seu browser não suporta Geolocalização.";
    }
}

function saveClickLog(idEvent){

    if(addressInfo != null){

        var clickLog = {"idEvent" : id, "addressInfo": addressInfo, "ip": ip, "idCompany":idEvent};

        $.service({
            url: "/log/saveClickLog",
            type: "POST",
            data: JSON.stringify(clickLog),
            success: function(data){
                if(data){

                    user = data;
                }
            },
            error: function(msg){
                if(msg){

                    $("#alertError").text(msg)
                    $("#alertError").fadeIn("fast");
                }
            }
        })



    }

}
function saveLoadLog(){

    if(addressInfo != null){

        var loadLog = {"idEvent" : id, "addressInfo": addressInfo, "ip": ip};

        $.service({
            url: "/log/saveLoadLog",
            type: "POST",
            data: JSON.stringify(loadLog),
            success: function(data){
                if(data){

                    user = data;
                }
            },
            error: function(msg){
                if(msg){

                    $("#alertError").text(msg)
                    $("#alertError").fadeIn("fast");
                }
            }
        })



    }

}


function showPosition(position)
{
    addressInfo = {"latitude" : position.coords.latitude, "longitude" : position.coords.longitude };

    console.log("Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude);

    // saveClickLog();
}

function showError(error)
{
    switch(error.code)
    {
        case error.PERMISSION_DENIED:
            x.innerHTML="Usuário rejeitou a solicitação de Geolocalização."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML="Localização indisponível."
            break;
        case error.TIMEOUT:
            x.innerHTML="A requisição expirou."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML="Algum erro desconhecido aconteceu."
            break;
    }

}

function processData(){

    if(leftComp && rightComp){

        //load event
        $.service({
            url: "/event/load/" + $.urlParam("e"),
            type: "GET",
            success: function(event){
                if(event){

                    this.event = event;

                    //load css
                    var cssId = 'myCss';  // you could encode the css path itself to generate id..
                    if (!document.getElementById(cssId)) {

                        var head  = document.getElementsByTagName('head')[0];
                        var link  = document.createElement('link');
                        link.id   = cssId;
                        link.rel  = 'stylesheet';
                        link.type = 'text/css';
                        link.href = urlBase + '/event/css/' + $.urlParam("e");
                        link.media = 'all';
                        head.appendChild(link);
                    }

                    $(".title").html(event.name);
                    $(document).prop('title', event.name);
                    $(".title-sub").html(event.mainMessage);
                    $(".title-sub-2").html(event.secondaryMessage);

                    var urlImage = urlBase + "/event/image/" + $.urlParam("e");

                    //cover
                    $(".bg-cover").css("background-image", "url(" + urlImage + "/cover)");

                    //logo
                    $(".logo").attr("src", urlImage + "/logo");

                    // $('#input-3').rating({displayOnly: true, step: 1, stars: 5, min: 1, max: 5, size:"sm"});

                    if(event.companies){

                        var html = '';

                        for(let i=0; i<event.companies.length; i++){

                            let comp = event.companies[i];
                            var htmlComp;

                            if(i % 2 === 0){
                                htmlComp = rightComp;
                            }
                            else{
                                htmlComp = leftComp;
                            }

                            //dados gerais
                            htmlComp = htmlComp.replace("__COMPANY_NAME__", comp.name);
                            htmlComp = htmlComp.replace("__COMPANY_ADDRESS__", comp.address);
                            htmlComp = htmlComp.replace("__COMPANY_DESC__", comp.desc);
                            // htmlComp = htmlComp.replace("__COMPANY_URL__", comp.info.url);
                            htmlComp = htmlComp.replace("__COMPANY_URL__", comp.info.url+"?nic="+id);
                            htmlComp = htmlComp.replace("__COMPANY_ID__", comp.id);

                            //google maps
                            var mapUrl = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBQ-vZgU3AbX3yTTp_SlhPvBQAL8Rd5zx0&q=" + comp.address;
                            htmlComp = htmlComp.replace("__COMPANY_MAP__", mapUrl);

                            //logo
                            let urlLogo = urlBase + "/company/companyImage/" + comp.id + "/logo";
                            htmlComp = htmlComp.replace("__COMPANY_LOGO__", urlLogo);

                            console.log(comp.id);

                            //preco dos produtos
                            if(comp.salesOff && comp.salesOff.length > 0){
                                htmlComp = htmlComp.replace("__COMPANY_P1_TITLE__", comp.salesOff[0].title);
                                htmlComp = htmlComp.replace("__COMPANY_P1_PRICE__", numeral(comp.salesOff[0].priceNow).format('$0,0.00'));

                                htmlComp = htmlComp.replace("__COMPANY_P2_TITLE__", comp.salesOff[1].title);
                                htmlComp = htmlComp.replace("__COMPANY_P2_PRICE__", numeral(comp.salesOff[1].priceNow).format('$0,0.00'));
                            }

                            //estrelas
                            if(comp.info.stars){
                                var stars = '';

                                for(let j=0; j<comp.info.stars; j++){
                                    stars += '<span class="fa fa-star"></span>';
                                }

                                htmlComp = htmlComp.replace("__COMPANY_STARS__", stars);
                            }

                            //galeria de fotos
                            if(comp.gallery){

                                var itens = '';

                                for(let j=0; j<comp.gallery.length; j++){
                                    let urlItem = urlBase + "/company/companyImage/" + comp.id + "/" + comp.gallery[j].id;
                                    itens += `<div class="item pd-10"><img src="${urlItem}"/></div>`;
                                }

                                htmlComp = htmlComp.replace("__COMPANY_GALLERY__", itens);
                            }

                            html += htmlComp;
                        }

                        $('#comp-section').replaceWith(html);
                    }

                    //carrega o js da template no final, para processar tudo
                    $.getScript( "js/rgen.js", function( data, textStatus, jqxhr ) {

                        $(".reservation").click(function() {
                            var idEvent = $(this).attr("id-event");
                            saveClickLog(idEvent);
                        });
                        saveLoadLog();

                    });
                }
            }
        })
    }
}

