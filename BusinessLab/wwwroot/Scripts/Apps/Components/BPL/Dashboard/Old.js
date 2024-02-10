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
            { Name: "RequestName", Value: "GetAllApps" }
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
