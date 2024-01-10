Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me

        },
        Model: {
            DashboardHTML: ''
        },
        Controls: {
            DashboardHTML: {
                Bound: function () {
                    thisSelector = this.Selector;
                //    Me.GetAppsThumbnailsHTML(function (html) {
                //        thisSelector.html(html);
                //    });
                }
            }
        },
        GetAppsThumbnailsHTML: function (callback) {

            let post = Me.Parent.Data.Posts.Helpers;

            //Subscribe to Event Log entry
            Apps.Components.Helpers.PushHub.Subscriber().Subscribe('LogEntry', function (result) {

                let appId = Enumerable.From(result.Params).Where(p => p.Name == 'AppID').ToArray()[0].Value;
                //    let stepId = Enumerable.From(result.Params).Where(p => p.Name == 'StepID').ToArray()[0].Value;
                //    let severity = Enumerable.From(result.Params).Where(p => p.Name == 'Severity').ToArray()[0].Value;

                //    let apps = Enumerable.From(Me.AppList).Where(a => a.AppID == appId).ToArray();

                //    if (apps.length == 1) {

                //        Me.UpdateAppLogTotals(apps[0], appId);
                //    }
                Me.GetAppData(appId);
            });


            let args = {
                Params: [
                    { Name: "RequestName", Value: "GetAllApps" },
                    { Name: "Token", Value: Apps.Components.Helpers.Auth.User.Token },
                    { Name: "CustomerID", Value: "0" }
                ]
            };

            //Get all apps
            post.Refresh(args, [], function () {

                if (post.Success) {

                    Me.AppList = post.Data;

                    //clean up result obj
                    $.each(Me.AppList, function (i, a) {
                        a.Result = JSON.parse(a.Result);
                    });

                    var html = '<div>';

                    Apps.Components.Home.Plan.GetCollectionHtml('GetAreas', function (areas) {

                        html += '<table>';

                        $.each(areas, function (ariaindex, area) {

                            var areaApps = Enumerable.From(Me.AppList).Where(a => a.AreaID == area.AreaID).ToArray();

                            html += '<tr>';
                            html += '  <td style="vertical-align:top;">';

                            let areaTitle = '<h4>' + area.AreaName + '</h4>';
                            html += areaTitle;

                            html += '  </td>';
                            html += '  <td>';

                            let areaHtml = '<div style="display:flex;flex-wrap:wrap;margin-bottom:40px;font-style: italic; font-size: 12px;">';

                            if (areaApps.length == 0) {
                                areaHtml += '[No apps for this area]'
                            }
                            else {
                                $.each(areaApps, function (index, a) {

                                    let opacity = 1;
                                    if (!a.Active)
                                        opacity = .4;

                                    areaHtml += Me.UI.Templates.Apps_AppThumbnail.HTML([a.AppName, a.AppDescription ? a.AppDescription : '', a.AppID, escape(JSON.stringify(a)), opacity]);
                                });
                            }

                            areaHtml += '</div>';

                            html += areaHtml;
                            html += '  </td>';
                            html += '</tr>';


                            //html += areaTitle + areaHtml;

                        });

                        html += '</table>';
                    });

                    html += '</div>';

                    callback(html);
                }
                else
                    Apps.Components.Home.HandleError(post.Result);
            });
        },
        GetData: function (result) {

            let post = Me.Parent.Data.Posts.Helpers;

            let request = {
                Params: [
                    {
                        Name: "RequestName", Value: "GetAllApps"
                    },
                    { Name: "Token", Value: Apps.Components.Helpers.Auth.User.Token },
                    { Name: "CustomerID", Value: "0" }

                ]
            };
            post.Refresh(request, [], function () {

                if (post.Success) {

                    $(document).ready(function () {

                        Me.RefreshAppsData();

                    });

                }
                else
                    Apps.Components.Helpers.HandleError(post.Result);
            });
        },
        RefreshAppsData: function () {

            $.each(Me.AppList, function (i, a) {
                setTimeout(function () {
                    Me.GetAppData(a.AppID);
                }, 500);

            })

        },
        GetAppData: function (appId) {

            let postAsync = Me.Parent.Data.Posts.HelpersAsync;

            let request = {
                Params: [
                    { Name: "RequestName", Value: "GetAppData" },
                    { Name: "AppID", Value: appId.toString() },
                    { Name: "Token", Value: Apps.Components.Helpers.Auth.User.Token },
                    { Name: "CustomerID", Value: "0" }

                ]
            }

            postAsync.Refresh(request, [], function () {

                if (postAsync.Success) {

                    let app = postAsync.Data[0];

                    Me.UpdateAppLogTotals(app, appId);

                }
                //else {
                //    Apps.Components.Home.HandleError(post.Result);
                //}
                //callback(result)
            });

        },
        UpdateAppLogTotals: function (app, appId) {

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
        GetAppLogs: function (appId, callback) {

            let post = Me.Parent.Data.Posts.Helpers;

            let request = {
                Params: [
                    { Name: "RequestName", Value: "GetAppLogData" },
                    { Name: "AppID", Value: appId.toString() },
                    { Name: "Token", Value: Apps.Components.Helpers.Auth.User.Token },
                    { Name: "CustomerID", Value: "0" }
                ]
            }

            post.Refresh(request, [], function () {

                if (post.Success) {

                    Me.SelectedAppLogs = post.Data; //choice between callback and property

                    if (callback)
                        callback(post.Data);
                }
                else
                    Apps.Components.Home.HandleError(post.Result);
            });

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