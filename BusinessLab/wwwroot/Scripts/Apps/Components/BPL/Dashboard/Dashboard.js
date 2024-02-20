Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            //Apps.BindHTML(Me.UI.Selector, Me.DashboardControls, true);
            Me.Root.ShowHeroHeader();
            //setInterval(Me.RefreshLogTotals, 5000);
        },
        TimerEnable: function () {
            Me.DashboardControls.Model.TimerEnabled = true;
        },
        TimerDisable: function () {
            Me.DashboardControls.Model.TimerEnabled = false;
        },
        Refresh: function () {
            $.each(Me.AppList, function (i, a) {
                    Me.GetLogTotals(a.AppID);

            })

        },
        RefreshLogTotals: function () {

            Me.Root.Apps.GetAllApps(function (data) {

                $.each(data, function (i, a) {
                    setTimeout(function () {
                        //if (Me.DashboardControls.Model.TimerEnabled) {
                        //Apps.Notify('info', 'timer');
                        Me.GetLogTotals(a.AppID);
                        //}
                    }, 500);

                })


            });

        },
        GetLogTotals: function (appId) {

            //Get log totals
            let params = [
                { Name: 'AppID', Value: appId.toString() }
            ];
            Me.Root.Actions.Run(22, function (appLogTotals) {

                Me.UpdateAppLogTotals(appLogTotals, appId);

            },params);

        },
        UpdateAppLogTotals: function (appArray, appId) {

            let app = appArray[0];

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

        },
        ShowSeverityLogs: function (appId, severityId) {

            //Get all logs
            let params = [
                { Name: 'AppID', Value: appId.toString() },
                { Name: 'LogSeverityID', Value: severityId.toString() }
            ];
            Me.Root.Actions.Run(21, function (appLogs) {

                let html = '';

                if (severityId == 2) {

                    //STEPS
                    let steps = Enumerable.From(appLogs).Distinct(l => l.StepID).ToArray();


                    $.each(steps, function (i, s) {

                        html += '<table class="table">';
                        html += '  <tr>';
                        html += '    <th>' + s.StepName + '</th>';
                        html += '  </tr>';
                        html += '  <tr><td>';
                        let stepLogs = Enumerable.From(appLogs).Where(l => l.StepID == s.StepID).ToArray();

                        html += '<table class="table">';
                        $.each(stepLogs, function (i, sl) {
                            html += '  <tr>';
                            html += '    <td>' + sl.Created1 + '</td>';
                            html += '    <td>' + sl.UniqueID + '</td>';
                            html += '    <td>' + sl.UserFullName + '</td>';
                            html += '  </tr>';
                        });
                        html += '</table>';

                        html += '  </td></tr>';
                        html += '</table>';
                    });
                }
                else if (severityId == 1) {

                    let appLogsDesc = Enumerable.From(appLogs).OrderByDescending(l => l.Created1).ToArray();

                    //INFO
                    html = '<table class="table">';
                    html += '  <tr>';
                    html += '    <th>Created</th>';
                    html += '    <th>Title</th>';
                    html += '    <th>Description</th>';
                    html += '    <th>Unique ID</th>';
                    html += '  </tr>';
                    $.each(appLogsDesc, function (i, l) {

                        html += '  <tr>';
                        html += '    <td>' + Apps.Util.FormatDateTime2(l.Created1) + '</td>';
                        html += '    <td>' + l.Title + '</td>';
                        html += '    <td style="width:30%;">' + l.Description + '</td>';
                        html += '    <td>' + l.UniqueID + '</td>';
                        html += '  </tr>';

                    });
                    html += '</table>';

                }
                else if (severityId == 3) {

                    let appLogsDesc = Enumerable.From(appLogs).OrderByDescending(l => l.Created1).ToArray();

                    //INFO
                    html = '<table class="table">';
                    html += '  <tr>';
                    html += '    <th>Created</th>';
                    html += '    <th>Title</th>';
                    html += '    <th>Description</th>';
                    html += '    <th>Unique ID</th>';
                    html += '  </tr>';
                    $.each(appLogsDesc, function (i, l) {

                        html += '  <tr>';
                        html += '    <td>' + Apps.Util.FormatDateTime2(l.Created1) + '</td>';
                        html += '    <td>' + l.Title + '</td>';
                        html += '    <td style="width:30%;">' + l.Description + '</td>';
                        html += '    <td>' + l.UniqueID + '</td>';
                        html += '  </tr>';

                    });
                    html += '</table>';

                }
                else if (severityId == 4) {

                    let appLogsDesc = Enumerable.From(appLogs).OrderByDescending(l => l.Created1).ToArray();

                    //INFO
                    html = '<table class="table">';
                    html += '  <tr>';
                    html += '    <th>Created</th>';
                    html += '    <th>Title</th>';
                    html += '    <th>Description</th>';
                    html += '    <th>Unique ID</th>';
                    html += '  </tr>';
                    $.each(appLogsDesc, function (i, l) {

                        html += '  <tr>';
                        html += '    <td>' + Apps.Util.FormatDateTime2(l.Created1) + '</td>';
                        html += '    <td>' + l.Title + '</td>';
                        html += '    <td style="width:30%;">' + l.Description + '</td>';
                        html += '    <td>' + l.UniqueID + '</td>';
                        html += '  </tr>';

                    });
                    html += '</table>';

                }

                Apps.OpenDialog(Me, 'DashboardLogDialog', 'Logs', html);

            }, params);

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

                    Apps.Components.ATEC.Sales.AbandonedCartLeads.Show(); break; //show calls DropApp so it can handle post drop events

                case 8:

                    Apps.Components.ATEC.IT.PageCacher.Show(app); break;

                case 9:

                    Apps.Components.ATEC.Sales.SalesWizard.Show(); break;
            }
        },
        DropApp: function (app, content) {

            let maxHtml = Me.UI.Templates.Apps_ShowApp.HTML([app.AppID, app.AppName, app.AppURL, content]);

            $(document.body).append(maxHtml);

            $('.MySpecialty_ShowApp_Container').css("top", "0").show(400);

        },
        ShowLogs: function (appString, logTabIndex) {

            let post = Me.Parent.Data.Posts.Helpers;

            Me.Parent.ShowBackground();

            let app = JSON.parse(unescape(appString));

            Me.SelectedApp = app;

            let maxHtml = Me.UI.Templates.Apps_Max.HTML([app.AppID, app.AppName, '']);

            $(document.body).append(maxHtml);

            //Apps.Util.CenterAbsolute($('.MySpecialty_Max_Container'));
            //Apps.Util.MiddleAbsolute($('.MySpecialty_Max_Container'));

            $('.MySpecialty_Max_Container').css('top', '0px').show(400);

            let existingFavoritePins = Enumerable
                .From(Apps.Components.Home.UserSettings)
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
                    { Name: "RequestName", Value: "GetAppLogData" },
                    { Name: "AppID", Value: app.AppID.toString() },
                    { Name: "Token", Value: Apps.Components.Helpers.Auth.User.Token },
                    { Name: "CustomerID", Value: "0" }
                ]
            }

            post.Refresh(request, [], function () {

                if (post.Success) {

                    let goodLogs = Enumerable.From(post.Data)
                        .Where(l => l.LogSeverity == 2).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabGoodContent').html(Me.GetLogHTML(goodLogs));

                    let badLogs = Enumerable.From(post.Data)
                        .Where(l => l.LogSeverity == 4).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabBadContent').html(Me.GetLogHTML(badLogs));

                    let uglyLogs = Enumerable.From(post.Data)
                        .Where(l => l.LogSeverity == 3).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabUglyContent').html(Me.GetLogHTML(uglyLogs));

                    let infoLogs = Enumerable.From(post.Data)
                        .Where(l => l.LogSeverity == 1).OrderByDescending(l => l.Created).ToArray();

                    $('#templateTabInfoContent').html(Me.GetLogHTML(infoLogs));

                    //    let issueLogs = Enumerable.From(Me.Post.Data)
                    //        .Where(l => l.iSeverityID == 2).OrderByDescending(l => l.dtCreated).ToArray();

                    //    $('#templateTabGoodContent').html(Me.GetLogHTML(goodLogs));
                }
                else
                    Apps.Components.Home.HandleError(post.Result);
            });
        },
        GetLogHTML: function (logs) {

            let html = '';
            html += '<table class="table">';
            html += '<tr>';
            html += '<th>When</th>';
            //html += '<th>First</th>';
            //html += '<th>Last</th>';
            html += '<th>Title</th>';
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
                //html += '<td>' + log.txtFirstName + '</td>';
                //html += '<td>' + log.txtLastName + '</td>';
                html += '<td>' + log.Title + '</td>';
                html += '<td>' + log.UniqueID + '</td>';
                //html += '<td>' + log.sOfficeID + '</td>';
                html += '</tr>';

            });
            html += '</table>';

            return html;
        },
        CloseMax: function () {
            Me.Parent.HideBackground();
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
        SaveApp: function () {

            let app = Apps.Components.Home.Apps.SelectedApp;
            let post = Me.Data.Posts.AbandonedCartLeads;
            let result = Me.GetAppResult();
            let args = {
                Params: [
                    { Name: 'RequestCommand', Value: 'SaveApp' },
                    { Name: 'AppID', Value: app.AppID.toString() }
                ],
                Data: JSON.stringify(result)
            };
            post.Refresh(args, [], function () {
                if (post.Success) {
                    Apps.Notify('success', 'App saved!');
                }
                else
                    Apps.Components.Home.HandleError(post.Result);
            });
        },
        RefreshEnabled: false,
        RefreshIntervalSeconds: 20,
        RefreshHandle: null,
        RefreshAppLogs: function () {
            if (Me.SelectedApp)
                Me.GetAppData(Me.SelectedApp.AppID);
        },
        RefreshChange: function () {
            if (!Me.RefreshHandle)
                Me.RefreshHandle = setInterval(Me.RefreshAppLogs, Me.RefreshIntervalSeconds);
            else
                Me.RefreshHandle = null;
        }


    };
    return Me;
});