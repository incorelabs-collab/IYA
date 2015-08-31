var app = {
    requestStatus: [],
    imgDir: {},
    backLog: [],
    backURL: "",
    db: {},
    imgDb: {},
    secondAdTimeout: null,
    thirdAdTimeout: null,
    getAppDb: function() {
        if(localStorage.getItem('dbLocalVersion') == null) {
            localStorage.setItem('dbLocalVersion','-1');
        }
        return openDatabase('dbIYA', localStorage.getItem('dbLocalVersion'), 'dbIYA', (5 * 1022 * 1022));
    },
    getImgDb: function() {
        if(localStorage.getItem('imgDbLocalVersion') == null) {
            localStorage.setItem('imgDbLocalVersion','-1');
        }
        return openDatabase('imgDbIYA', localStorage.getItem('imgDbLocalVersion'), 'imgDbIYA', (5 * 1022 * 1022));
    },
    initialize: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.db = app.getAppDb();
        app.imgDb = app.getImgDb();
        navigator.splashscreen.show();
        if(localStorage.getItem("secondAdImg") != null) {
            var imgDir = localStorage.getItem("imgDir");
            $("body").append("<img src='"+imgDir+JSON.parse(localStorage.getItem("secondAdImg")).url+"' id='second_splash' onclick='app.showAdPopup(0)'/>");
            app.secondAdTimeout = setTimeout(function () {
                navigator.splashscreen.hide();
                if(localStorage.getItem("thirdAdImg") != null) {
                    $("body").append("<img src='"+imgDir+JSON.parse(localStorage.getItem("thirdAdImg")).url+"' id='third_splash' onclick='app.showAdPopup(1)' />");
                    setTimeout(function () {
                        $('#second_splash').remove();
                    }, 1500);
                    app.thirdAdTimeout = setTimeout(function () {
                        $('#third_splash').remove();
                    }, 3500);
                } else {
                    $('#second_splash').remove();
                }
            }, 5500);
        }
        document.addEventListener('backbutton', app.onBackKeyDown, false);
        localStorage.removeItem("openModal");
        localStorage.removeItem('backLog');
        $('#app').toggleClass('hidden');            // Hides the app div.
        $('#loading').toggleClass('hidden');        // Shows the loading screen.
        setTimeout(function() {
            navigator.splashscreen.hide();
        }, 3000);
        if(app.imgDb.version == -1) {
            app.imgDb.transaction(function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS profile_pic (filename TEXT NOT NULL, timestamp TEXT NOT NULL)",[],
                    function (tx, r) {
                        app.dbChangeVersion(1, localStorage.getItem('imgDbLocalVersion'), "1");
                    },
                    app.dbQueryError
                );
            });
        }
        localStorage.setItem("hitImageServer",false);
        localStorage.setItem("hitFooterAdServer",false);
        localStorage.setItem("hitSecondAdServer",false);
        localStorage.setItem("hitThirdAdServer",false);
        localStorage.setItem("hitFbPageLinkServer",false);
        app.checkConnection();
    },
    checkConnection: function () {
        if(app.isConnectionAvailable()) {
            app.doOnlineTasks();
        } else {
            app.doOfflineTasks();
        }
    },
    doOnlineTasks: function() {
        var urlData = 'http://iya.incorelabs.com/db_version.php';
        if(localStorage.getItem('dbLocalVersion') == -1) {
            $.getJSON(urlData).done(app.checkWithLocalDB);
        } else {
            var request = $.ajax({
                dataType: "json",
                url: urlData,
                timeout: 4000
            });
            request.done(app.checkWithLocalDB);
            request.fail(function(jqXHR, textStatus) {
                // Internet BUT Cannot Connect to server, hence Timeout.
                if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                    app.displayPage("login.html");
                } else {
                    app.displayPage("home.html");
                }
                $('#loading').toggleClass('hidden');        // Hides the loading screen.
                $('#app').toggleClass('hidden');            // Shows the app div.
            });
        }
    },
    checkWithLocalDB: function(json) {
        if (localStorage.getItem("dbLocalVersion") != json[0][0]) {
            // TODO :: Change the parameters to the $.getJSON methods. That is, the resultant callbacks.

            // TODO :: If the request to the server takes more than 5 seconds. Tell the user the network is slow.

            $('#app').empty();                          // Removes everything from the app div.

            localStorage.setItem('dbCurrentOnline',json[0][0]);

            app.requestStatus = [false, false, false, false, false, false, false, false, false, false, false];

            $.getJSON('http://iya.incorelabs.com/users.php', function(userData) {
                app.createTable(userData,"users",0);
            });
            $.getJSON('http://iya.incorelabs.com/male.php', function(maleData) {
                app.createTable(maleData,"male",1);
            });
            $.getJSON('http://iya.incorelabs.com/female.php', function(femaleData) {
                app.createTable(femaleData,"female",2);
            });
            $.getJSON('http://iya.incorelabs.com/common.php', function(commonData) {
                app.createTable(commonData,"common",3);
            });
            $.getJSON('http://iya.incorelabs.com/kids.php', function(kidsData) {
                app.createTable(kidsData,"kids",4);
            });
            $.getJSON('http://iya.incorelabs.com/directors.php', function(directorsData) {
                app.createTable(directorsData,"directors",5);
            });
            $.getJSON('http://iya.incorelabs.com/events.php', function(eventsData) {
                app.createTable(eventsData,"events",6);
            });
            $.getJSON('http://iya.incorelabs.com/pastLeaders/past_presidents.php', function(pastPresidentsData) {
                app.createTable(pastPresidentsData,"past_presidents",7);
            });
            $.getJSON('http://iya.incorelabs.com/pastLeaders/past_secretaries.php', function(pastSecretariesData) {
                app.createTable(pastSecretariesData,"past_secretaries",8);
            });
            $.getJSON('http://iya.incorelabs.com/pastLeaders/past_chairmen.php', function(pastChairmenData) {
                app.createTable(pastChairmenData,"past_chairmen",9);
            });
            $.getJSON('http://iya.incorelabs.com/pastLeaders/past_treasurers.php', function(pastTreasurersData) {
                app.createTable(pastTreasurersData,"past_treasurers",10);
            });
            
        } else {
            // Internet BUT Data is Up to Date.
            app.getFbLink();
            app.getImageAssets();
            app.getFooterAd();
            app.getSecondAd();
            app.getThirdAd();
            if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                app.displayPage("login.html");
            } else {
                app.displayPage("home.html");
            }
            $('#loading').toggleClass('hidden');        // Hides the loading screen.
            $('#app').toggleClass('hidden');            // Shows the app div.
        }
    },
    getFbLink: function () {
        var linkUrl = "http://iya.incorelabs.com/social/fb.php";
        if(app.getBoolean(localStorage.getItem("hitFbPageLinkServer")) != true){
            // Once per app server hit.
            $.getJSON(linkUrl).done(function(res) {
                if(res.link != null) {
                    var fbPageLink = {link:res.link};
                    localStorage.setItem("fbPageLink",JSON.stringify(fbPageLink));
                } else {
                    localStorage.removeItem("fbPageLink");
                }
                localStorage.setItem("hitFbPageLinkServer",true);
            });
        }
    },
    getImageAssets: function () {
        var urlImages = 'http://iya.incorelabs.com/images/file-list.php?key=kamlesh';
        var dirReference = app.getDirectoryReference();
        dirReference.done(function(imgDir) {
            app.imgDir = imgDir;
            if(app.getBoolean(localStorage.getItem("hitImageServer")) != true){
                // Once per app server hit.
                $.getJSON(urlImages).done(function(res) {
                    if(app.getBoolean(localStorage.getItem("appFirstRun")) != true) {
                        for(var i=0, len=res.length; i<len; i++) {
                            app.fetchNewAssets(res[i].url, res[i].url.split("/").pop(), res[i].timestamp.toString());
                        }
                        localStorage.setItem("appFirstRun", true);
                    }
                    else {
                        for(var i=0, len=res.length; i<len; i++) {
                            (function (i) {
                                app.imgDb.transaction(function (tx) {
                                    tx.executeSql("SELECT timestamp FROM profile_pic WHERE filename = '"+res[i].url.split("/").pop()+"'", [],
                                        function (tx, r) {
                                            if(r.rows.length === 0) {
                                                // The file does not exist, it is a new file.
                                                app.fetchNewAssets(res[i].url, res[i].url.split("/").pop(), res[i].timestamp.toString());
                                            } else {
                                                // The file exists. Now check if timestamp is mismatch.
                                                // If mismatch Download new file and update the db.
                                                if(r.rows.item(0).timestamp != res[i].timestamp) {
                                                    app.fetchUpdatedAssets(res[i].url, res[i].url.split("/").pop(), res[i].timestamp.toString());
                                                }
                                            }
                                        },
                                        app.dbQueryError
                                    );
                                });
                            })(i);
                        }
                    }
                    localStorage.setItem("hitImageServer",true);
                });
            }
        });
    },
    getFooterAd: function() {
        var urlImages = 'http://iya.incorelabs.com/ads/file-list.php?key=kamlesh';
        var dirReference = app.getDirectoryReference();
        dirReference.done(function(imgDir) {
            app.imgDir = imgDir;
            if(app.getBoolean(localStorage.getItem("hitFooterAdServer")) != true){
                // Once per app server hit.
                $.getJSON(urlImages).done(function(res) {
                    if(res[0].noAd == true) {
                        localStorage.removeItem("footerAdImg");
                        localStorage.setItem("hitFooterAdServer",true);
                        return;
                    }
                    if(localStorage.getItem("footerAdImg") == null) {
                        app.fetchFooterAd(res[0].url, res[0].url.split("/").pop(), res[0].timestamp.toString(), res[0].call, res[0].link);
                    } else {
                        if(JSON.parse(localStorage.getItem("footerAdImg")).timestamp != res[0].timestamp) {
                            app.fetchFooterAd(res[0].url, res[0].url.split("/").pop(), res[0].timestamp.toString(), res[0].call, res[0].link);
                        } else {
                            var footerAdImg = {url:res[0].url.split("/").pop(), timestamp:res[0].timestamp.toString(), call:res[0].call, link:res[0].link};
                            localStorage.setItem("footerAdImg",JSON.stringify(footerAdImg));
                        }
                    }
                    localStorage.setItem("hitFooterAdServer",true);
                });
            }
        });
    },
    getSecondAd: function() {
        var urlImages = 'http://iya.incorelabs.com/adTwo/file-list.php?key=kamlesh';
        var dirReference = app.getDirectoryReference();
        dirReference.done(function(imgDir) {
            app.imgDir = imgDir;
            if(app.getBoolean(localStorage.getItem("hitSecondAdServer")) != true){
                // Once per app server hit.
                $.getJSON(urlImages).done(function(res) {
                    if(res[0].noAd == true) {
                        localStorage.removeItem("secondAdImg");
                        localStorage.setItem("hitSecondAdServer",true);
                        return;
                    }
                    if(localStorage.getItem("secondAdImg") == null) {
                        app.fetchSecondAd(res[0].url, res[0].url.split("/").pop(), res[0].timestamp.toString(), res[0].call, res[0].link);
                    } else {
                        if(JSON.parse(localStorage.getItem("secondAdImg")).timestamp != res[0].timestamp) {
                            app.fetchSecondAd(res[0].url, res[0].url.split("/").pop(), res[0].timestamp.toString(), res[0].call, res[0].link);
                        } else {
                            var secondAdImg = {url:res[0].url.split("/").pop(), timestamp:res[0].timestamp.toString(), call:res[0].call, link:res[0].link};
                            localStorage.setItem("secondAdImg",JSON.stringify(secondAdImg));
                        }
                    }
                    localStorage.setItem("hitSecondAdServer",true);
                });
            }
        });
    },
    getThirdAd: function() {
        var urlImages = 'http://iya.incorelabs.com/adThree/file-list.php?key=kamlesh';
        var dirReference = app.getDirectoryReference();
        dirReference.done(function(imgDir) {
            app.imgDir = imgDir;
            if(app.getBoolean(localStorage.getItem("hitThirdAdServer")) != true){
                // Once per app server hit.
                $.getJSON(urlImages).done(function(res) {
                    if(res[0].noAd == true) {
                        localStorage.removeItem("thirdAdImg");
                        localStorage.setItem("hitThirdAdServer",true);
                        return;
                    }
                    if(localStorage.getItem("thirdAdImg") == null) {
                        app.fetchThirdAd(res[0].url, res[0].url.split("/").pop(), res[0].timestamp.toString(), res[0].call, res[0].link);
                    } else {
                        if(JSON.parse(localStorage.getItem("thirdAdImg")).timestamp != res[0].timestamp) {
                            app.fetchThirdAd(res[0].url, res[0].url.split("/").pop(), res[0].timestamp.toString(), res[0].call, res[0].link);
                        }  else {
                            var thirdAdImg = {url:res[0].url.split("/").pop(), timestamp:res[0].timestamp.toString(), call:res[0].call, link:res[0].link};
                            localStorage.setItem("thirdAdImg",JSON.stringify(thirdAdImg));
                        }
                    }
                    localStorage.setItem("hitThirdAdServer",true);
                });
            }
        });
    },
    doOfflineTasks: function() {
        if(localStorage.getItem('dbLocalVersion') == -1) {
            // NO Internet NO Data.
            if($('#second_splash').length) {
                setTimeout(function () {
                    navigator.notification.confirm("You don't have a working internet connection.", app.onOfflineConfirm, 'Offline', ['Try Again','Exit']);
                }, 5500);
            } else if($('#third_splash').length) {
                setTimeout(function () {
                    navigator.notification.confirm("You don't have a working internet connection.", app.onOfflineConfirm, 'Offline', ['Try Again','Exit']);
                }, 8500);
            } else {
                navigator.notification.confirm("You don't have a working internet connection.", app.onOfflineConfirm, 'Offline', ['Try Again','Exit']);
            }
        } else {
            // No Internet BUT Data is there.
            if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                app.displayPage("login.html");
            } else {
                app.displayPage("home.html");
            }
            $('#loading').toggleClass('hidden');        // Hides the loading screen.
            $('#app').toggleClass('hidden');            // Shows the app div.
        }
        var dirReference = app.getDirectoryReference();
        dirReference.done(function(imgDir) {
            app.imgDir = imgDir;
        });
    },
    isConnectionAvailable: function() {
        return navigator.connection.type === Connection.NONE ? false : true;
    },
    createTable: function (data, tableName, index) {
        data = data.split("&#");
        app.db.transaction(function (tx) {
            tx.executeSql("DROP TABLE IF EXISTS "+tableName,[]);
            tx.executeSql(data[0], []);
            for(var i=1;i<data.length;i++) {
                tx.executeSql(data[i], []);
            }
            app.requestStatus[index] = true;
            if(app.requestStatus.every(app.validateRequest)) {
                app.getFbLink();
                app.getImageAssets();
                app.getFooterAd();
                app.getSecondAd();
                app.getThirdAd();
                app.dbChangeVersion(0, localStorage.getItem('dbLocalVersion'), localStorage.getItem('dbCurrentOnline'));
                if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                    app.displayPage("login.html");
                } else {
                    app.displayPage("home.html");
                }
                $('#loading').toggleClass('hidden');        // hides the loading screen again
                $('#app').toggleClass('hidden');            // Show the app div now after data has loaded.
            }
        },app.dbTxError);
    },
    getDirectoryReference: function () {
        var def = $.Deferred();
        var dirEntry = window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(rootDir) {
            rootDir.getDirectory("assets/", {create:true}, function(subDir) {
                localStorage.setItem("imgDir",subDir.toURL());
                def.resolve(subDir);
            }, app.fileSystemError);
        }, app.fileSystemError);
        return def.promise();
    },
    fetchNewAssets: function(url, filename, timestamp) {
        var localFileURL = app.imgDir.toURL() + filename;
        var ft = new FileTransfer();
        ft.download(url, localFileURL,
            function(entry) {
                app.imgDb.transaction(function (tx) {
                    tx.executeSql("INSERT INTO profile_pic (filename, timestamp) VALUES (?, ?)", [filename, timestamp]);
                });
            },
            app.fileSystemError
        );
    },
    fetchUpdatedAssets: function(url, filename, timestamp) {
        var localFileURL = app.imgDir.toURL() + filename;
        var ft = new FileTransfer();
        ft.download(url, localFileURL,
            function(entry) {
                app.imgDb.transaction(function (tx) {
                    tx.executeSql("UPDATE profile_pic SET timestamp = "+timestamp+" WHERE filename = '"+filename+"'", []);
                });
            },
            app.fileSystemError
        );
    },
    fetchFooterAd: function(url, filename, timestamp, call, link) {
        var localFileURL = app.imgDir.toURL() + filename;
        var ft = new FileTransfer();
        ft.download(url, localFileURL,
            function(entry) {
                var footerAdImg = {url:filename, timestamp:timestamp, call: call, link: link};
                localStorage.setItem("footerAdImg",JSON.stringify(footerAdImg));
            },
            app.fileSystemError
        );
    },
    fetchSecondAd: function(url, filename, timestamp, call, link) {
        var localFileURL = app.imgDir.toURL() + filename;
        var ft = new FileTransfer();
        ft.download(url, localFileURL,
            function(entry) {
                var secondAdImg = {url:filename, timestamp:timestamp, call: call, link: link};
                localStorage.setItem("secondAdImg",JSON.stringify(secondAdImg));
            },
            app.fileSystemError
        );
    },
    fetchThirdAd: function(url, filename, timestamp, call, link) {
        var localFileURL = app.imgDir.toURL() + filename;
        var ft = new FileTransfer();
        ft.download(url, localFileURL,
            function(entry) {
                var thirdAdImg = {url:filename, timestamp:timestamp, call: call, link: link};
                localStorage.setItem("thirdAdImg",JSON.stringify(thirdAdImg));
            },
            app.fileSystemError
        );
    },
    fileSystemError: function(e) {
    },
    dbChangeVersion: function(typeOfDb, dbOldVersion, dbUpdatedVersion) {
        try {
            switch(typeOfDb)
            {
                case 0:
                    app.db.changeVersion(dbOldVersion, dbUpdatedVersion, app.dbChangeVersionTx, app.dbChangeVersionError, app.dbChangeVersionSuccess(typeOfDb, dbUpdatedVersion));
                    break;

                case 1:
                    app.imgDb.changeVersion(dbOldVersion, dbUpdatedVersion, app.dbChangeVersionTx, app.dbChangeVersionError, app.dbChangeVersionSuccess(typeOfDb, dbUpdatedVersion));
                    break;
            }
        } catch(e) {
            navigator.notification.alert("An error occurred while updating the app data.", app.alertDismissed, "Update Failed", "Dismiss");
        }
    },
    dbChangeVersionTx: function(tx) {},
    dbChangeVersionError: function(error) {
        navigator.notification.alert("An error occurred while updating the app data.", app.alertDismissed, "Update Failed", "Dismiss");
        return true;
    },
    dbChangeVersionSuccess: function(typeOfDb, dbUpdatedVersion) {
        switch (typeOfDb) {
            case 0:
                localStorage.setItem('dbLocalVersion', dbUpdatedVersion);
                break;
            case 1:
                localStorage.setItem('imgDbLocalVersion', dbUpdatedVersion);
                break;
        }
    },
    dbTxError: function (error) {
    },
    dbQueryError: function(tx, error) {
    },
    validateRequest: function(element, index, array) {
        return (element == true);
    },
    getBoolean: function(boolString) {
        return ((boolString == "true") ? true : false);
    },
    setCurrentPage: function(url) {
        localStorage.setItem("currentPage", url);
    },
    getCurrentPage: function() {
        return localStorage.getItem("currentPage");
    },
    setBackPage: function(url) {
        if(localStorage.getItem("backLog") == null) {
            localStorage.setItem("backLog",url);
        }
        else {
            app.backLog = localStorage.getItem("backLog").split(",");
            app.backLog.push(url);
            localStorage.setItem("backLog", app.backLog.toString());
            app.backLog = [];
        }
    },
    getBackPage: function() {
        if(localStorage.getItem("backLog") != null) {
            app.backLog = localStorage.getItem("backLog").split(",");
            app.backURL = app.backLog.pop();
            if(app.backLog.length > 0) {
                localStorage.setItem("backLog", app.backLog);
            }
            else {
                localStorage.removeItem("backLog");
            }
        }
        else {
            app.backURL = "";
        }
        return app.backURL;
    },
    displayPage: function(url) {
        $("#app").empty();
        $.get(url, function(data) {
            $("#app").html(data);
        });
    },
    alertDismissed: function() {
    },
    onBackKeyDown: function() {
        $(".popover").remove();
        $('body').removeClass();
        if(localStorage.getItem("openModal") != null) {
            $(localStorage.getItem("openModal")).modal('hide');
            localStorage.removeItem("openModal");
            return;
        }
        var url = app.getBackPage();
        if(url != "") {
            app.displayPage(url);
        } else {
            navigator.notification.confirm('Do you want to exit ?', app.onConfirm, 'Confirmation', ['Yes','No']);
        }
    },
    onConfirm: function(buttonIndex) {
      if(buttonIndex == 1) {
            navigator.app.exitApp();
        } else {
            return;
        }
    },
    onOfflineConfirm: function(buttonIndex) {
        if(buttonIndex == 2) {
            navigator.app.exitApp();
        } else if(buttonIndex == 1) {
            app.checkConnection();
        } else {
            navigator.notification.confirm("You don't have a working internet connection.", app.onOfflineConfirm, 'Offline', ['Try Again','Exit']);
        }
    },
    showAdPopup: function(adId) {
        var adImg = app.getAdObject(adId);
        if(adImg.call != null && adImg.link != null) {
            app.stopTimers(adId);
            navigator.notification.confirm("You could do any of the following.", app.onBothNotNullConfirm, "What Next?", ['Call', 'Website', 'Cancel']);
        } else if(adImg.call != null) {
            app.stopTimers(adId);
            navigator.notification.confirm("You could do any of the following.", app.onCallNotNullConfirm, "What Next?", ['Call', 'Cancel']);
        } else if(adImg.link != null) {
            app.stopTimers(adId);
            navigator.notification.confirm("You could do any of the following.", app.onLinkNotNullConfirm, "What Next?", ['Website', 'Cancel']);
        }
    },
    getAdObject: function (adId) {
        switch (adId) {
            case 0:
                return JSON.parse(localStorage.getItem("secondAdImg"));
            case 1:
                return JSON.parse(localStorage.getItem("thirdAdImg"));
        }
    },
    getAdName: function () {
        switch (localStorage.getItem('adId')) {
            case '0':
                return "secondAdImg";
            case '1':
                return "thirdAdImg";
        }
    },
    stopTimers: function (adId) {
        localStorage.setItem('adId', adId);
        switch (adId) {
            case 0:
                clearTimeout(app.secondAdTimeout);
                break;
            case 1:
                clearTimeout(app.thirdAdTimeout);
                $('#second_splash').remove();
                break;
        }
    },
    onBothNotNullConfirm: function(buttonIndex) {
        if (buttonIndex == 1) {
            window.location = "tel:"+JSON.parse(localStorage.getItem(app.getAdName())).call;
        } else if (buttonIndex == 2) {
            window.open(JSON.parse(localStorage.getItem(app.getAdName())).link, "_system");
        }
        app.resumeAd();
    },
    onCallNotNullConfirm: function(buttonIndex) {
        if (buttonIndex == 1) {
            window.location = "tel:"+JSON.parse(localStorage.getItem(app.getAdName())).call;
        }
        app.resumeAd();
    },
    onLinkNotNullConfirm: function(buttonIndex) {
        if (buttonIndex == 1) {
            window.open(JSON.parse(localStorage.getItem(app.getAdName())).link, "_system");
        }
        app.resumeAd();
    },
    resumeAd: function() {
        var adId = localStorage.getItem('adId');
        if(adId == 0) {
            if(localStorage.getItem("thirdAdImg") != null) {
                var imgDir = localStorage.getItem("imgDir");
                $("body").append("<img src='"+imgDir+JSON.parse(localStorage.getItem("thirdAdImg")).url+"' id='third_splash' onclick='app.showAdPopup(1)' />");
                setTimeout(function () {
                    $('#second_splash').remove();
                }, 1500);
                app.thirdAdTimeout = setTimeout(function () {
                    $('#third_splash').remove();
                }, 3500);
            } else {
                $('#second_splash').remove();
            }
        } else if (adId == 1) {
            $('#third_splash').remove();
        }
    },
    getMonth: function (month) {
        var monthName = null;
        month = parseInt(month);
        switch (month) {
            case 1:
                monthName = "January";
                break;
            case 2:
                monthName = "February";
                break;
            case 3:
                monthName = "March";
                break;
            case 4:
                monthName = "April";
                break;
            case 5:
                monthName = "May";
                break;
            case 6:
                monthName = "June";
                break;
            case 7:
                monthName = "July";
                break;
            case 8:
                monthName = "August";
                break;
            case 9:
                monthName = "September";
                break;
            case 10:
                monthName = "October";
                break;
            case 11:
                monthName = "November";
                break;
            case 12:
                monthName = "December";
                break;
        }
        return monthName;
    }
};

app.initialize();