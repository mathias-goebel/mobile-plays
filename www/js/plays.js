// Play(s) main javascript file
//
// app or browser
var app = document.URL.indexOf('http://') === - 1 && document.URL.indexOf('https://') === - 1;
if (app) {
  document.addEventListener('deviceready', onDeviceReady, false);
} else {
  onDeviceReady();
  window.onbeforeunload = function() { return "To go from within a level to the main menu please use the back button in the upper toolbar."; };
}

// back button
document.addEventListener('backbutton', onBackKeyDown, false);

// Framework7
var plays = new Framework7({
  material: true,
  swipePanel: 'left'
});
var $$ = Dom7;
var view1 = plays.addView('#view-1');
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
var unew;
var maxlevel;

function onDeviceReady() {
  var element = document.getElementById('deviceProp');
  if (typeof device === 'undefined') {
    uuid = '123';
    platform = 'Android';
    model = 'XT1032';
  } 
  else {
    uuid = device.uuid;
    platform = device.platform;
    model = device.model
  };
  element.innerHTML = 'Model: ' + model + '<br />' +
// 'Platform: ' + platform + '<br />' +
  'UUID: ' + uuid + '<br />';
  $.getJSON('https://personae.gcdh.de/ajax/user.xql', {
    platform: platform,
    model: model,
    uuid: uuid
  }).done(function (data) {
    unew = data.newUser;
    uname = data.name;
    if (unew === 1) {
      $('#welcome').append(' ' + uname + '!');
      plays.addNotification({
        message: 'We fondly hope you like the randomly choosen nickname: ' + uname,
        onClose: function () {
          plays.alert('This is the first time you visit Play(s). We have choosen a random nickname from more then 20.000 different speaker names. We hope you like the selection, but you can customize the name in your account settings.', 'Welcome to Play(s)!');
        }
      });
    } else {
      $('#welcome').append(' back, ' + uname + '!');
    }
    $('#acc-nickname').html(uname);
    $('#uscore').html(data.score);
    $('#rank').html(data.rank);
    maxlevel = data.level;
    levellist();
    $('.progressbar-infinite').remove();
  });
};
function levellist(){
	for (var i = 1; i <= maxlevel; i++) {
	  $('<p class="buttons-row"><a class="button button-fill button-raised" href="level' 
	  	+ i + '.html"><span id="buttonLevel' + i + '"</span></a></p>').appendTo('#levellist').hide().fadeIn(1000);
	};
	for (var i = maxlevel + 1; i <= 4; i++) {
	  $('<p class="buttons-row"><a class="button button-fill button-raised disabled" href="level'
	   + i + '.html"><span id="buttonLevel' + i + '"</span></a></p>').appendTo('#levellist').hide().fadeIn(1000);
	};
};
function testlevellist(num){
	if( maxlevel != num ){
		plays.alert('You have unlocked a new level!', 'Yippee!!!!');
		$('#levellist a.disabled:first').toggleClass('disabled');
		maxlevel=num;
	}
};
function getBoni(n) {
  $.getJSON('https://personae.gcdh.de/ajax/bonus.xql', {
    bonus: n,
    uuid: uuid
  }).done(function (data) {
    if (data.news === 1) {
      plays.alert('+' + data.thisscore + 'points!!!1!', 'You have found a secret!');
    };
    $('#uscore').html(data.score);
  });
};
function onBackKeyDown() {
  if( $.each( $('.popup'), function(){} ).hasClass('modal-in') ) 
  	{ plays.closeModal(); }
  else if ($$('body').hasClass('with-panel-left-reveal')) {
    plays.closePanel();
  } 
  else if ($$('.page-on-center').length === 0 || $$('.page-on-center').attr('data-page') === 'index-1') {
    if (backi === 1) {
      backi = 0;
      navigator.app.exitApp();
    } 
    else {
      backi++;
      plays.addNotification({
        message: 'Tap twice to leave Play(s).',
        button: {
          text: 'No, thanks.'
        },
        onClose: function () {
          getBoni('quit');
          backi--;
        }
      }); //notification
    }
    // end else

  }
  //end else if
   else {
    $$('.back').click();
  }
  return backi;
};
// highscore list
$$('.popup-highscore').on('open', function () {
  var items = [
  ];
  var i = 1;
  $.getJSON('https://personae.gcdh.de/ajax/highscore.xql').done(function (data) {
    hslist = data;
    $.each(data, function (key, val) {
      items.push('<li class=\'item-content\'>'
      + '<div class=\'item-media\'><span class=\'badge\'>' + i + '</span></div>'
      + '<div class=\'item-inner\'>'
      + '<div class=\'item-title\'>' + key + '</div>'
      + '<div class=\'item-after\'><span class=\'badge\'>' + val + '</span></div>'
      + '</div>'
      + '</li>'
      );
      i++;
    });
    $('<ul/>', {
      'class': 'hslisting',
      html: items.join('')
    }).appendTo('#highscore');
  });
});
$$('.popup-highscore').on('closed', function () {
  $('#highscore').empty();
});
// contributions list
$$('.popup-contributions').on('open', function () {
  var i = 1;
  $.getJSON('https://personae.gcdh.de/ajax/userLastContrib.xql', {
    uuid: uuid
  }).done(function (data) {
    $.each(data.ids, function (key, val) {
      key = key + 1;
      var r = Math.ceil(key / 4).toString();
      $('#r' + r).append('<div class=\'col-25 bglvl' + data.levels[key - 1].toString() + '\'><div class=\'contribid\'>' + val + '</div><div class=\'contribtitle\'>' + data.titles[key - 1] + '</div></div>');
      i++;
    });
  });
});
$$('.popup-contributions').on('closed', function () {
  $('#contributions > .row').empty();
});
// progress bar on loading
var container = $$('body');
if (container.children('.progressbar-infinite').length) {
  plays.showProgressbar(container, 0, 'yellow');
  var progress = 0;
  function simulateLoading() {
    setTimeout(function () {
      var progressBefore = progress;
      progress += Math.random() * 20;
      plays.setProgressbar(container, progress);
      if (progressBefore < 100) {
        simulateLoading(); //keep "loading"
      } 
      else plays.hideProgressbar(container); //hide
    }, Math.random() * 200 + 200);
  }
  simulateLoading();
};
// GENERIC HELP TOGGLE
function helptoggle() {
  $$('#helptoggle').on('click', function () {
    if ($$('#helptoggle > i').hasClass('fa-chevron-up')) {
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
};

function tutorial(level){
switch(level) {
    case 1:
        plays.popover('.popover-head', '#lvl1head');
	$$('.popover-head').on('closed', function(){
	plays.popover('.popover-sort', '#sortbtn');
	});
	$$('.popover-sort').on('closed', function(){
	plays.popover('.popover-skip', '#lvl1next');
	});
        break;
    case 2:
        plays.popover('.popover-head2', '#lvl2head');
    case 3:
        plays.popover('.popover-head3', '#lvl3head');
    case 4:
        plays.popover('.popover-head4', '#lvl4head');
    default:
} 
};

///////////////
//  LEVEL 1  //
///////////////
// TODO: sort by class index-of "group" gt -1 and split <<<< sort by group
$$(document).on('pageInit', '.page[data-page="level1"]', function (e) {
  lvl1get();
  helptoggle();
  $$('#speakerlist').change(function () {
    lvl1checksave();
  });
});
function lvl1get(reload) {
  if (reload === 'true') {
    var parameter = {
      uuid: uuid,
      id: id
    }
  } else {
    var parameter = {
      uuid: uuid
    }
  };
  $.getJSON('https://personae.gcdh.de/ajax/level1.xql', parameter).done(function (data) {
    id = data.id;
    author = data.author;
    title = data.title;
    speaker = data.speaker;
    marked = data.marked;
    lvl1go();
    if(data.new){tutorial(1)}
  });
};
function lvl1reload() {
  $('#lvl1head').empty();
  $('#centerprogress').show();
  $('#lvl1save, #lvl1next, #lvl1done').addClass('disabled');
  $('#author, #title, #speakerlist').empty();
  $('#sortbtn > i').attr('class', 'fa fa-sort-alpha-asc');
  lvl1get('true');
};
function lvl1go() {
  var items = [
  ];
  $.each(speaker, function (key, val) {
    key = key + 1;
    items.push('<li class=\'accordion-item\' id=\'' + key + '\'><div class=\'swipeout-content\'>'
    + '<label class=\'label-checkbox item-content no-ripple\'>'
    + '<input type=\'checkbox\' name=\'level1\' value=\'' + key + '\'>'
    + '<div class=\'item-media\'><i class=\'icon icon-form-checkbox\'></i></div>'
    + '<div class=\'item-inner\'><div class=\'item-title\'>' + val + '</div><div class=\'item-after accordion-item-toggle\'><span class=\'badge\'>txt</span></div></div>'
    + '</label></div>'
    + '<div class=\'accordion-item-content\'><div class=\'content-block\' id=\'lvl1texts' + key + '\'><p>loading data...</p></div></div>'
    + ' <div class=\'swipeout-actions-right\' style=\'display:none;\'><a href=\'#\' class=\'lvl1remove bg-red ripple\'>Remove</a></div></li>');
  });
  $('<ul/>', {
    'class': 'speaker-list',
    html: items.join('')
  }).appendTo('#speakerlist');
  $('#title').append(title);
  $('#author').append(author);
  $.each(marked, function (k, v) {
    $.each(v, function (l, w) {
      $('#' + w).addClass('swipeout group' + k);
    });
  });
  $('#centerprogress').hide(function () {
    setTimeout(function () {
      $('#lvl1next, #lvl1done').removeClass('disabled');
    }, 3000);
  });
  $$('.lvl1remove').on('click', function () {
    var removeId = $$(this).parent().parent().attr('id');
    $.getJSON('https://personae.gcdh.de/ajax/lvl1remove.xql', {
      num: id,
      key: removeId,
      uuid: uuid
    }).done(function (data) {
      plays.swipeoutClose('#' + removeId);
      var group = $('#' + removeId).attr('class').split(' ') [2];
      if ($('.' + group).length > 2) {
        $('#' + removeId + '> .swipeout-actions-right').css('display', 'none');
        $('#' + removeId).removeClass(group);
        $('#' + removeId).removeClass('swipeout');
      } 
      else {
        $('.' + group + '> .swipeout-actions-right').css('display', 'none');
        $('.' + group).removeClass('swipeout');
        $('.' + group).removeClass(group);
      };
    });
  });
  // works in browser
  $('input[type=checkbox]').on('click', function () {
    lvl1checksave();
  });
  lvl1texts();
};
function lvl1texts(){
	$$('.accordion-item').on('open', function () {
    var kkey = $$(this).attr('id');
    $.getJSON('https://personae.gcdh.de/ajax/level1texts.xql', {
      num: id,
      key: kkey
    }).done(function (data) {
      $('#lvl1texts' + kkey).empty();
      $('#lvl1texts' + kkey).append('<p>' + data.textbefore2 + '</p>');
      $('#lvl1texts' + kkey).append('<p>' + data.textbefore1 + '</p>');
      $('#lvl1texts' + kkey).append('<p>' + data.textbefore + '</p>');
      $('#lvl1texts' + kkey).append('<p class=\'thisoccurence\'>' + data.text + '</p>');
      $('#lvl1texts' + kkey).append('<p>' + data.textafter + '</p>');
      $('#lvl1texts' + kkey).append('<p>' + data.textafter1 + '</p>');
      $('#lvl1texts' + kkey).append('<p>' + data.textafter2 + '</p>');
    });
  });
};
function lvl1done() {
  $('#lvl1done').addClass('disabled');
  $.getJSON('https://personae.gcdh.de/ajax/lvl1done.xql', {
    done: 1,
    num: id,
    uuid: uuid
  }).done(function (data) {
    $('#uscore').html(data.score);
    plays.addNotification({
      message: '+5 points! If other player validates your input, this score doubles!',
      button: {
        text: 'Next'
      },
      onClose: function () {
        $('input:checkbox').removeAttr('checked');
        $('#lvl1save, #lvl1done').addClass('disabled');
        lvl1next();
      }
    });
  });
};
function lvl1next() {
  $('#lvl1head').empty();
  $('#centerprogress').show();
  $('#lvl1save, #lvl1next, #lvl1done').addClass('disabled');
  $('#author, #title, #speakerlist').empty();
  lvl1get();
};
function lvl1toggle(id) {
  $('#' + id).removeClass('disabled');
}
function lvl1checksave() {
  if ($('input:checked').map(function () {
    return this.value;
  }).get().length > 1) {
    $('#lvl1save').removeClass('disabled');
    $('#lvl1head').empty();
    var item = $('input:checked').parent('label').find('.item-title') [0].innerText;
    $('#lvl1head').append(item);
  } else {
    $('#lvl1save').addClass('disabled');
    $('#lvl1head').empty();
  };
  if ($('input:checked').map(function () {
    return this.value;
  }).get().length === 1) {
    $('#lvl1head').empty();
    var item = $('input:checked').parent('label').find('.item-title') [0].innerText;
    $('#lvl1head').append(item);
  };
};
function lvl1save() {
  $('#lvl1save').addClass('disabled');
  var agents = $('input:checked').map(function () {
    return this.value;
  }).get().join(';');
  $.getJSON('https://personae.gcdh.de/ajax/lvl1link.xql', {
    link: agents,
    num: id,
    uuid: uuid
  }).done(function (data) {
    var lis = document.getElementsByClassName('swipeout');
    for (var num = - 1, i = 0, max = lis.length; i < max; i++) {
      var j = lis[i].classList[2].substr(5, 2);
      if (j > num) {
        num = j;
      }
    }
    var newnum = parseInt(num) + 1;
    $('input:checked').parents('li').addClass('swipeout group' + newnum);
    $('#uscore').html(data.score);
    switch (data.thisscore) {
      case 0:
        var msg = 'You already added this link. 0 points this time';
        break;
      case 1:
        var msg = '+1 point! If an other player validates your input, the score doubles.';
        break;
      default:
        var msg = '+' + data.thisscore + 'points! If an other player validates your input, the score doubles.';
    }
    $('input:checkbox').removeAttr('checked');
    plays.addNotification({
      message: msg,
      button: {
        text: 'Yeah!'
      },
      onClose: function () {
        $('#lvl1head').empty();
      }
    });
    testlevellist(data.level);
  });
};
function lvl1sort() {
  // according to the current icon, 
  // a sort function will be choosed
  if ($('#sortbtn > i').attr('class') === 'fa fa-sort-alpha-asc') {
    var items = $('ul.speaker-list li').get();
    items.sort(function (a, b) {
      var keyA = $(a).text();
      var keyB = $(b).text();
      if (keyA < keyB) return - 1;
      if (keyA > keyB) return 1;
      return 0;
    });
    var ul = $('.speaker-list');
    $.each(items, function (i, li) {
      ul.append(li);
    });
    $('#sortbtn > i').attr('class', 'fa fa-sort-numeric-asc');
  } 
  else if ($('#sortbtn > i').attr('class') === 'fa fa-sort-numeric-asc') {
    var items = $('ul.speaker-list li').get();
    items.sort(function (a, b) {
      var keyA = parseInt($(a).attr('id'));
      var keyB = parseInt($(b).attr('id'));
      if (keyA < keyB) return - 1;
      if (keyA > keyB) return 1;
      return 0;
    });
    var ul = $('.speaker-list');
    $.each(items, function (i, li) {
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
  helptoggle();
  lvl2get();
  $$('#speakerlist').change(function () {
    lvl1checksave();
  });
});
function lvl2get(reload) {
  if (reload === 'true') {
    $('#speakerlist, #author, #title').empty();
    var parameter = {
      uuid: uuid,
      id: id
    }
  } else {
    var parameter = {
      uuid: uuid
    }
  };
  $.getJSON('https://personae.gcdh.de/ajax/level2.xql', parameter).done(function (data) {
    id = data.id;
    author = data.author;
    title = data.title;
    speaker = data.speaker;
    marked = data.marked;
    ids = data.ids;
    lvl2go();
    if(data.new){tutorial(2)}
  });
};

function aggclick(key){
if($('#'+key).hasClass('group')){
	var group=$('#' + key).attr('class').split(' ') [2];
	$('#'+key).removeClass('group');
	$('#'+key).removeClass(group);
}
else {
	var nxtgroup=$('.group').length;
	$('#'+key).addClass('group');
	$('#'+key).addClass('group'+ nxtgroup);
}
};

function lvl2go() {
  var items = [
  ];
  $.each(speaker, function (key, val) {
    key = key + 1;
    items.push('<li class=\'accordion-item swipeout\' id=\'' + ids[key-1] + '\'><div class=\'swipeout-content\'>'
    + '<div class=\'item-inner\'><div class=\'item-title\'>' + val + '</div><div class=\'item-after accordion-item-toggle\'><span class=\'badge\'>txt</span></div></div>'
    + '</div>'
    + '<div class=\'accordion-item-content\'><div class=\'content-block\' id=\'lvl2texts' + ids[key-1] + '\'><p>loading data...</p></div></div>'
    + ' <div class=\'swipeout-actions-right\' style=\'display:none;\'><a onclick="aggclick(' + ids[key-1] + ')" href=\'#\' class=\'swipeout bg-blue ripple addagg\'><i class=\'fa fa-users\'></i></a></div></li>');
  });
  $('<ul/>', {
    'class': 'speaker-list',
    html: items.join('')
  }).appendTo('#speakerlist');
  $('#title').append(title);
  $('#author').append(author);
  $.each(marked, function (k, v) {
    $('#' + v).addClass('group' + k);
    $('#' + v).addClass('group');
  });
  $$('.group a').addClass('rm');
  $$('.group a').removeClass('addagg');

  $('#centerprogress').hide(function () {
    setTimeout(function () {
      $('#lvl2reset, #lvl2done').removeClass('disabled');
    }, 3000);
  });

  $$('.accordion-item-toggle').on('click', function () {
    var kkey = $$(this).parent().parent().parent().attr('id');
    $.getJSON('https://personae.gcdh.de/ajax/level1texts.xql', {
      num: id,
      key: kkey
    }).done(function (data) {
      $('#lvl2texts' + kkey).empty();
      $('#lvl2texts' + kkey).append('<p>' + data.textbefore2 + '</p>');
      $('#lvl2texts' + kkey).append('<p>' + data.textbefore1 + '</p>');
      $('#lvl2texts' + kkey).append('<p>' + data.textbefore + '</p>');
      $('#lvl2texts' + kkey).append('<p class=\'thisoccurence\'>' + data.text + '</p>');
      $('#lvl2texts' + kkey).append('<p>' + data.textafter + '</p>');
      $('#lvl2texts' + kkey).append('<p>' + data.textafter1 + '</p>');
      $('#lvl2texts' + kkey).append('<p>' + data.textafter2 + '</p>');
    });
  });
};
function lvl2done() {
  $('#lvl2done').addClass('disabled');
  var keys = $('.group').map(function(){ return $(this).attr('id') }).get().join(';');
  $.getJSON('https://personae.gcdh.de/ajax/lvl2done.xql', {
    done: 1,
    num: id,
    uuid: uuid,
     kv: keys
  }).done(function (data) {
    $('#uscore').html(data.score);
    plays.addNotification({
      message: 'Current Score: ' + data.score + 'points',
      button: {
        text: 'Next'
      },
      onClose: function () {
        $('#lvl2done').addClass('disabled');
        lvl2next();
      }
    });
	testlevellist(data.level);
  });
};
function lvl2next() {
  $('#centerprogress').show();
  $('#lvl2done').addClass('disabled');
  $('#author, #title, #speakerlist').empty();
  $('#sortbtn > i').attr('class', 'fa fa-sort-alpha-asc');
  lvl2get();
};
function lvl2sort() {
  lvl1sort();
};
///////////////
//  LEVEL 3  //
///////////////

var ids;
var aggs;
var aggId;

var aggNum = 0; // Laufvariable für agg array

$$(document).on('pageInit', '.page[data-page="level3"]', function (e) {
  lvl3get();
  helptoggle();
  $$('#speakerlist').change(function () {
    lvl3checksave();
  });
});

function lvl3get(reload) {
  if (reload === 'true') {
    var parameter = {
      uuid: uuid,
      id: id
    }
  } else {
    var parameter = {
      uuid: uuid
    }
  };
  $.getJSON('https://personae.gcdh.de/ajax/level3.xql', parameter).done(function (data) {
    aggs=data.aggs;
    speaker=data.speaker;
    ids=data.ids;
    id=data.id;
    lvl3go(aggNum);
    if(data.new){tutorial(3)}
  });
};

function lvl3go(num){
  var k;
  var agg= aggs[num];
  for (k = ids.length; k >= 0; --k) {
    if (ids[k] === agg) {
      aggId = k
    }
  }
// aggId = id of aggregation in speaker array
  $$('#lvl3group').text(speaker[aggId]);
	console.log('attached id '+aggId)
  $$('#centerprogress').hide();
  lvl3list(aggId);
}

function lvl3list(aggId) {
  $('#speakerlist').empty();
  var items = [
  ];
  $.each(speaker, function (key, val) {
    var thisone='';
    if(key === aggId){ thisone=' group0' };
    items.push('<li class=\'accordion-item'+ thisone +'\' id=\'' + ids[key] + '\'><div class=\'swipeout-content\'>'
    + '<label class=\'label-checkbox item-content no-ripple\'>'
    + '<input type=\'checkbox\' name=\'level1\' value=\'' + ids[key] + '\'>'
    + '<div class=\'item-media\'><i class=\'icon icon-form-checkbox\'></i></div>'
    + '<div class=\'item-inner\'><div class=\'item-title\'>' + val + '</div><div class=\'item-after accordion-item-toggle\'><span class=\'badge\'>txt</span></div></div>'
    + '</label></div>'
    + '<div class=\'accordion-item-content\'><div class=\'content-block\' id=\'lvl1texts' + ids[key] + '\'><p>loading data...</p></div></div>'
    + ' <div class=\'swipeout-actions-right\' style=\'display:none;\'><a href=\'#\' class=\'lvl3remove bg-red ripple\'>Remove</a></div></li>');
  });
  $('<ul/>', {
    'class': 'speaker-list',
    html: items.join('')
  }).appendTo('#speakerlist');
  lvl1texts();
};

function lvl3checksave() {
  if ($('input:checked').map(function () {
    return this.value;
  }).get().length > 0) {
    $$('#lvl3save').removeClass('disabled');
    lvl3items();

  } else {
    $$('#lvl3save').addClass('disabled');
    lvl3items();
  };
};

function lvl3items(){
	$('#groupitems').empty();
    	var items = $('input:checked').parent('label').find('.item-title');
	$.each(items, function () {
	var text=$(this).text();
	var li='<li>'+text+'</li>'
	$('#groupitems').append( li );
    });
}

function lvl3done(){
  $('#lvl3done').addClass('disabled');
  if( aggNum < aggs.length - 1 ) {var btntext='Next Group'}
  if( aggNum >= aggs.length - 1 ) {var btntext='Next Play'} 
  var agents = $('input:checked').map(function () {return this.value;}).get().join(';');
  $.getJSON('https://personae.gcdh.de/ajax/lvl3done.xql', {
    agg: aggs[aggNum],
    uuid: uuid,
    num: id,
    agents: agents
  }).done(function (data) {
    $('#uscore').html(data.score);
    plays.addNotification({
      message: 'Current Score: ' + data.score + 'points',
      button: {
        text: btntext
      },
      onClose: function () {
        $('#lvl3done').addClass('disabled');
        if( aggNum < aggs.length - 1 ) {lvl3next();}
        if( aggNum >= aggs.length - 1 ) {lvl3prepare(); aggNum=0; lvl3get();}
      }
    });
	testlevellist(data.level);
  });
}

function lvl3skip(){
$.getJSON('https://personae.gcdh.de/ajax/lvl3aggskipped.xql', {
    agg: aggs[aggNum],
    uuid: uuid,
    num: id
  }).done(function() {
      if( aggNum < aggs.length - 1 ) {lvl3next();}
      if( aggNum >= aggs.length - 1 ) {lvl3prepare(); aggNum=0; lvl3get();}
  });
}

function lvl3prepare(){
  $('#lvl3group').empty();
  $('input:checkbox').removeAttr('checked');
  $('.group0').removeClass('group0');
  $('#groupitems').empty();
};

function lvl3next(){
lvl3prepare();
aggNum++;
lvl3go(aggNum);
}

///////////////
//  LEVEL 4  //
///////////////
$$(document).on('pageInit', '.page[data-page="level4"]', function (e) {
  lvl4get();
});

function lvl4check(){
  $('.gender').change(function () {
    var t=$(this);
    var val=$(this).find('input[type="radio"]:checked:enabled').attr('value');
    if(val === '0'){lvl4rmClass(t); $(this).addClass('female')}
    else if(val === '1'){lvl4rmClass(t); $(this).addClass('male')}
    else if(val === '2'){lvl4rmClass(t); $(this).addClass('unknown'); $(this).find('li.lvl4switch').slideDown(); }
    if($('input[type=radio]:checked').length === $('.gender').length){ $('#lvl4save').removeClass('disabled'); }
    else { $('#lvl4save').addClass('disabled'); }
  });
};
function lvl4rmClass(t){
if(t.hasClass('female')){t.removeClass('female')}
if(t.hasClass('male')){t.removeClass('male')}
if(t.hasClass('unknown')){t.removeClass('unknown');  $(t).find('li.lvl4switch').slideUp();}
};

function lvl4get(){
  $.getJSON('https://personae.gcdh.de/ajax/level4.xql', {
    uuid: uuid,
  }).done(function(data) {
    $('#title').append(data.title);
    $('#author').append(data.author);
    id=data.id;
    lvl4list(data);
  });
};

function lvl4list(data){
  $('#speakerlist').empty();
    var items = [];
    $.each(data.speaker, function (key, val) {
      items.push("<div class='list-block gender'>"
        + "<div class='content-block-title' id='"+ data.ids[key] +"'>"+ val + "</div>"
        + "<ul>"
        + "<li><label class='label-radio item-content no-ripple'>"
        + "<input type='radio' name='id"+ data.ids[key] +"-radio' value='0' data-id='"+ data.ids[key] +"'>"
        + "<div class='item-media'><i class='icon icon-form-radio'></i></div>"
        + "<div class='item-inner'><div class='item-title'>female</div></div>"
        + "</label></li>"
        + "<li><label class='label-radio item-content no-ripple'>"
        + "<input type='radio' name='id"+ data.ids[key] +"-radio' value='1' data-id='"+ data.ids[key] +"'>"
        + "<div class='item-media'><i class='icon icon-form-radio'></i></div>"
        + "<div class='item-inner'><div class='item-title'>male</div></div>"
        + "</label></li>"
        + "<li><label class='label-radio item-content no-ripple'>"
        + "<input type='radio' name='id"+ data.ids[key] +"-radio' value='2' data-id='"+ data.ids[key] +"'>"
        + "<div class='item-media'><i class='icon icon-form-radio'></i></div>"
        + "<div class='item-inner'><div class='item-title'>unknown</div></div>"
        + "</label></li>"
        + "<li class='lvl4switch' style='display:none;'><div class='item-content'><div class='item-inner'><div class='item-input' style='width: 50px;'>"
        + "<label class='label-switch'><input type='checkbox' data-id='"+ data.ids[key] +"'><div class='checkbox'></div></label>"
        + "</div><div class='item-title label' style='width: 85.5%;'>is a human</div></div></div></li>"
        + "</ul></div>"
        );
    });
    $('<div/>', {
    'class': 'speaker-list',
    html: items.join('')
  }).appendTo('#speakerlist');
    $$('.lvl4switch').on('click', function(){ $(this).find('input').prop("checked", !$(this).find('input').prop("checked"));  })
    lvl4check();
};
function lvl4done(){
  var female=$('input[type=radio][value=0]:checked').map( function(){return $(this).attr('data-id')} ).get().join(';');
  var male=$('input[type=radio][value=1]:checked').map( function(){return $(this).attr('data-id')} ).get().join(';');
  var unknown=$('input[type=radio][value=2]:checked').map( function(){return $(this).attr('data-id')} ).get().join(';');
  var human=$('input[type=checkbox]:checked').map( function(){return $(this).attr('data-id')} ).get().join(';');
  $.getJSON('https://personae.gcdh.de/ajax/lvl4done.xql', {
    uuid: uuid,
    num: id,
    f: female,
    m: male,
    u: unknown,
    h: human
  }).done(function(data) {
    plays.addNotification({
      message: 'Current Score: ' + data.score + 'points',
      button: {
        text: 'Next'
      },
      onClose: function () {
	lvl4next();
      }
    });
      
  });
};
function lvl4next() {
        $('#lvl4save').addClass('disabled');
        $('#title').empty();
        $('#author').empty();
        lvl4get();
};
