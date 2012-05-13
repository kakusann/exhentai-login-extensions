function buttonUpdate(s) {
	$('#loginBtn').val(s);
}

function blockButton() {
	$('#loginBtn').attr("disabled", "disabled");
}

function unblockButton() {
	$('#loginBtn').removeAttr("disabled");
}

function errorUpdate(s) {
	$('#errorResult').text(s);
}

function enableError() {
	$('#errorResult').css('display', 'block');
}

function disableError() {
	$('#errorResult').css('display', 'none');
}
	
function saveData() {
	if($('#saveLogin').is(':checked')) {
		localStorage.setItem('exh_user', $('#usernameInput').val());
		localStorage.setItem('exh_pass', $('#passwordInput').val());
		localStorage.setItem('exh_sddd', '1');
	} else {
		localStorage.removeItem('exh_user');
		localStorage.removeItem('exh_pass');
		localStorage.removeItem('exh_sddd');
	}
}

function loadData() {
	var loadSaved = localStorage.getItem('exh_sddd');
	
	if(loadSaved == '1') {
		$('#saveLogin').attr('checked', 'checked');
	} else {
		return; // We're not reviving!
	}
	
	var savedUser = localStorage.getItem('exh_user');
	var savedPass = localStorage.getItem('exh_pass');
	
	if(savedUser != null && savedPass != null) {
		$('#usernameInput').val(savedUser);
		$('#passwordInput').val(savedPass);
	}
}

function handleLoginClick() {
	var username = $('#usernameInput').val();
	var password = $('#passwordInput').val();
	
	if(username.length == 0 || password.length == 0) {
		errorUpdate('Username and Password required!');
		enableError();
		unblockButton();
		buttonUpdate('Login to ExHentai');
	} else {
		$.post('https://forums.e-hentai.org/index.php?act=Login&CODE=01', 
			'referer=https://forums.e-hentai.org/index.php&UserName=' + username + '&PassWord=' + password + '&CookieDate=1', function(x) {
			if(x.indexOf('Username or password incorrect') != -1) {
				errorUpdate('Login fail.');
				enableError();
				unblockButton();
				buttonUpdate('Login to ExHentai');
			} else if(x.indexOf('You are now logged in as:') != -1) {
				chrome.cookies.getAll({domain:'.e-hentai.org'}, function(got) {
					for(var i = 0; i < got.length; i++) {
						if(got[i].name.indexOf('ipb_') != -1 || got[i].name.indexOf('uconfig') != -1) {
							chrome.cookies.set({url:'http://exhentai.org/', domain:'.exhentai.org', name:got[i].name, path:'/', value:got[i].value});
						}
					}
				});
				
				buttonUpdate('Login success');
				
				saveData();
			} else {
				errorUpdate('Unknown Error #1');
				enableError();
				unblockButton();
				buttonUpdate('Login to ExHentai');
			}
		}).error(function() {
			errorUpdate('Unknown Error #2');
			enableError();
			unblockButton();
			buttonUpdate('Login to ExHentai');
		});
	}
}

$(document).ready(function() {
	loadData();

	$('#loginBtn').bind('click', function() {
		disableError();
		buttonUpdate('Loading..');
		blockButton();
		handleLoginClick();
	});
});