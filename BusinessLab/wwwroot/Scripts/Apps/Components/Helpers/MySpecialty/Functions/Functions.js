define([], function () {
    var Me = {
        Post: null,
        GetPinSettings: function () {

            return Enumerable
                .From(Apps.Components.ATEC.IT.MySpecialty.UserSettings.Settings)
                .Where(function (s) {
                    return s.sSettingName == 'PinToFavoriteAppId'
                        && s.iAppID == 47; //My Specialty App
                }).ToArray();

        },
        GetReport: function (reportid, callback) {

            //let report = null;
            Me.Post = Apps.Components.Main.Data.Posts.Main;

            let args = {
                "Args": [
                    { "Value": { "ArgName": "Method", "ArgValue": "GetReport" } },
                    { "Value": { "ArgName": "iReportID", "ArgValue": reportid.toString() } }
                ]
            };

            Me.Post.Refresh(args, [], function () {
                if (Me.Post.Success) {

                    callback(Me.Post.Data);

                    
                }
            });

        },
        UserSettingExists: function (logappid, usersettingname) {

            let existing = Enumerable
                .From(Apps.Components.Admin.UserSettings)
                .Where(function (us) {
                    return us.sSettingName == usersettingname
                        && us.sSettingValue == logappid.toString();
                })
                .ToArray();

            return existing.length >= 1;
        },
        Pin: function (myspecialty, logappid) {

            let args = {
                "Args": [
                    { "Value": { "ArgName": "Method", "ArgValue": "PinToFavoriteApp" } },
                    { "Value": { "ArgName": "iLogAppID", "ArgValue": logappid.toString() } }
                ]
            };

            myspecialty.Post.Refresh(args, [], function () {
                if (myspecialty.Post.Success) {
                    Apps.Notify('success', 'App pinned.');
                    Apps.Components.Admin.Functions.RefreshUserSettings();
                    myspecialty.RefreshPinFavorites();
                }
            });

        },
        UnPin: function (myspecialty, logappid) {

            let args = {
                "Args": [
                    { "Value": { "ArgName": "Method", "ArgValue": "UnPinToFavoriteApp" } },
                    { "Value": { "ArgName": "iLogAppID", "ArgValue": logappid.toString() } }
                ]
            };

            myspecialty.Post.Refresh(args, [], function () {
                if (myspecialty.Post.Success) {
                    Apps.Notify('success', 'App un-pinned.');
                    //$('#MySpecialty_Favorite_Container_' + ilogappid).hide();
                    Apps.Components.Admin.Functions.RefreshUserSettings();
                    myspecialty.RefreshPinFavorites();
                }
            });
        },
        CreateTable: function () {


            let areasTable = Apps.Bind.GetTable({
                tableid: 'Areas_Table',
                data: Me.Areas,
                theadbinding: function () {
                    return '<tr><th></th></tr>';
                },
                rowbinding: function (row, index) {

                    try {

                        let areaWorkflowData = Enumerable.From(Me.Workflows)
                            .Where(function (w) { return w.iWorkflowAreaID == row.iWorkflowAreaID; })
                            .ToArray();

                        let areaWorkflowsHtml = '';
                        areaWorkflowsHtml += '<table>';
                        $.each(areaWorkflowData, function (index, aw) {

                            //Workflows
                            areaWorkflowsHtml += '<div style="font-weight:400;">';
                            areaWorkflowsHtml += aw.sWorkflowName;

                            areaWorkflowsHtml += '<div>';

                            //Steps
                            areaWorkflowsHtml += '<div style="margin-bottom:10px;font-size:x-small;display: flex; flex-direction: row; flex-wrap: wrap;">';
                            $.each(aw.Steps, function (index, s) {
                                areaWorkflowsHtml += '<div class="MySpecialty_Step_Container">'
                                areaWorkflowsHtml += '<div style="font-weight:bold;">' + s.sStepName + '</div>';
                                areaWorkflowsHtml += '<div>' + s.sStepDescription + '</div>';
                                areaWorkflowsHtml += '</div>'
                            });
                            areaWorkflowsHtml += '</div>';

                            //Actions
                            areaWorkflowsHtml += '</div>';


                        });
                        areaWorkflowsHtml += '</table>';
                        areaWorkflowsHtml += '</div>';


                        //Area Apps
                        //let areaAppsData = Enumerable.From(apps).Where(function (a) { return a.iWorkflowAreaID == row.iWorkflowAreaID && a.iLogAppTypeID == 1; }).ToArray();
                        //let areaAppsHtml = (areaAppsData.length == 0 ? '<span style="margin-left:20px;font-size:smaller;">No Apps</span>' : '');
                        //$.each(areaAppsData, function (index, aa) {

                        //    let imagedisplay = 'none';
                        //    if (aa.sLogAppThumbnailURL && aa.sLogAppThumbnailURL.length > 0)
                        //        imagedisplay = 'block';

                        //    areaAppsHtml += Me.UI.Templates.MySpecialty_Thumbnail.HTML([aa.sLogAppName, aa.iLogAppID, aa.sLogAppThumbnailURL, escape(JSON.stringify(aa)), imagedisplay, aa.sLogAppDescription == null ? '[no description]' : aa.sLogAppDescription]);

                        //});
                        Me.LogApps.GetHTML(row.iWorkflowAreaID, result, function (result) {

                            if (result.Success) {

                                let areaAppsHtml = result.Data;

                                //Area Actions
                                let areaActionsData = Enumerable.From(Me.LogApps.Apps).Where(function (a) { return a.iWorkflowAreaID == row.iWorkflowAreaID && a.iLogAppTypeID == 2; }).ToArray();
                                let areaActionsHtml = (areaActionsData.length == 0 ? '<span style="margin-left:20px;font-size:smaller;">No Actions</span>' : '');
                                $.each(areaActionsData, function (index, e) {
                                    areaActionsHtml += Me.UI.Templates.MySpecialty_Thumbnail.HTML([e.sLogAppName, e.iLogAppID, e.sLogAppDescription, escape(JSON.stringify(e)), '', '', e.sLogAppDescription == null ? '[no description]' : e.sLogAppDescription]);
                                });


                                //Reports
                                let visualsData = Enumerable.From(Me.LogApps.Apps).Where(function (a) { return a.iWorkflowAreaID == row.iWorkflowAreaID && a.iLogAppTypeID == 3; }).ToArray();
                                let visualsHtml = (visualsData.length == 0 ? '<span style="margin-left:20px;font-size:smaller;">No Visuals</span>' : '');
                                $.each(visualsData, function (index, v) {
                                    visualsHtml += Me.UI.Templates.MySpecialty_Thumbnail.HTML([v.sLogAppName, v.iLogAppID, v.sLogAppDescription, escape(JSON.stringify(v)), '', '', v.sLogAppDescription == null ? '[no description]' : v.sLogAppDescription]);
                                });

                                ////Area Endpoints
                                //let endpointsData = Enumerable.From(apps).Where(function (a) { return a.iWorkflowAreaID == row.iWorkflowAreaID && a.iLogAppTypeID == 4; }).ToArray();
                                //let endpointsHtml = (endpointsData.length == 0 ? '<span style="margin-left:20px;font-size:smaller;">No Endpoints</span>' : '');
                                //$.each(endpointsData, function (index, e) {
                                //    endpointsHtml += Me.UI.Templates.MySpecialty_EndpointThumbnail.HTML([e.sLogAppName, e.iLogAppID, e.sLogAppDescription, escape(JSON.stringify(e))]);
                                //});
                                let endpointsHtml = '';

                                let allhtml = Me.UI.Templates.MySpecialty_Areas_Row.HTML([row.sWorkflowAreaName, row.iWorkflowAreaID, areaAppsHtml, areaActionsHtml, visualsHtml, endpointsHtml, areaWorkflowsHtml]);
                                let hi = 'ya';
                                return allhtml;
                            }
                        });
                    }
                    catch (error) {
                        result.AddFail('Exception: ' + error.name + '. ' + error.message);
                    }

                }
            });

            //$('.MySpecialty_Library').append(areasTable[0]);

            //Me.Resize();
            if (result.Success)
                callback(areasTable[0]);
            else
                Apps.ShowResult(result);

        }

    };
    return Me;
});