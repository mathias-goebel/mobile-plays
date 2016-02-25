// Play(s) main javascript file
//
// app or browser
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( app ) {
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    onDeviceReady();
}
// back button
	document.addEventListener("backbutton", onBackKeyDown, false);

// Framework7
	var myApp = new Framework7({
		material: true,
		swipePanel: 'left'
	});
	var $$ = Dom7;
	var view1 = myApp.addView('#view-1');

// global var
	var device;
	var backi = 0;
	var id;
	var title;
	var author;
	var speaker;
	var marked;
	var timeout;
	var uuid;
	var hslist;
	var uname;
	var ids;

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
						    myApp.alert('This is the first time you visit Play(s). We have choosen a random nickname from more then 20.000 different speaker names.', 'Welcome to Play(s)!');
						}
				    });
			} else { $( "#welcome" ).append( " back, "+uname+"!" ); }
			$( '#uscore' ).html( data.score );
			$( '#rank' ).html( data.rank );
			for (var i=1; i <= data.level; i++){
			    $('<p class="buttons-row"><a class="button button-fill button-raised" href="level'+i+'.html"><span id="buttonLevel'+i+'"</span></a></p>').appendTo( "#levellist" ).hide().fadeIn(1000);
			  };
			$( '.progressbar-infinite' ).remove();
		});
};

function getBoni(n){
	$.getJSON("https://personae.gcdh.de/ajax/bonus.xql", {bonus:n, uuid:uuid})
		.done(function( data ){ 
			if(data.news === 1){myApp.alert('+'+ data.thisscore +'points!!!1!', 'You have found a secret!');};
			$( '#uscore' ).html( data.score );
		});
};

function onBackKeyDown() {

if( $$('.popup').hasClass('modal-in') ) { myApp.closeModal();  }
else if($$('body').hasClass('with-panel-left-reveal')) { myApp.closePanel(); }

else if($$('.page-on-center').length === 0 || $$('.page-on-center').attr('data-page') === 'index-1' ){
	if(backi === 1){ backi = 0; navigator.app.exitApp(); }
	else { 	backi++;

		myApp.addNotification({
			message: 'Tap twice to leave Play(s).', 
			button: { text: 'No, thanks.'},
			onClose: function () {

            				getBoni('quit');
					backi--;
        				}
			}); //notification
	} // end else
} //end else if
else { $$(".back").click(); }
return backi;
};

// highscore list
$$('.popup-highscore').on('open', function () {
	var items = [];
	var i = 1;
	$.getJSON("https://personae.gcdh.de/ajax/highscore.xql")
	.done(function( data ) {
		hslist = data;
		$.each(data, function(key, val){
			items.push(
			"<li class='item-content'>"
+			  "<div class='item-media'><span class='badge'>"+i+"</span></div>"
+			  "<div class='item-inner'>"
+			    "<div class='item-title'>"+key+"</div>"
+			    "<div class='item-after'><span class='badge'>"+val+"</span></div>"
+			  "</div>"
+			"</li>"
			);
		i++;
		});
				$( "<ul/>", {"class": "hslisting",html: items.join( "" )}).appendTo( "#highscore" );
	});

});
$$('.popup-highscore').on('closed', function () {
	$( "#highscore" ).empty();
});

// contributions list
$$('.popup-contributions').on('open', function () {
	var i = 1;
	$.getJSON("https://personae.gcdh.de/ajax/userLastContrib.xql", {uuid:uuid})
	.done(function( data ) {
		$.each(data.ids, function(key, val){
			key = key + 1;
			var r = Math.ceil( key / 4 ).toString();
			$( '#r'+r ).append("<div class='col-25 bglvl"+data.levels[key - 1].toString()+"'><div class='contribid'>"+val+"</div><div class='contribtitle'>"+data.titles[key - 1]+"</div></div>" );
			i++;
		});
	});

});
$$('.popup-contributions').on('closed', function () {
	$( "#contributions > .row" ).empty();
});

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

