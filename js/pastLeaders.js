var pagePastLeaders = {
	getParentPage: function(id) {
        app.setBackPage("pastLeaders.html");
        localStorage.setItem("user_id", id);
        if(id % 2 == 0) {
            localStorage.setItem("user_sex", "F");
        }
        else {
            localStorage.setItem("user_sex", "M");
        }
        app.displayPage("parentInfo.html");
    },
	imgError: function(source) {
        source.src = "img/customer.png";
        $(source).parent().removeClass("col-xs-5");
        $(source).parent().addClass("col-xs-4");
        $(source).parent().next().removeClass("col-xs-7");
        $(source).parent().next().addClass("col-xs-8");
    }
};
$(document).ready(function() {
    app.setCurrentPage("pastLeaders.html");
    var foundersConcatString = "";
    var presidentsConcatString = "";
    var vicePresidentsConcatString = "";
    var secretariesConcatString = "";
    var associateSecretariesConcatString = "";
    var treasurersConcatString = "";
    var imgDir = localStorage.getItem("imgDir");
    app.db.transaction(function (tx) {
        tx.executeSql("SELECT name, member_id FROM founders", [],
            function (tx, r) {
                for(var i =0;i< r.rows.length; i++) {
                    foundersConcatString += "<br/><div class='row pastLeadersBlock'>";
                    if(r.rows.item(i).member_id == null) {
                        foundersConcatString += "<div class='col-xs-4 pastLeadersImgBlock'><img src='img/customer.png' class='img-responsive'></div><div class='col-xs-8 pastLeadersTextBlock'><span class='noLinkMember'>";
                    } else {
                        foundersConcatString += "<div class='col-xs-5 pastLeadersImgBlock'><img src='"+imgDir+r.rows.item(i).member_id+".jpg' class='img-responsive' onerror='pagePastLeaders.imgError(this)'></div><div class='col-xs-7 pastLeadersTextBlock'><a onclick='pagePastLeaders.getParentPage("+r.rows.item(i).member_id+")' class='memberLink'><span>";
                    }
                    foundersConcatString += r.rows.item(i).name+"</span></a></div></div>";
                    $("#pastFoundersData").append(foundersConcatString);
                    foundersConcatString = "";
                }
                foundersConcatString = "";
            }, app.dbQueryError
        );
        tx.executeSql("SELECT year, name, member_id FROM past_presidents", [],
            function (tx, r) {
                for(var i =0;i< r.rows.length; i++) {
                	presidentsConcatString += "<br/><div class='row pastLeadersBlock'>";
                	if(r.rows.item(i).member_id == null) {
                		presidentsConcatString += "<div class='col-xs-4 pastLeadersImgBlock'><img src='img/customer.png' class='img-responsive'></div><div class='col-xs-8'><span class='noLinkMember'>";
                	} else {
                		presidentsConcatString += "<div class='col-xs-5 pastLeadersImgBlock'><img src='"+imgDir+r.rows.item(i).member_id+".jpg' class='img-responsive' onerror='pagePastLeaders.imgError(this)'></div><div class='col-xs-7'><a onclick='pagePastLeaders.getParentPage("+r.rows.item(i).member_id+")' class='memberLink'><span>";
                	}
                	presidentsConcatString += r.rows.item(i).name+"</span></a><br/><span class='tenureLink'>("+r.rows.item(i).year+")</span></div></div>";
                	$("#pastPresidentsData").append(presidentsConcatString);
                	presidentsConcatString = "";
                }
                presidentsConcatString = "";
            }, app.dbQueryError
		);
        tx.executeSql("SELECT year, name, member_id FROM past_vice_presidents", [],
            function (tx, r) {
                for(var i =0;i< r.rows.length; i++) {
                    vicePresidentsConcatString += "<br/><div class='row pastLeadersBlock'>";
                    if(r.rows.item(i).member_id == null) {
                        vicePresidentsConcatString += "<div class='col-xs-4 pastLeadersImgBlock'><img src='img/customer.png' class='img-responsive'></div><div class='col-xs-8'><span class='noLinkMember'>";
                    } else {
                        vicePresidentsConcatString += "<div class='col-xs-5 pastLeadersImgBlock'><img src='"+imgDir+r.rows.item(i).member_id+".jpg' class='img-responsive' onerror='pagePastLeaders.imgError(this)'></div><div class='col-xs-7'><a onclick='pagePastLeaders.getParentPage("+r.rows.item(i).member_id+")' class='memberLink'><span>";
                    }
                    vicePresidentsConcatString += r.rows.item(i).name+"</span></a><br/><span class='tenureLink'>("+r.rows.item(i).year+")</span></div></div>";
                    $("#pastVicePresidentsData").append(vicePresidentsConcatString);
                    vicePresidentsConcatString = "";
                }
                vicePresidentsConcatString = "";
            }, app.dbQueryError
        );
		tx.executeSql("SELECT year, name, member_id FROM past_secretaries", [],
            function (tx, r) {
                for(var i =0;i< r.rows.length; i++) {
                	secretariesConcatString += "<br/><div class='row pastLeadersBlock'>";
                	if(r.rows.item(i).member_id == null) {
                		secretariesConcatString += "<div class='col-xs-4 pastLeadersImgBlock'><img src='img/customer.png' class='img-responsive'></div><div class='col-xs-8'><span class='noLinkMember'>";
                	} else {
                		secretariesConcatString += "<div class='col-xs-5 pastLeadersImgBlock'><img src='"+imgDir+r.rows.item(i).member_id+".jpg' class='img-responsive' onerror='pagePastLeaders.imgError(this)'></div><div class='col-xs-7'><a onclick='pagePastLeaders.getParentPage("+r.rows.item(i).member_id+")' class='memberLink'><span>";
                	}
                	secretariesConcatString += r.rows.item(i).name+"</span></a><br/><span class='tenureLink'>("+r.rows.item(i).year+")</span></div></div>";
                	$("#pastSecretariesData").append(secretariesConcatString);
                	secretariesConcatString = "";
                }
                secretariesConcatString = "";
            }, app.dbQueryError
		);
        tx.executeSql("SELECT year, name, member_id FROM past_ass_secretaries", [],
            function (tx, r) {
                for(var i =0;i< r.rows.length; i++) {
                    associateSecretariesConcatString += "<br/><div class='row pastLeadersBlock'>";
                    if(r.rows.item(i).member_id == null) {
                        associateSecretariesConcatString += "<div class='col-xs-4 pastLeadersImgBlock'><img src='img/customer.png' class='img-responsive'></div><div class='col-xs-8'><span class='noLinkMember'>";
                    } else {
                        associateSecretariesConcatString += "<div class='col-xs-5 pastLeadersImgBlock'><img src='"+imgDir+r.rows.item(i).member_id+".jpg' class='img-responsive' onerror='pagePastLeaders.imgError(this)'></div><div class='col-xs-7'><a onclick='pagePastLeaders.getParentPage("+r.rows.item(i).member_id+")' class='memberLink'><span>";
                    }
                    associateSecretariesConcatString += r.rows.item(i).name+"</span></a><br/><span class='tenureLink'>("+r.rows.item(i).year+")</span></div></div>";
                    $("#pastAssSecretariesData").append(associateSecretariesConcatString);
                    associateSecretariesConcatString = "";
                }
                associateSecretariesConcatString = "";
            }, app.dbQueryError
        );
        tx.executeSql("SELECT year, name, member_id FROM past_treasurers", [],
            function (tx, r) {
                for(var i =0;i< r.rows.length; i++) {
                    treasurersConcatString += "<br/><div class='row pastLeadersBlock'>";
                    if(r.rows.item(i).member_id == null) {
                        treasurersConcatString += "<div class='col-xs-4 pastLeadersImgBlock'><img src='img/customer.png' class='img-responsive'></div><div class='col-xs-8'><span class='noLinkMember'>";
                    } else {
                        treasurersConcatString += "<div class='col-xs-5 pastLeadersImgBlock'><img src='"+imgDir+r.rows.item(i).member_id+".jpg' class='img-responsive' onerror='pagePastLeaders.imgError(this)'></div><div class='col-xs-7'><a onclick='pagePastLeaders.getParentPage("+r.rows.item(i).member_id+")' class='memberLink'><span>";
                    }
                    treasurersConcatString += r.rows.item(i).name+"</span></a><br/><span class='tenureLink'>("+r.rows.item(i).year+")</span></div></div>";
                    $("#pastTreasurersData").append(treasurersConcatString);
                    treasurersConcatString = "";
                }
                treasurersConcatString = "";
            }, app.dbQueryError
        );
    });
});
$('#pastLeadersData').on('shown.bs.collapse', function () {
    $('html, body').animate({scrollTop : 0}, 0);
});