Apps.Define([], function () {
    var Me = {
        Initialize: function (callback) {

            callback();

        },
        GetAppsThumbnailsHTML: function (callback) {

            let post = Me.Parent.Data.Posts.Main;

            let args = {
                Params: [
                    { Name: "RequestCommand", Value: "GetAllApps" }
                ]
            };

            post.Refresh(args, [], function () {

                if (post.Success) {

                    Me.AppList = post.Data;

                    var html = '<div style="display:flex;flex-wrap:wrap;">';

                    $.each(Me.AppList, function (index, a) {
                        html += Me.UI.Templates.Apps_AppThumbnail.HTML([a.AppName, a.AppDescription ? a.AppDescription : '', a.AppID, escape(JSON.stringify(a))]);
                    });

                    html += '</div>';

                    callback(html);
                }
            });
        },
        GetData: function (result) {

            let post = Me.Parent.Data.Posts.Main;

            let request = {
                Params: [
                    {
                        Name: "RequestCommand", Value: "GetAllApps"
                    }
                ]
            };
            post.Refresh(request, [], function () {

                if (post.Success) {

                    $(document).ready(function () {

                        Me.RefreshAppsData();

                    });

                }
                else
                    result.AddFail('Failed get apps post', JSON.stringify(post.Result));
            });
        },
        GetAppData: function (appId) {

            let postAsync = Me.Parent.Data.Posts.MainAsync;

            let request = {
                Params: [
                    { Name: "RequestCommand", Value: "GetAppData" },
                    { Name: "AppID", Value: appId.toString() }
                ]
            }

            postAsync.Refresh(request, [], function () {

                if (postAsync.Success) {

                    let app = postAsync.Data[0];

                    if (app.GoodCount == 0
                        && app.BadCount == 0
                        && app.UglyCount == 0
                        && app.InfoCount == 0
                        && app.IssueCount == 0
                    ) {
                        $('#MySpecialty_MiniAppStatus_Container_' + appId).hide(400);
                    }
                    else {

                        $('#MySpecialty_MiniAppStatus_Container_' + appId).css('display', 'flex');

                        //Good
                        if (app.GoodCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Good_' + appId)
                                .css('color', 'white')
                                .text(app.GoodCount)
                                .show(400);
                        }
                        else
                            $('#MySpecialty_MiniAppStatus_Good_' + appId).css('display', 'none');

                        //Bad
                        if (app.BadCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Bad_' + appId)
                                .css('color', 'white')
                                .text(app.BadCount)
                                .show(400);
                        }
                        else
                            $('#MySpecialty_MiniAppStatus_Bad_' + appId).css('display', 'none');

                        //Ugly
                        if (app.UglyCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Ugly_' + appId)
                                .css('color', 'black')
                                .text(app.UglyCount)
                                .show(400);
                        }
                        else
                            $('#MySpecialty_MiniAppStatus_Ugly_' + appId).css('display', 'none');

                        //Info
                        if (app.InfoCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Info_' + appId)
                                .css('color', 'black')
                                .text(app.InfoCount)
                                .show(400);
                        }
                        else
                            $('#MySpecialty_MiniAppStatus_Info_' + appId).css('display', 'none');

                        //Issue
                        if (app.IssueCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Issue_' + appId)
                                .css('color', 'white')
                                .text(app.IssueCount)
                                .show(400);
                        }
                        else
                            $('#MySpecialty_MiniAppStatus_Issue_' + appId).css('display', 'none');
                    }
                }
                else {
                    //result.AddFail('Failed getting app ' + appId + ' data');
                }
                //callback(result)
            });

        },
        RefreshAppsData: function () {

            $.each(Me.AppList, function (i, a) {
                setTimeout(function () {
                    Me.GetAppData(a.AppID);
                }, 500);

            })

        },
        ShowApp: function (appString) {

            Me.Parent.ShowBackground();

            let app = JSON.parse(unescape(appString));

            Me.SelectedApp = app;

            let content = 'no app content';

            switch (app.AppID) {
                case 1:

                    break;

                case 2:

                    break;

                case 3:

                    break;

                case 6:

                    break;

                case 7:
                    Apps.Components.ATEC.Sales.AbandonedCartLeads.GetHTML(function (html) {
                        content = html;
                    });

                    break;
            }
            //eval('Me.UI.Templates.AppTemplate' + app.AppID + '.HTML()');

            let maxHtml = Me.UI.Templates.Apps_ShowApp.HTML([app.AppID, app.AppName, app.AppURL, content]);

            $(document.body).append(maxHtml);

            //Apps.Util.CenterAbsolute($('.MySpecialty_ShowApp_Container'));
            //Apps.Util.MiddleAbsolute($('.MySpecialty_ShowApp_Container'));

            $('.MySpecialty_ShowApp_Container').css("top", "0").show(400);

        },
        ShowLogs: function (appString, logTabIndex) {

            Me.Parent.ShowBackground();

            let app = JSON.parse(unescape(appString));

            Me.SelectedApp = app;

            let maxHtml = Me.UI.Templates.Apps_Max.HTML([app.AppID, app.AppName, '']);

            $(document.body).append(maxHtml);

            //Apps.Util.CenterAbsolute($('.MySpecialty_Max_Container'));
            //Apps.Util.MiddleAbsolute($('.MySpecialty_Max_Container'));

            $('.MySpecialty_Max_Container').css('top', '0px').show(400);

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
            Me.Parent.HideBackground();
            $('.MySpecialty_Max_Container').remove();
        }

    };
    return Me;
})