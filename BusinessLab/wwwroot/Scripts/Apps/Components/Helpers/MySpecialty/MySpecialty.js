define(['./Functions/Functions.js'], function (Functions) {
    var Me = {
        Post: null,
        Container: Apps.ActiveDeployment.Debug ? $('#workspaceCanvas') : $('#publishedCanvas'),
        SelectedApp: null,
        Initialize: function (callback) {

            callback();

            Me.Resize();
            $(window).resize(Me.Resize);

        },
        Resize: function () {
            //    let windowWidth = $(window).width();

            //    $('.MySpecialty_AreaHeader').css('width', windowWidth);
        },
        SelectTab: function (tabId, index) {
            //templateTabByProcessContent
        },
        LogPushNotification: function (logappid, uniqueid, goodcount, badcount, uglycount, issuecount) {
            Apps.Notify('info', logappid + ' ' + uniqueid);

            //Wink app thumbnail for every appid call
            let logAppThumbnail = $('#MySpecialty_MiniAppStatus_Good_' + logappid);
            if (logAppThumbnail) {
                logAppThumbnail.css('visibility', 'visible'); // hide();
                setTimeout(function () { logAppThumbnail.css('visibility', 'hidden') }, 200);
            }

            //Show/hide bad if any errors today
            let logAppBad = $('#MySpecialty_MiniAppStatus_Bad_' + logappid);
            if (logAppBad) {
                logAppBad.css('visibility', 'hidden');
                if (badcount > 0)
                    logAppBad.css('visibility', 'visible');
            }
        },
        Show: function () {

            Me.Post = Apps.Components.Common.Data.Posts.Main;

            Me.UI.Templates.Admin_Main.Show();

            Me.UserSettings.RefreshUserSettings();
            //Move sign in/out button to issues header
            $('#Admin_Header_Container')
                .append($('#Auth_SignIn_Button').removeClass('Auth_SignInButton_Class').detach())
                .css('float', 'right');

            //Tab list
            Apps.Tabstrips.Initialize('tabstripAdmin');
            Apps.Tabstrips.SelectCallback = Me.TabstripSelect;
            Apps.Tabstrips.Select('tabstripAdmin', 0);

            var result = new Apps.Result();

            new Promise(function (resolve, reject) {
                Me.Areas.GetData(result);
            })
                .then(
                   Me.LogApps.GetData(result) //We'll be loading individual data async
                )
                .then(
                    Me.Workflows.GetData(result)
                )
                .then(
                    Me.CreateTable(result)
                );
        },
        CreateTable: function (result) {

            result.Success = false; //reset

            var areasTable;
            var workflowsTable;

            try {

                //Apps content
                areasTable = Apps.Bind.GetTable({
                    tableid: 'Areas_Table',
                    data: Me.Areas.Areas,
                    theadbinding: function () {
                        return '<tr><th></th></tr>';
                    },
                    rowbinding: function (row, index) {

                        let areaWorkflowsHtml = '';// Me.Workflows.GetHTML(row.iWorkflowAreaID, result);
                        let areaAppsHtml = Me.LogApps.GetHTML(row.AreaID, result);
                        let areaActionsHtml = Me.LogApps.GetActionsHTML(row.AreaID, result);
                        let visualsHtml = Me.LogApps.GetReportsHTML(row.AreaID, result);

                        let allhtml = Me.UI.Templates.MySpecialty_Areas_Row.HTML([row.AreaName, row.AreaID, areaAppsHtml, areaActionsHtml, visualsHtml, '', areaWorkflowsHtml]);

                        return allhtml;

                    }
                });

                //Workflows content
                workflowsTable = Apps.Bind.GetTable({
                    tableid: 'Workflows_Table',
                    data: Me.Areas.Areas,
                    theadbinding: function () {
                        return '<tr><th></th></tr>';
                    },
                    rowbinding: function (row, index) {

                        let areaWorkflowsHtml = Me.Workflows.GetHTML(row.AreaID, result);
                        let allhtml = Me.UI.Templates.WorkflowsRow.HTML([row.AreaName, row.AreaID, areaWorkflowsHtml]);

                        return allhtml;

                    }
                });

                result.Success = true;
            }
            catch (error) {
                result.AddFail('Exception: ' + error.name + '. ' + error.message);
            }

            if (result.Success) {

                //Apps Tab
                let main = Me.UI.Templates.MySpecialty_Main.HTML();

                $('#Admin_Home').html(main);



                $('#Admin_').addClass('Admin_Home_TabContent_Style');

                $('.MySpecialty_AreaHeader').css('width', '100%');

                Me.RefreshPinFavorites(Me.LogApps.Apps);

                Apps.Tabstrips.Initialize('tabstripLibraryViews');
                Apps.Tabstrips.Select('tabstripLibraryViews', 0);
                Apps.Tabstrips.SelectCallback = Me.SelectTab;

                $('#templateTabByAppContent').html(areasTable[0])
                    .css('border', '3px solid #1961AE')
                    .css('margin-top', '-3px');

                //Workflows Tab

                $('#templateTabByProcessContent').html(workflowsTable[0])
                    .css('border', '3px solid #1961AE')
                    .css('margin-top', '-3px')
                    .css('left', '8px');

            }
            else
                Apps.ShowResult(result);

        },
        RefreshPinFavorites: function () {

            let html = '';
            $('.MySpecialty_Favorites').empty();

            //Get pinned apps
            let pinSettings = Functions.GetPinSettings();

            $.each(pinSettings, function (index, pinsetting) {

                //Get app with the pin setting value having logappid
                let myapps = Enumerable.From(Me.LogApps.Apps).Where(function (a) { return a.iLogAppID.toString() == pinsetting.sSettingValue; }).ToArray();

                if (myapps.length == 1) {

                    let app = myapps[0];

                    if (app.iLogAppTypeID == 1) {

                        //Power App
                        html = Me.UI.Templates.MySpecialty_Favorite_Link.HTML([app.iLogAppID, app.sLogAppName, app.sLogAppURL]);
                        $('.MySpecialty_Favorites').append(html);
                    }
                    else if (app.iLogAppTypeID == 3) {

                        //Report
                        if (app.iReportID > 0) {

                            Functions.GetReport(app.iReportID, function (report) {
                                //html = Me.UI.Templates.MySpecialty_Favorite_Report.HTML([app.iLogAppID, report.sReportName, report.sReportDescription, reportHtml, report.iReportID, escape(JSON.stringify(app))]);
                                html = Me.UI.Templates.MySpecialty_Favorite_Report.HTML([app.iLogAppID, report.sReportName, report.sReportDescription, '', report.iReportID, escape(JSON.stringify(app))]);
                                $('.MySpecialty_Favorites').append(html);

                                //Drop onto selector
                                Apps.Components.Reports.Show(report.iReportID.toString(), 'html', '', '#MySpecialty_Favorite_ReportContainer_' + app.iLogAppID);
                            });

                        }
                        else {
                            html = Me.UI.Templates.MySpecialty_Favorite_Report.HTML([app.iLogAppID, app.sLogAppName, '']);
                            $('.MySpecialty_Favorites').append(html);
                        }
                    }
                }
            });
        },
        ClickThumbnail: function (appString) {
            //Apps.Notify('success', appLogId);

            //Me.Max(appString);
            Me.ShowApp(appString);
        },
        Max: function (appString) {
            Me.ShowApp(appString);
        },
        MouseOverThumbnail: function (appObjString) {
            let app = JSON.parse(unescape(appObjString));
            $('#MySpecialty_ThumbnailMenu_' + app.iLogAppID).css('visibility', 'visible'); //.show();
        },
        MouseOutThumbnail: function (appObjString) {
            let app = JSON.parse(unescape(appObjString));
            $('#MySpecialty_ThumbnailMenu_' + app.iLogAppID).css('visibility', 'hidden'); // hide();
        },
        //Full screen app container
        ShowApp: function (appString) {

            Me.ShowBackground();

            let app = JSON.parse(unescape(appString));

            Me.SelectedApp = app;

            let content = 'no app content';

            switch (app.AppID) {
                case 1:

                    break;

                case 2:

                    break;

                case 3:

                    content = "hi app 3";

                case 6:

                    content = Me.LogApps.Apps.TestTool.GetContent();

                    break;
            }
            //eval('Me.UI.Templates.AppTemplate' + app.AppID + '.HTML()');

            let maxHtml = Me.UI.Templates.MySpecialty_ShowApp.HTML([app.AppID, app.AppName, app.AppURL, content]);

            $(document.body).append(maxHtml);

            //Apps.Util.CenterAbsolute($('.MySpecialty_ShowApp_Container'));
            //Apps.Util.MiddleAbsolute($('.MySpecialty_ShowApp_Container'));

            $('.MySpecialty_ShowApp_Container').css("top", "0").show(400);

        },
        ShowSettings: function (appString, logTabIndex) {

            Me.ShowBackground();

            let app = JSON.parse(unescape(appString));

            Me.SelectedApp = app;

            let maxHtml = Me.UI.Templates.MySpecialty_Max.HTML([app.AppID, app.AppName, '']);

            $(document.body).append(maxHtml);

            //Apps.Util.CenterAbsolute($('.MySpecialty_Max_Container'));
            //Apps.Util.MiddleAbsolute($('.MySpecialty_Max_Container'));

            $('.MySpecialty_Max_Container').css('top','0px').show(400);

            let existingFavoritePins = Enumerable
                .From(Apps.Components.ATEC.IT.MySpecialty.UserSettings)
                .Where(function (us) {
                    return us.SettingName == 'PinToFavoriteAppId'
                        && us.SettingValue == app.AppID.toString();
                })
                .ToArray();

            if (existingFavoritePins.length >= 1) {
                //Is pinned as Favorite
                $('#chkPinToFavorites').prop('checked', true);
            }

            //Get app content
            $('#MySpecialty_Max_LogContainer').html(Me.UI.Templates.MySpecialty_Max_Logs.HTML());
            Apps.Tabstrips.Initialize('tabstripMaxLogs');
            Apps.Tabstrips.Select('tabstripMaxLogs', logTabIndex);

            //Bad log
            //let args = {
            //    "Args": [
            //        { "Value": { "ArgName": "Method", "ArgValue": "GetAppLogData" } },
            //        { "Value": { "ArgName": "iLogAppID", "ArgValue": app.iLogAppID.toString() } }
            //    ]
            //};

            let request = {
                Params: [
                    { Name: "RequestCommand", Value: "GetAppLogData" },
                    { Name: "AppID", Value: app.AppID.toString() }
                ]
            }

            Me.Post.Refresh(request, [], function () {

                if (Me.Post.Success) {

                    let goodLogs = Enumerable.From(Me.Post.Data)
                        .Where(l => l.LogSeverity == 2).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabGoodContent').html(Me.GetLogHTML(goodLogs));

                    let badLogs = Enumerable.From(Me.Post.Data)
                        .Where(l => l.LogSeverity == 4).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabBadContent').html(Me.GetLogHTML(badLogs));

                    let uglyLogs = Enumerable.From(Me.Post.Data)
                        .Where(l => l.LogSeverity == 3).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabUglyContent').html(Me.GetLogHTML(uglyLogs));

                    let infoLogs = Enumerable.From(Me.Post.Data)
                        .Where(l => l.LogSeverity == 1).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabInfoContent').html(Me.GetLogHTML(infoLogs));

                //    let issueLogs = Enumerable.From(Me.Post.Data)
                //        .Where(l => l.iSeverityID == 2).OrderByDescending(l => l.dtCreated).ToArray();

                //    $('#templateTabGoodContent').html(Me.GetLogHTML(goodLogs));
                }
            });
        },
        GetLogHTML: function (logs) {

            let html = '';
            html += '<table class="table">';
            html += '<tr>';
            html += '<th>When</th>';
            html += '<th>First</th>';
            html += '<th>Last</th>';
            html += '<th>Log</th>';
            html += '<th>Unique ID</th>';
            //html += '<th>Office ID</th>';
            html += '</tr > ';

            $.each(logs, function (index, log) {
                html += '<tr>';
                html += '<td>' + Apps.Util.TimeElapsed(new Date(log.Created)) + '</br>' + new Date(log.Created).toLocaleString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                }) + '</td>';
                html += '<td>' + log.txtFirstName + '</td>';
                html += '<td>' + log.txtLastName + '</td>';
                html += '<td>' + log.Title + '</td>';
                html += '<td>' + log.sUniqueID + '</td>';
                //html += '<td>' + log.sOfficeID + '</td>';
                html += '</tr>';

            });
            html += '</table>';

            return html;
        },
        CloseMax: function () {
            Me.HideBackground();
            $('.MySpecialty_Max_Container').remove();
        },
        PinToFavoritesChange: function (ilogappid) {

            //if ($('#chkPinToFavorites').prop('checked')) {
            //    //UnPin

            //}
            //else {
            //    //Pin

            //}
            let existing = Enumerable
                .From(Apps.Components.Admin.UserSettings)
                .Where(function (us) {
                    return us.sSettingName == 'PinToFavoriteAppId'
                        && us.sSettingValue == ilogappid.toString();
                })
                .ToArray();

            if (existing.length == 0) {

                //Add to pinned apps
                let args = {
                    "Args": [
                        { "Value": { "ArgName": "Method", "ArgValue": "PinToFavoriteApp" } },
                        { "Value": { "ArgName": "iLogAppID", "ArgValue": ilogappid.toString() } }
                    ]
                };

                Me.Post.Refresh(args, [], function () {
                    if (Me.Post.Success) {
                        Apps.Notify('success', 'App pinned.');
                        Apps.Components.Admin.Functions.RefreshUserSettings();
                        Me.RefreshPinFavorites();
                    }
                });

            }
            else {

                //Remove from pinned apps
                let args = {
                    "Args": [
                        { "Value": { "ArgName": "Method", "ArgValue": "UnPinToFavoriteApp" } },
                        { "Value": { "ArgName": "iLogAppID", "ArgValue": ilogappid.toString() } }
                    ]
                };

                Me.Post.Refresh(args, [], function () {
                    if (Me.Post.Success) {
                        Apps.Notify('success', 'App un-pinned.');
                        //$('#MySpecialty_Favorite_Container_' + ilogappid).hide();
                        Apps.Components.Admin.Functions.RefreshUserSettings();
                        Me.RefreshPinFavorites();
                    }
                });

            }

        },
        ShowBackground: function () {
            $('#Admin_Modal_Background').show();
        },
        HideBackground: function () {
            $('#Admin_Modal_Background').hide();
        },

    };
    return Me;
});