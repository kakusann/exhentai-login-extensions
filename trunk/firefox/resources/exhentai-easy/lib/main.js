// The main module of the puromonogatari Add-on.
exports.main = function() {
    var data = require("self").data;
    var pageMod = require("page-mod");
    var store = require("simple-storage");
    var request = require("request").Request;
    var notify = require("notifications");

    pageMod.PageMod({
        include: "http://exhentai.org*",
        contentScriptWhen: "end",
        contentScriptFile: [data.url("redirect.js")]
    });
    
    pageMod.PageMod({
        include: "http://exhentai.org/login",
        contentScriptWhen: "end",
        contentScriptFile: [data.url("jquery.js"), data.url("exhentai.js")],
        onAttach: function(worker) {
            // Username Save Stuff
            worker.port.on('giveUsername', function(payload) {worker.port.emit('obtainUsername', store.storage.username);});
            worker.port.on('givePassword', function(payload) {worker.port.emit('obtainPassword', store.storage.password);});
            worker.port.on('saveUsername', function(payload) {store.storage.username = payload;});
            worker.port.on('savePassword', function(payload) {store.storage.password = payload;});
            worker.port.on('deleteLogin', function(payload) {
                delete store.storage.username;
                delete store.storage.password;
            });
            worker.port.on('loginToEH', function(payload) {
                request({
                    url: 'https://forums.e-hentai.org/index.php?act=Login&CODE=01',
                    content: {
                        'referer':'https://forums.e-hentai.org/index.php',
                        'UserName':payload.username,
                        'PassWord':payload.password,
                        'CookieDate':'1'
                    },
                    onComplete: function(r) {
                        worker.port.emit('loginToEHResult', {text:r.text, statusText:r.statusText, headers:r.headers});
                    }
                }).post();
            });
        }
    });
};

/*
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
		});*/