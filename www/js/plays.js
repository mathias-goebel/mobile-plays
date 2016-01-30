// detect between app and browser
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( app ) {
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    onDeviceReady();
}

// back button
document.addEventListener("backbutton", onBackKeyDown, false);

function onDeviceReady() {
	var element = document.getElementById('deviceProp');
	if(typeof device === 'undefined'){
		uuid = '123';
		platform = 'Android';
		model = 'XT1032';
		}
	else {
		uuid = device.uuid;
		platform = device.platform;
		model = device.model};

	element.innerHTML = 'Model: '    + model    + '<br />' +
		            'Platform: ' + platform + '<br />' +
		            'UUID: '     + uuid     + '<br />';
	$.getJSON("https://personae.gcdh.de/ajax/user.xql", {platform: platform,model: model,uuid: uuid})
		.done(function( data ) {
			unew = data.newUser;
			uname = data.name;
			if(unew === 1){
				$( "#welcome" ).append( " "+uname+"!" );				
				    myApp.addNotification({
					message: 'We fondly hope you like the randomly choosen nickname: '+uname,
					onClose: function () {
						    myApp.alert('Since this is the first time you visit Play(s) we like to recommend our tutorial. Unfortunatly it is not implemented yet - so you have to imagine it. And it is great!', 'Welcome to Play(s)!');
						}
				    });
			} else { $( "#welcome" ).append( " back, "+uname+"!" ); }
			$( '#uscore' ).html( data.score );
			for (var i=1; i <= data.level; i++){
			    $('<p class="buttons-row"><a class="button button-fill button-raised" href="level'+i+'.html"><span id="buttonLevel'+i+'"</span></a></p>').appendTo( "#levellist" ).hide().fadeIn(1000);
			  };
			$( '.progressbar-infinite' ).remove();
		});
};

function onBackKeyDown() { $$(".back").click(); } 

var device;

var myApp = new Framework7({
	material: true
});
var $$ = Dom7;
var view1 = myApp.addView('#view-1');


var id;
var title;
var author;
var speaker;
var marked;

// progress bar on loading
var container = $$('body');
if (container.children('.progressbar-infinite').length){ 
	myApp.showProgressbar(container, 0, 'yellow');
	var progress = 0;
	function simulateLoading() {
	setTimeout(function () {
	    var progressBefore = progress;
	    progress += Math.random() * 20;
	    myApp.setProgressbar(container, progress);
	    if (progressBefore < 100) {
		simulateLoading(); //keep "loading"
	    }
	    else myApp.hideProgressbar(container); //hide
	}, Math.random() * 200 + 200);
	}
	simulateLoading();
};

$$(document).on('pageInit', '.page[data-page="level1"]', function (e) {
	lvl1get();
	$$('#speakerlist').change(function(){ lvl1checksave(); });
});

function lvl1get(reload){
	 if(reload === 'true'){ var parameter = {uuid:uuid, id:id} } else {  var parameter =  {uuid:uuid} };
	$.getJSON("https://personae.gcdh.de/ajax/level1.xql", parameter)
	.done(function( data ) {
		id = data.id;
		author = data.author;
		title = data.title;
		speaker = data.speaker;
		marked = data.marked;
		console.log(parameter);
		lvl1go();
	});
};

function lvl1reload(){
	$('#lvl1head').empty();
	$('#centerprogress').show();
	$('#lvl1save, #lvl1next, #lvl1done').addClass('disabled');
	$('#author, #title, #speakerlist').empty();
	lvl1get('true');
};

function lvl1go(){
	var items = [];
	$.each( speaker, function( key, val ) {
		key = key+1;
		items.push(
"<li class='accordion-item' id='" + key + "'><div class='swipeout-content'>"
+ "<label class='label-checkbox item-content no-ripple'>"
+ "<input type='checkbox' name='level1' value='" + key + "'>"
+ "<div class='item-media'><i class='icon icon-form-checkbox'></i></div>"
+ "<div class='item-inner'><div class='item-title'>" + val + "</div><div class='item-after accordion-item-toggle'><span class='badge'>txt</span></div></div>"
+ "</label></div>"
+ "<div class='accordion-item-content'><div class='content-block' id='lvl1texts"+ key +"'><p>loading data...</p></div></div>"
+ " <div class='swipeout-actions-right'><a href='#' class='lvl1remove bg-red' data-confirm='You are going to remove this speaker from the group.' data-confirm-title='Are you sure?' data-close-on-cancel='true'>Remove</a></div></li>" );
	});
	$( "<ul/>", {
		"class": "speaker-list",
		html: items.join( "" )
	}).appendTo( "#speakerlist" );
	$('#title').append( title );
	$('#author').append( author );
	$.each(marked, function(k, v){
	  $.each(v, function(l, w){
	    $('#'+w).addClass('swipeout group'+k);
	  });
	});
	$('#centerprogress').hide(function(){
				setTimeout(function(){ $('#lvl1next, #lvl1done').removeClass( 'disabled' ); }, 3000);	
		});
	$$('.lvl1remove').on('click', function () {
		var removeId = $$(this).parent().parent().attr('id');
		console.log(removeId);
		$.getJSON("https://personae.gcdh.de/ajax/lvl1remove.xql", {num:id, key:removeId, uuid:uuid})
	});
	// works in browser
	$( "input[type=checkbox]" ).on( "click", function(){ lvl1checksave(); });
	$$('.accordion-item').on('open', function () {
		var kkey = $$(this).attr('id');
		$.getJSON("https://personae.gcdh.de/ajax/level1texts.xql", {num:id, key:kkey})
			.done(function( data ){
				$( "#lvl1texts"+kkey ).empty();
				$( "#lvl1texts"+kkey ).append( "<p>"+data.textbefore2+"</p>" );
				$( "#lvl1texts"+kkey ).append( "<p>"+data.textbefore1+"</p>" );
				$( "#lvl1texts"+kkey ).append( "<p>"+data.textbefore+"</p>" );
				$( "#lvl1texts"+kkey ).append( "<p class='thisoccurence'>"+data.text+"</p>" );
				$( "#lvl1texts"+kkey ).append( "<p>"+data.textafter+"</p>" );
				$( "#lvl1texts"+kkey ).append( "<p>"+data.textafter1+"</p>" );
				$( "#lvl1texts"+kkey ).append( "<p>"+data.textafter2+"</p>" );
			});
	});
	
};

