define([], function () {
    var Me = {
        Post: null, 
        PostAsync: null, 
        AppList: null,
        Initialize: function (callback) {

            if (callback)
                callback();
        },
        GetData: function (result) {

            Me.Post = Apps.Components.Common.Data.Posts.Main;
            Me.PostAsync = Apps.Components.Common.Data.Posts.MainAsync;

            result.Success = false; //reset

            //let args = {
            //    "Params": [
            //        { "Value": { "ArgName": "Method", "ArgValue": "GetApps" } }
            //    ]
            //};
            let request = {
                Params : [
                    {
                        Name: "RequestCommand", Value: "GetAllApps"
                    }
                ]
            };
            Me.Post.Refresh(request, [], function () {

                if (Me.Post.Success) {

                    Me.AppList = Me.Post.Data;

                    result.AddSuccess('Log Apps loaded');
                    result.Data = Me.AppList; // JSON.parse(Me.Post.Data);
                    result.Success = true;

                    $(document).ready(function () {

                        //TODO: re-enable
                        Me.RefreshAppsData();

                        //Apps.Components.Common.PushNotification.Subscriber().Subscribe('RefreshAppLogCounts', function (message) {

                        //    //Apps.Notify('success', 'got log push');

                        //    let logAppId = Apps.Components.Common.PushNotification.MessageValue(message, 'iLogAppID');
                        //    if (logAppId.Success) {
                        //        let id = logAppId.Data;
                        //        Me.GetAppData(id);
                        //    }
                        //    else
                        //        Apps.Notify('warning', 'Log app not found for LogApps.GetData!');

                        //})
                        ////setInterval(function () {

                        ////    Me.RefreshAppsData();

                        ////}, 30000);

                    });
                
                }
                else
                    result.AddFail('Failed get apps post', JSON.stringify(Me.Post.Result));
            });
        },
        GetAppData: function (appId) {

            Me.Post = Apps.Components.Common.Data.Posts.Main;
            Me.PostAsync = Apps.Components.Common.Data.Posts.MainAsync;

            //result.Success = false; //reset

            //let args = {
            //    "Args": [
            //        { "Value": { "ArgName": "Method", "ArgValue": "GetAppData" } },
            //        { "Value": { "ArgName": "iLogAppID", "ArgValue": appId.toString() } }
            //    ]
            //};

            let request = {
                Params: [
                    { Name: "RequestCommand", Value: "GetAppData" },
                    { Name: "AppID", Value: appId.toString() }
                ]
            }

            Me.PostAsync.Refresh(request, [], function () {

                if (Me.PostAsync.Success) {

                    //result.AddSuccess('App data loaded for app id ' + appId);
                    //result.Data = Me.PostData;
                    //result.Success = true;

                    let app = Me.PostAsync.Data[0];

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

                        if (app.GoodCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Good_' + appId)
                                .css('color', 'white')
                                .text(app.GoodCount)
                                .show(400);
                        }

                        if (app.BadCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Bad_' + appId)
                                .css('color', 'white')
                                .text(app.BadCount)
                                .show(400);
                        }

                        if (app.UglyCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Ugly_' + appId)
                                .css('color', 'black')
                                .text(app.UglyCount)
                                .show(400);
                        }

                        if (app.InfoCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Info_' + appId)
                                .css('color', 'black')
                                .css('border', '1px solid black')
                                .text(app.InfoCount)
                                .show(400);
                        }

                        if (app.IssueCount > 0) {
                            $('#MySpecialty_MiniAppStatus_Issue_' + appId)
                                .css('color', 'white')
                                .text(app.IssueCount)
                                .show(400);
                        }
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
        GetHTML: function (areaId, result) {

            Me.Post = Apps.Components.Common.Data.Posts.Main;
            Me.PostAsync = Apps.Components.Common.Data.Posts.MainAsync;

            //Area Apps
            let areaAppsData = Enumerable.From(Me.AppList).Where(function (a) { return a.AreaID == areaId ; }).ToArray();
            //let areaAppsData = Enumerable.From(Me.Apps).Where(function (a) { return a.iWorkflowAreaID == 1 && a.iLogAppTypeID == 1; }).ToArray();

            let areaAppsHtml = (areaAppsData.length == 0 ? '<span style="margin-left:20px;font-size:smaller;">No Apps</span>' : '');
            $.each(areaAppsData, function (index, aa) {

                let imagedisplay = 'none';
                if (aa.sLogAppThumbnailURL && aa.sLogAppThumbnailURL.length > 0)
                    imagedisplay = 'block';

                areaAppsHtml += Me.Parent.UI.Templates.MySpecialty_Thumbnail.HTML([aa.AppName, aa.AppID, aa.LogAppThumbnailURL, escape(JSON.stringify(aa)), imagedisplay, aa.sLogAppDescription == null ? '[no description]' : aa.sLogAppDescription]);

            });

            return areaAppsHtml;
        },
        GetActionsHTML: function (areaId, result) {

            let areaActionsData = Enumerable.From(Me.AppList).Where(function (a) { return a.iWorkflowAreaID == areaId && (a.iLogAppTypeID == 2 || a.iLogAppTypeID == 4); }).ToArray();
            let areaActionsHtml = (areaActionsData.length == 0 ? '<span style="margin-left:20px;font-size:smaller;">No Actions</span>' : '');
            $.each(areaActionsData, function (index, e) {
                areaActionsHtml += Me.Parent.UI.Templates.MySpecialty_Thumbnail.HTML([e.sLogAppName, e.iLogAppID, e.sLogAppDescription, escape(JSON.stringify(e)), '', '', e.sLogAppDescription == null ? '[no description]' : e.sLogAppDescription]);
            });
            return areaActionsHtml;
        },
        GetReportsHTML: function (areaId, result) {
            
            let visualsData = Enumerable.From(Me.AppList).Where(function (a) { return a.iWorkflowAreaID == areaId && a.iLogAppTypeID == 3; }).ToArray();
            let visualsHtml = (visualsData.length == 0 ? '<span style="margin-left:20px;font-size:smaller;">No Tools</span>' : '');
            $.each(visualsData, function (index, v) {
                visualsHtml += Me.Parent.UI.Templates.MySpecialty_Thumbnail.HTML([v.sLogAppName, v.iLogAppID, v.sLogAppDescription, escape(JSON.stringify(v)), '', '', v.sLogAppDescription == null ? '[no description]' : v.sLogAppDescription]);
            });
            return visualsHtml;
        },
    };
    return Me;
});