// GENERIC HELP TOGGLE
function helptoggle(){
$$('#helptoggle').on('click', function(){
	if($$('#helptoggle > i').hasClass('fa-chevron-up')){
		$$('#lvl1helpcontent').css('display', 'none');
		$$('#helptoggle > i').addClass('fa-chevron-down');
		$$('#helptoggle > i').removeClass('fa-chevron-up');
	}
	else {
		$$('#lvl1helpcontent').css('display', 'block');
		$$('#helptoggle > i').addClass('fa-chevron-up');
		$$('#helptoggle > i').removeClass('fa-chevron-down');
	}
 });
}

///////////////
//  LEVEL 1  //
///////////////

$$(document).on('pageInit', '.page[data-page="level1"]', function (e) {
	lvl1get();
	helptoggle();
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
		lvl1go();
	});
};

function lvl1reload(){
	$('#lvl1head').empty();
	$('#centerprogress').show();
	$('#lvl1save, #lvl1next, #lvl1done').addClass('disabled');
	$('#author, #title, #speakerlist').empty();
	$('#sortbtn > i').attr('class', 'fa fa-sort-alpha-asc');
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
+ " <div class='swipeout-actions-right' style='display:none;'><a href='#' class='lvl1remove bg-red ripple'>Remove</a></div></li>" );
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
		$.getJSON("https://personae.gcdh.de/ajax/lvl1remove.xql", {num:id, key:removeId, uuid:uuid})
			.done( function( data ){
				myApp.swipeoutClose('#'+removeId);
				var group = $('#'+removeId).attr('class').split(' ')[2];
				if($('.'+group).length > 2){ 
					$('#'+removeId+'> .swipeout-actions-right').css('display', 'none');
					$('#'+removeId).removeClass( group );
					$('#'+removeId).removeClass('swipeout'); } 
				else { 
					$('.'+group+'> .swipeout-actions-right').css('display', 'none');
					$('.'+group).removeClass( 'swipeout' );
					$('.'+group).removeClass( group );
					};
				
			});
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

			var lis = document.getElementsByClassName('swipeout');
			for (var num=-1, i=0, max=lis.length; i < max; i++){
			  var j = lis[i].classList[2].substr(5, 2);
			  if(j > num){ num=j; console.log(j);}
			}
			var newnum = parseInt(num)+1;
			$( 'input:checked' ).parents('li').addClass('swipeout group'+newnum);

			$( '#uscore' ).html( data.score );
			switch(data.thisscore) {
				    case 0:
					 var msg = 'You already added this link. 0 points this time';
					break;
				    case 1:
					var msg = '+1 point! If an other player validates your input, the score doubles.';
					break;
				    default:
					var msg = '+'+data.thisscore+'points! If an other player validates your input, the score doubles.';
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
// according to the current icon, 
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

///////////////
//  LEVEL 2  //
///////////////

// TODO: Aktion für remove neu vergeben, ohne remove und mit einfärben
// TODO: Aktion für new Agg neu vergeben, Gruppe wegnehmen


$$(document).on('pageInit', '.page[data-page="level2"]', function (e) {
	lvl2get();
	$$('#speakerlist').change(function(){ lvl1checksave(); });
});

function lvl2get(reload){
	if(reload === 'true'){ var parameter = {uuid:uuid, id:id} } else {  var parameter =  {uuid:uuid} };
	$.getJSON("https://personae.gcdh.de/ajax/level2.xql", parameter)
	.done(function( data ) {
		id = data.id;
		author = data.author;
		title = data.title;
		speaker = data.speaker;
		marked = data.marked;
		ids = data.ids;
		lvl2go();
	});
};
function lvl2go(){
	var items = [];
	$.each( speaker, function( key, val ) {
		key = key+1;
		items.push(
"<li class='accordion-item swipeout' id='" + key + "'><div class='swipeout-content'>"
+ "<div class='item-inner'><div class='item-title'>" + val + "</div><div class='item-after accordion-item-toggle'><span class='badge'>txt</span></div></div>"
+ "</div>"
+ "<div class='accordion-item-content'><div class='content-block' id='lvl2texts"+ key +"'><p>loading data...</p></div></div>"
+ " <div class='swipeout-actions-right' style='display:none;'><a href='#' class='swipeout bg-blue ripple'><i class='fa fa-users'></i></a></div></li>" );
	});
	$( "<ul/>", {
		"class": "speaker-list",
		html: items.join( "" )
	}).appendTo( "#speakerlist" );
	$('#title').append( title );
	$('#author').append( author );
	$.each(marked, function(k, v){
		$('#'+v).addClass('group'+k);

	});
	$('#centerprogress').hide(function(){
				setTimeout(function(){ $('#lvl2reset, #lvl2done').removeClass( 'disabled' ); }, 3000);	
		});
	$$('.swipeout').on('deleted', function () {
		var aggkey = $$(this).attr('id');
		$.getJSON("https://personae.gcdh.de/ajax/lvl2agg.xql", {num:id, key:aggkey, uuid:uuid})
	});
	$$('.accordion-item').on('open', function () {
		var kkey = $$(this).attr('id');
		$.getJSON("https://personae.gcdh.de/ajax/level1texts.xql", {num:id, key:kkey})
			.done(function( data ){
				$( "#lvl2texts"+kkey ).empty();
				$( "#lvl2texts"+kkey ).append( "<p>"+data.textbefore2+"</p>" );
				$( "#lvl2texts"+kkey ).append( "<p>"+data.textbefore1+"</p>" );
				$( "#lvl2texts"+kkey ).append( "<p>"+data.textbefore+"</p>" );
				$( "#lvl2texts"+kkey ).append( "<p class='thisoccurence'>"+data.text+"</p>" );
				$( "#lvl2texts"+kkey ).append( "<p>"+data.textafter+"</p>" );
				$( "#lvl2texts"+kkey ).append( "<p>"+data.textafter1+"</p>" );
				$( "#lvl2texts"+kkey ).append( "<p>"+data.textafter2+"</p>" );
			});
	});
};

function lvl2done(){
	$('#lvl2done').addClass('disabled');
	$.getJSON("https://personae.gcdh.de/ajax/lvl2done.xql", {done:1, num:id, uuid:uuid})
		.done(function( data ){
			$( '#uscore' ).html( data.score );
		   	myApp.addNotification({
				message: 'Current Score: '+ data.score +'points', 
				button: { text: 'Next'},
				onClose: function () {
					$('#lvl2done').addClass('disabled');
					lvl2next();}
			});

		});
};

function lvl2next(){
	$('#centerprogress').show();
	$('#lvl2done').addClass('disabled');
	$('#author, #title, #speakerlist').empty();
	$('#sortbtn > i').attr('class', 'fa fa-sort-alpha-asc');
	lvl2get();
};
function lvl2sort(){
	lvl1sort();
};

///////////////
//  LEVEL 3  //
///////////////

$$(document).on('pageInit', '.page[data-page="level3"]', function (e) {
	lvl3get();
	helptoggle();
});

var index;
var obj;

function lvl3get(reload){
	 if(reload === 'true'){ var parameter = {uuid:uuid, id:id} } else {  var parameter =  {uuid:uuid} };
	$.getJSON("https://personae.gcdh.de/ajax/level3.xql", parameter)
	.done(function( data ) {
		var agg= parseInt(data.aggs[0]);
		console.log( agg );
		var k;
		var id;
		for (k = data.ids.length - 1; k >= 0; --k) { if( data.ids[k] === agg ){ id=k }}
		console.log( id );
		$$('#lvl3group').text( data.speaker[ id ] );
	});
};
