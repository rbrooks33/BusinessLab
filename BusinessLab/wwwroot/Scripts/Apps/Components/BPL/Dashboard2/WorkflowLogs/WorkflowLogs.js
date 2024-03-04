Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
       Initialize: function (callback) {
            callback();
        },
        Refresh: function () {

            Me.Root.Areas.Workflows.GetAllWorkflows(function (workflows) {

                $.each(workflows, function (i, workflow) {
                    Me.Root.Areas.Workflows.GetAllWorkflowLogs(workflow.WorkflowID, function (logcounts) {

                        $.each(logcounts, function (i, logcount) {
                            setTimeout(function () {
                                Me.RefreshWorkflow(workflow, logcount);
                            }, 500)
                        });

                    });
                });
            });
        },
        RefreshWorkflow: function (workflow, logcounts) {

            let id = workflow.WorkflowID; // appId = app.AppID;

            if (logcounts.GoodCount == 0
                && logcounts.BadCount == 0
                && logcounts.UglyCount == 0
                && logcounts.InfoCount == 0
                && logcounts.IssueCount == 0
            ) {
                //$('#MySpecialty_MiniAppStatus_Container_' + id).hide(400);
            }
            else {

                //$('#MySpecialty_MiniAppStatus_Container_' + id).css('display', 'flex');

                //Good
                if (logcounts.GoodCount > 0) {
                    $('.WorkflowStatus_Good_' + id)
                        .css('display', 'table-cell')
                        .css('color', 'white')
                        .text(logcounts.GoodCount)
                        .show(400);
                }
                else
                    $('.AppStatus_Good_' + id).css('display', 'none');

                //Bad
                if (logcounts.BadCount > 0) {

                    let show = false;

                    if (logcounts.BadAge <= 1) {
                        badBackground = 'red';
                        badColor = 'white';
                        show = true;
                    }
                    else if (logcounts.BadAge > 1 && logcounts.BadAge <= 7) {
                        badBackground = 'yellow';
                        badColor = 'black';
                        show = true;
                    }

                    if (show) {

                        $('.WorkflowStatus_Bad_' + id)
                            .css('display', 'table-cell')
                            .css('color', badColor)
                            .css('background-color', badBackground)
                            .text(logcounts.BadCount)
                            .show(400);
                    }
                }
                else
                    $('.AppStatus_Bad_' + id).css('display', 'none');

                //Ugly
                if (logcounts.UglyCount > 0) {
                    $('.WorkflowStatus_Ugly_' + id)
                        .css('display', 'table-cell')
                        .css('color', 'black')
                        .text(logcounts.UglyCount)
                        .show(400);
                }
                else
                    $('.AppStatus_Ugly_' + id).css('display', 'none');

                //Info
                if (logcounts.InfoCount > 0) {
                    $('.WorkflowStatus_Info_' + id)
                        .css('display', 'table-cell')
                        .css('color', 'black')
                        .text(logcounts.InfoCount)
                        .show(400);
                }
                else
                    $('.WorkflowStatus_Info_' + id).css('display', 'none');

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