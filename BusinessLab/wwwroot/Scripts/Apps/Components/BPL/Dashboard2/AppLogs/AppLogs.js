Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
       Initialize: function (callback) {
            callback();
        },
        Refresh: function () {

            Me.Root.Apps.GetAllApps(function (apps) {

                $.each(apps, function (i, app) {
                    Me.Root.Apps.GetAllAppLogs(app.AppID, function (logapps) {

                        $.each(logapps, function (i, logcounts) {
                            setTimeout(function () {
                                Me.RefreshApp(app, logcounts);
                            }, 500)
                        });

                    });
                });
            });
        },
        RefreshApp: function (app, logcounts) {

            let appId = app.AppID;

            if (logcounts.GoodCount == 0
                && logcounts.BadCount == 0
                && logcounts.UglyCount == 0
                && logcounts.InfoCount == 0
                && logcounts.IssueCount == 0
            ) {
                $('#MySpecialty_MiniAppStatus_Container_' + appId).hide(400);
            }
            else {

                $('#MySpecialty_MiniAppStatus_Container_' + appId).css('display', 'flex');

                //Good
                if (logcounts.GoodCount > 0) {
                    $('.AppStatus_Good_' + appId)
                        .css('display', 'table-cell')
                        .css('color', 'white')
                        .text(logcounts.GoodCount)
                        .show(400);
                }
                else
                    $('.AppStatus_Good_' + appId).css('display', 'none');

                //Bad
                if (logcounts.BadCount > 0) {
                    $('.AppStatus_Bad_' + appId)
                        .css('display', 'table-cell')
                        .css('color', 'white')
                        .text(logcounts.BadCount)
                        .show(400);
                }
                else
                    $('.AppStatus_Bad_' + appId).css('display', 'none');

                //Ugly
                if (logcounts.UglyCount > 0) {
                    $('.AppStatus_Ugly_' + appId)
                        .css('display', 'table-cell')
                        .css('color', 'black')
                        .text(logcounts.UglyCount)
                        .show(400);
                }
                else
                    $('.AppStatus_Ugly_' + appId).css('display', 'none');

                //Info
                if (logcounts.InfoCount > 0) {
                    $('.AppStatus_Info_' + appId)
                        .css('display', 'table-cell')
                        .css('color', 'black')
                        .text(logcounts.InfoCount)
                        .show(400);
                }
                else
                    $('.AppStatus_Info_' + appId).css('display', 'none');

            //    //Issue
            //    if (app.IssueCount > 0) {
            //        $('#MySpecialty_MiniAppStatus_Issue_' + appId)
            //            .css('color', 'white')
            //            .text(app.IssueCount)
            //            .show(400);
            //    }
            //    else
            //        $('#MySpecialty_MiniAppStatus_Issue_' + appId).css('display', 'none');
            }

        }

    };
    return Me;
});