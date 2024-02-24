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

            Me.Root.Areas.PopulateAreaModels();

            Apps.BindElement('DashboardContainer', Me);

            Me.RefreshLogs();
        },
        RefreshLogs: function () {
            Me.AppLogs.Refresh();
            Me.ActionLogs.Refresh();
        },
        Model: {
            Areas: []
        },
        Controls: {
            DashboardContainer: {
                Bound: function () {
                    let that = this;
                    Me.Root.Areas.Get(function (areas) {

                        Me.Model.Areas = areas.Data;

                        let html = '';
                        $.each(Me.Model.Areas, function (i, a) {
                            html += Me.UI.Templates.Area_Template.HTML([a.AreaID, a.AreaName]);
                        });
                        that.Selector.html(html);

                        Apps.BindElement('DashboardAreaWorkflows', Me);

                    });

                }
            },
            DashboardAreaWorkflows: {
                Bound: function () {
                    let areaid = this.Selector.attr('data-bind-areaid');

                    let areaWorkflows = Enumerable.From(Me.Root.Areas.Workflows.Model.Workflows).Where(w => w.AreaID == areaid).ToArray();

                    let workflowHtml = '';
                    $.each(areaWorkflows, function (i, w) {
                        workflowHtml += Me.UI.Templates.Dashboard_WorkflowStatus_Template.HTML([areaid, w.WorkflowID, w.WorkflowName, w.StepCount]);
                    });
                    this.Data.Value = workflowHtml;

                    Apps.BindElement('DashboardAreaApps', Me);
                    Apps.BindElement('DashboardAreaActions', Me);
                }
            },
            DashboardAreaApps: {

            },
            DashboardAreaApps: {

            },
            AreaContainerHTML: {
                Bound: function () {

                    let that = this;
                    let html = '';

                    //Me.Root.Areas.Get(function (areas) {
                    //    Me.Model.Areas = areas.Data;

                    //    Me.Root.Areas.Workflows.Get(function (workflows) {
                    //        Me.Model.Workflows = workflows.Data;

                    //        Me.Root.Areas.Workflows.Steps.Get(function (steps) {
                    //            Me.Model.Steps = steps.Data;

                    //            Me.Root.Apps.GetWorkflowApps(function (apps) {
                    //                Me.Model.Apps = apps.Data;

                    //                Me.Root.Actions.GetWorkflowActions(function (actions) {
                    //                    Me.Model.Actions = actions.Data;

                                    //    $.each(Me.Model.Areas, function (i, a) {

                                    //        //Area Workflows
                                    //        let workflowHtml = '';
                                    //        let areaWorkflows = Enumerable.From(Me.Model.Workflows).Where(w => w.AreaID == a.AreaID).ToArray();

                                    //        $.each(areaWorkflows, function (i, w) {
                                    //            workflowHtml += Me.UI.Templates.Dashboard_WorkflowStatus_Template.HTML([a.AreaID, w.WorkflowID, w.WorkflowName, w.StepCount]);
                                    //        });

                                    //        //Area Apps (app and app/step logs)
                                    //        let appsHtml = '';
                                    //        let areaApps = Enumerable.From(Me.Model.Apps).Where(app => app.AreaID == a.AreaID).ToArray();
                                    //        $.each(areaApps, function (i, app) {
                                    //            appsHtml += Me.UI.Templates.Dashboard_AppStatus_Template.HTML([a.AreaID, app.AppID, app.AppName]);
                                    //        });

                                    //        //Area Actions (action/step logs)
                                    //        let actionsHtml = '';
                                    //        let areaActions = Enumerable.From(Me.Model.Actions).Where(action => action.AreaID == a.AreaID).ToArray();

                                    //        $.each(areaActions, function (i, action) {
                                    //            actionsHtml += Me.UI.Templates.Dashboard_ActionStatus_Template.HTML([a.AreaID, action.ActionID, action.ActionName]);
                                    //        });

                                    //        html += Me.UI.Templates.Dashboard_Area_Template.HTML([a.AreaID, a.AreaName, workflowHtml, appsHtml, actionsHtml]);
                                    //    });

                                    //    that.Selector.html(html);

                                    //    $.each(Me.Model.Areas, function (i, a) {

                                    //        let areaWorkflows = Enumerable.From(Me.Model.Workflows).Where(w => w.AreaID == a.AreaID).ToArray();
                                    //        if (areaWorkflows.length > 0)
                                    //            $('.DashboardStatusContainerTitle_' + a.AreaID).show(400);
                                    //        else
                                    //            $('.DashboardStatusContainerTitle_' + a.AreaID).hide(400);

                                    //        let areaApps = Enumerable.From(Me.Model.Apps).Where(app => app.AreaID == a.AreaID).ToArray();

                                    //        if (areaApps.length > 0)
                                    //            $('.AppStatusContainerTitle_' + a.AreaID).show(400);
                                    //        else
                                    //            $('.AppStatusContainerTitle_' + a.AreaID).hide(400);

                                    //        let areaActions = Enumerable.From(Me.Model.Actions).Where(action => action.AreaID == a.AreaID).ToArray();
                                    //        if (areaActions.length > 0)
                                    //            $('.ActionsStatusContainerTitle_' + a.AreaID).show(400);
                                    //        else
                                    //            $('.ActionsStatusContainerTitle_' + a.AreaID).hide(400);


                                    //    });
                //                    });
                //                });
                //            });
                //        });
                //    });
                }
            }
        }
    };
    return Me;
});