function lvl1done(){
	$('#lvl1done').addClass('disabled');
	$.getJSON("https://personae.gcdh.de/ajax/lvl1done.xql", {done:1, num:id, uuid:uuid})
		.done(function( data ){
			$( '#uscore' ).html( data.score );
		   	myApp.addNotification({
				message: '+5 points! If other player validates your input, this score doubles!', 
				button: { text: 'Next'},
				onClose: function () {
					$("input:checkbox").removeAttr("checked");
					$('#lvl1save, #lvl1done').addClass('disabled');
					lvl1next();}
			});

		});
};

var timeout;

function lvl1next(){
	$('#lvl1head').empty();
	$('#centerprogress').show();
	$('#lvl1save, #lvl1next, #lvl1done').addClass('disabled');
	$('#author, #title, #speakerlist').empty();
	lvl1get();
};

function lvl1toggle(id){
	$('#'+id).removeClass( 'disabled' );
}

function lvl1checksave(){
	if($( 'input:checked' ).map(function(){ return this.value; }).get().length > 1){
		$('#lvl1save').removeClass('disabled');
		$('#lvl1head').empty();
		var item= $( 'input:checked' ).parent('label').find('.item-title')[0].innerText;
		$('#lvl1head').append( item );
	} else {
		$('#lvl1save').addClass('disabled');
		$('#lvl1head').empty();
	};
	if($( 'input:checked' ).map(function(){ return this.value; }).get().length === 1){
		$('#lvl1head').empty();
		var item= $( 'input:checked' ).parent('label').find('.item-title')[0].innerText;
		$('#lvl1head').append( item );
	};
};

function lvl1save(){
	$('#lvl1save').addClass( 'disabled' );
	var agents = $( 'input:checked' ).map(function(){ return this.value; }).get().join(';');
	$.getJSON("https://personae.gcdh.de/ajax/lvl1link.xql", {link:agents, num:id, uuid:uuid})
		.done(function( data ){
			$( '#uscore' ).html( data.score );
			switch(data.thisscore) {
				    case 0:
					 var msg = 'You already added this link. 0 points this time';
					break;
				    case 1:
					var msg = '+1 point! If an other player validates your input, the score doubles.';
					break;
				    default:
					var msg = '+'+data.thisscore+'point! If an other player validates your input, the score doubles.';
				}
			    myApp.addNotification({
				message: msg, 
				button: { text: 'Yeah!'},
				onClose: function () {
						$("input:checkbox").removeAttr("checked");
						$('#lvl1head').empty();
					}
				});

	});
};

function lvl1sort(){
// according to the current placed icon, 
// a sort function will be choosed

if($('#sortbtn > i').attr('class') === 'fa fa-sort-alpha-asc'){
	var items = $('ul.speaker-list li').get();
	items.sort(function(a,b){
	  var keyA = $(a).text();
	  var keyB = $(b).text();

	  if (keyA < keyB) return -1;
	  if (keyA > keyB) return 1;
	  return 0;
	});
	var ul = $('.speaker-list');
	$.each(items, function(i, li){
	  ul.append(li);
	});
	$('#sortbtn > i').attr('class', 'fa fa-sort-numeric-asc');
}
else if($('#sortbtn > i').attr('class') === 'fa fa-sort-numeric-asc'){
	var items = $('ul.speaker-list li').get();
	items.sort(function(a,b){
	  var keyA = parseInt( $(a).attr('id') );
	  var keyB = parseInt( $(b).attr('id') );

	  if (keyA < keyB) return -1;
	  if (keyA > keyB) return 1;
	  return 0;
	});
	var ul = $('.speaker-list');
	$.each(items, function(i, li){
	  ul.append(li);
	});
	$('#sortbtn > i').attr('class', 'fa fa-sort-alpha-asc');
}

};
