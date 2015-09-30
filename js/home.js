var pageHome = {
    push: PushNotification.init({"android": {"senderID": "941377304309", "icon":"push","iconColor":"grey"}, "ios": {"alert": "true", "badge": "true", "sound": "true"}}),
    changePage: function(url) {
        app.setBackPage("home.html");
        app.displayPage(url);
    },
    launchAlbumsPage: function() {
        if(app.isConnectionAvailable()) {
            if (device.platform == 'android' || device.platform == 'Android') {
                pageHome.gallery_ref = window.open("http://128.199.157.166/iya/gallery/index.php", "_blank","location=no,hidden=yes,zoom=no");
            } else {
                pageHome.gallery_ref = window.open("http://128.199.157.166/iya/gallery/index.php", "_blank","location=no,closebuttoncaption=Close,hidden=yes");
            }
            pageHome.gallery_ref.addEventListener('loadstart', pageHome.galleryLoadStart);
            pageHome.gallery_ref.addEventListener('loaderror', pageHome.galleryLoadError);
            pageHome.gallery_ref.addEventListener('loadstop', pageHome.galleryLoadStop);
            pageHome.gallery_ref.addEventListener('exit', pageHome.galleryExit);
            setTimeout(function() {
                if(localStorage.getItem("galleryLoading") == "true") {
                    localStorage.removeItem("galleryLoading");
                    pageHome.gallery_ref.removeEventListener('loadstart', pageHome.galleryLoadStart);
                    pageHome.gallery_ref.removeEventListener('loaderror', pageHome.galleryLoadError);
                    pageHome.gallery_ref.removeEventListener('loadstop', pageHome.galleryLoadStop);
                    pageHome.gallery_ref.removeEventListener('exit', pageHome.galleryExit);
                    pageHome.gallery_ref.close();
                    pageHome.gallery_error_flag = false;
                    if (device.platform == 'android' || device.platform == 'Android') {
                        window.plugins.spinnerDialog.hide();
                    } else {
                        ProgressIndicator.hide();
                    }
                    navigator.notification.confirm("Would you like to Try Again ?", pageHome.onGalleryConfirm, 'Try Again', ['Retry','Cancel']);
                }
            }, 25000);
        } else {
            navigator.notification.confirm("You don't have a working internet connection.", pageHome.onGalleryConfirm, 'Offline', ['Try Again','Dismiss']);
        }
    },
    launchAdPage: function() {
        var footerAdImg = JSON.parse(localStorage.getItem("footerAdImg"));
        if(footerAdImg.call != null && footerAdImg.link != null) {
            navigator.notification.confirm("You could do any of the following.", pageHome.onBothNotNullConfirm, "What Next?", ['Call', 'Website', 'Cancel']);
        } else if(footerAdImg.call != null) {
            navigator.notification.confirm("You could do any of the following.", pageHome.onCallNotNullConfirm, "What Next?", ['Call', 'Cancel']);
        } else if(footerAdImg.link != null) {
            navigator.notification.confirm("You could do any of the following.", pageHome.onLinkNotNullConfirm, "What Next?", ['Website', 'Cancel']);
        }
    },
    onBothNotNullConfirm: function(buttonIndex) {
        if (buttonIndex == 1) {
            window.location = "tel:"+JSON.parse(localStorage.getItem("footerAdImg")).call;
        } else if (buttonIndex == 2) {
            window.open(JSON.parse(localStorage.getItem("footerAdImg")).link, "_system");
        } else {
            return;
        }
    },
    onCallNotNullConfirm: function(buttonIndex) {
        if (buttonIndex == 1) {
            window.location = "tel:"+JSON.parse(localStorage.getItem("footerAdImg")).call;
        } else {
            return;
        }
    },
    onLinkNotNullConfirm: function(buttonIndex) {
        if (buttonIndex == 1) {
            window.open(JSON.parse(localStorage.getItem("footerAdImg")).link, "_system");
        } else {
            return;
        }
    },
    onGalleryConfirm: function(buttonIndex) {
        if(buttonIndex == 1) {
            pageHome.launchAlbumsPage();
        } else {
            return;
        }
    },
    gallery_ref: {},
    gallery_error_flag: false,
    galleryLoadStart: function(event) {
        localStorage.setItem("galleryLoading",true);
        if (device.platform == 'android' || device.platform == 'Android') {
            window.plugins.spinnerDialog.show("Please Wait", "Loading...", true);
        } else {
            ProgressIndicator.showSimpleWithLabel(true, "Loading...");
        }
    },
    galleryLoadError: function(event) {
        pageHome.gallery_error_flag = true;
    },
    galleryLoadStop: function(event) {
        localStorage.removeItem("galleryLoading");
        if (device.platform == 'android' || device.platform == 'Android') {
            window.plugins.spinnerDialog.hide();
        } else {
            ProgressIndicator.hide();
        }

        pageHome.gallery_ref.removeEventListener('loaderror', pageHome.galleryLoadError);

        if(pageHome.gallery_error_flag) {
            pageHome.gallery_ref.removeEventListener('loadstart', pageHome.galleryLoadStart);
            pageHome.gallery_ref.removeEventListener('loadstop', pageHome.galleryLoadStop);
            pageHome.gallery_ref.removeEventListener('exit', pageHome.galleryExit);
            pageHome.gallery_ref.close();
            pageHome.gallery_error_flag = false;
            navigator.notification.confirm("Would you like to Try Again ?", pageHome.onGalleryConfirm, 'Try Again', ['Retry','Cancel']);

        } else {
            pageHome.gallery_ref.show();
        }
    },
    galleryExit: function(event) {
        pageHome.gallery_ref.removeEventListener('loadstart', pageHome.galleryLoadStart);
        pageHome.gallery_ref.removeEventListener('loadstop', pageHome.galleryLoadStop);
        pageHome.gallery_ref.removeEventListener('exit', pageHome.galleryExit);
    }
}

$(document).ready(function() {
    app.setCurrentPage("home.html");
    if(localStorage.getItem("footerAdImg") != null) {
        var imgDir = localStorage.getItem("imgDir");
        $("#footerAdBlock").append("<img src='"+imgDir+JSON.parse(localStorage.getItem("footerAdImg")).url+"' class='img-responsive' />");
    }
    if(localStorage.getItem("fbPageLink") != null) {
        $("#fbBtn").attr("onclick","window.open('"+JSON.parse(localStorage.getItem("fbPageLink")).link+"', '_system')");
    }

    pageHome.push.on('registration', function(data) {
        console.log(data);
        var deviceType = null;
        if (device.platform == 'android' || device.platform == 'Android')
            deviceType = 0;
        else
            deviceType = 1;

        var pushToken = localStorage.getItem("pushToken");
        if(pushToken == null || pushToken != data.registrationId) {
            $.ajax({
                url: 'http://128.199.157.166/iya/notification/register.php',
                type: 'POST',
                dataType: 'json',
                data: {uid : localStorage.getItem("login_user_id"), regId : data.registrationId, deviceType : deviceType},
                success: function(response) {
                    console.log(response);
                    localStorage.setItem("pushToken", data.registrationId);
                },
                error: function(error) {
                }
            });
        }
    });

    pageHome.push.on('notification', function(data) {
        console.log(data);
        navigator.notification.alert(data.message, app.alertDismissed, data.title, 'Dismiss');
        if(data.additionalData.location)
            pageHome.changePage(data.additionalData.location);
    });

    pageHome.push.on('error', function(e) {
        console.log(e);
        navigator.notification.alert("An ERROR has occurred while setting up PUSH notifications.", app.alertDismissed, "PUSH Notification Error", "Dismiss");
    });
});