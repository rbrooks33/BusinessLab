﻿Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Show: function () {

            Me.UI.HideAll(); //Hides all but me
            Me.Root.ShowHeroHeader();

            //Populate all area, app and action data

            Me.Root.Areas.PopulateAreaModels(function () {

                Me.Root.Apps.GetWorkflowApps(function () {

                    Me.Root.Actions.GetWorkflowActions(function () {

                        Apps.BindElement('DashboardPage', Me);
                        Me.RefreshLogs();

                    })
                })
            });
        },
        RefreshLogs: function () {
            Me.AreaLogs.Refresh();
            Me.AppLogs.Refresh();
            Me.ActionLogs.Refresh();
            Me.WorkflowLogs.Refresh();
        },
        ViewAreaLogs: function (areaId, severityId) {
            Me.Root.Areas.GetAreaLogDetail(areaId, severityId, function (data) {
                let sorted = Enumerable.From(data).OrderByDescending(o => o.Created).ToArray();
                let html = Me.GetDataTable(sorted);
                Apps.OpenDialog(Me, 'ViewAreaLogsDialog', 'Area Log Detail', html);
            })
        },
        ViewWorkflowLogs: function (workflowId, severityId) {
            Me.Root.Areas.Workflows.GetWorkflowLogDetail(workflowId, severityId, function (data) {


                let logTable = Me.GetDataTable(data);

                let viewHtml = Apps.ApplyArgs($('[data-bind-template="WorkflowLogView"]').html(), [logTable]);

                Apps.OpenDialog(Me, 'ViewWorkflowLogsDialog', 'Workflow Log Detail', viewHtml);
            })
        },
        ViewAppLogs: function (appId, areaId, severityId) {
            Me.Root.Apps.GetAppLogDetail(appId, areaId, severityId, function (data) {


                let logTable = Me.GetDataTable(data);

                let viewHtml = Apps.ApplyArgs($('[data-bind-template="AppLogView"]').html(), [logTable]);

                Apps.OpenDialog(Me, 'ViewWorkflowLogsDialog', 'Workflow Log Detail', viewHtml);
            })
        },
        ViewActionLogs: function (actionId, areaId, severityId) {
            Me.Root.Actions.GetActionLogDetail(actionId, areaId, severityId, function (data) {


                let logTable = Me.GetDataTable(data);

                let viewHtml = Apps.ApplyArgs($('[data-bind-template="ActionLogView"]').html(), [logTable]);

                Apps.OpenDialog(Me, 'ViewWorkflowLogsDialog', 'Workflow Log Detail', viewHtml);
            })
        },
        //GetWorkflowApps: function (callback) {
        //    Apps.Data.Execute("External.GetWorkflowApps", [], function (result) {
        //        Me.Data.WorkflowApps = result.Data;
        //        callback();
        //    });

        //},
        //GetWorkflowActions: function (callback) {
        //    Apps.Data.Execute("External.GetWorkflowActions", [], function (result) {
        //        Me.Data.WorkflowActions = result.Data;
        //        callback();
        //    });

        //},
        GetDataTable: function (data) {

            if (data.length > 0) {


                let html = Apps.Bind.GetTable({
                    data: data,
                    tableid: 'tablewithnoid',
                    theadbinding: function (firstRow) {
                        let th = '';
                        $.each(Object.keys(firstRow), function (i, column) {
                            th += '<th>' + column + '</th>';
                        });
                        return th;
                    },
                    rowbinding: function (row) {
                        let td = '<tr>';
                        $.each(Object.keys(row), function (i, column) {
                            td += '<td>' + row[column] + '</td>';
                        });
                        td += '</tr>';
                        return td;

                    }
                });

                return html[0].outerHTML;
            }
            else {
                return 'no records';
            }
        },

        Model: {
            Areas: []
        },
        Data: {
            WorkflowApps: [],
            WorkflowActions: []
        },
        Controls: {
            DashboardPage: {
                Defaults: function () {
                    //this.Selector.hide();
                },
                Bound: function () {

                    let that = this;
                    let container = that.Selector.find('.DashboardPageContainer');

                    Me.Root.Areas.Get(function (areas) {

                        Me.Model.Areas = Enumerable.From(areas.Data).OrderBy(a => a.AreaID).ToArray();

                        $.each(Me.Model.Areas, function (i, a) {

                            //Area
                            let html = that.Selector.find('[data-bind-template="Area"]').html();
                            html = html.SearchAndReplace.apply(html, [a.AreaID, a.AreaName]);
                            container.append(html);

                            //Workflows
                            let areaWorkflows = Enumerable.From(Me.Root.Areas.Workflows.Model.Workflows).Where(w => w.AreaID == a.AreaID).ToArray();
                            $.each(areaWorkflows, function (i, w) {
                                let workflowsHtml = that.Selector.find('[data-bind-template="Workflow"]').html();
                                workflowsHtml = workflowsHtml.SearchAndReplace.apply(workflowsHtml, [a.AreaID, w.WorkflowID, w.WorkflowName, w.StepCount]);
                                container.find('.AreaWorkflows_' + a.AreaID).append(workflowsHtml);
                            });

                            //Apps
                            let areaApps = Enumerable.From(Me.Root.Apps.Data.WorkflowApps).Where(app => app.AreaID == a.AreaID).ToArray();
                            $.each(areaApps, function (i, app) {
                                let appsHtml = that.Selector.find('[data-bind-template="App"]').html();
                                appsHtml = appsHtml.SearchAndReplace.apply(appsHtml, [app.AreaID, app.AppID, app.AppName]);
                                container.find('.AreaApps_' + a.AreaID).append(appsHtml);
                            });

                            //Actions
                            let areaActions = Enumerable.From(Me.Root.Actions.Model.WorkflowActions).Where(action => action.AreaID == a.AreaID).ToArray();
                            $.each(areaActions, function (i, action) {
                                let actionsHtml = that.Selector.find('[data-bind-template="Action"]').html();
                                actionsHtml = actionsHtml.SearchAndReplace.apply(actionsHtml, [action.AreaID, action.ActionID, action.ActionName]);
                                container.find('.AreaActions_' + a.AreaID).append(actionsHtml);
                            });


                        });


                    });


                    this.Selector.show();
                    //    let that = this;

                    //    Me.Root.Areas.Get(function (areas) {

                    //        Me.Model.Areas = areas.Data;
                    //        that.Selector.empty();

                    //        $.each(Me.Model.Areas, function (i, a) {

                    //            let html = Me.UI.Templates.Area_Template.HTML([a.AreaID, a.AreaName]);
                    //            that.Selector.append(html);

                    //        });

                    //        //Apps.BindElement('DashboardAreaWorkflows', Me);
                    //        //Apps.BindElement('DashboardAreaApps', Me);
                    //        //Apps.BindElement('DashboardAreaActions', Me);

                    //        //Binds DashboardAreaWorkflows, -Apps and -Actions
                    //        //Apps.BindHTML(that.Selector, Me);

                    //    });
                }
            },
            //DashboardAreaWorkflows: {

            //    Bound: function () {

            //        let that = this;

            //        let areaid = this.Selector.attr('data-bind-areaid');

            //        let areaWorkflows = Enumerable
            //            .From(Me.Root.Areas.Workflows.Model.Workflows)
            //            .Where(w => w.AreaID == areaid).ToArray();

            //        if (areaWorkflows.length > 0)
            //            $('.WorkflowsTitle_' + areaid).show();
            //        else
            //            $('.WorkflowsTitle_' + areaid).hide();

            //        $.each(areaWorkflows, function (i, w) {

            //            let workflowHtml = Me.UI.Templates.Dashboard_WorkflowStatus_Template.HTML([areaid, w.WorkflowID, w.WorkflowName, w.StepCount]);
            //            that.Selector.append(workflowHtml);

            //        });
            //    }
            //},
            //DashboardAreaApps: {

            //    Bound: function () {

            //        let that = this;

            //        let areaid = this.Selector.attr('data-bind-areaid');

            //        let areaApps = Enumerable.From(Me.Root.Apps.Data.WorkflowApps).Where(app => app.AreaID == areaid).ToArray();

            //        if (areaApps.length > 0)
            //            $('.AppsTitle_' + areaid).show();
            //        else
            //            $('.AppsTitle_' + areaid).hide();

            //        $.each(areaApps, function (i, app) {
            //            let appsHtml = Me.UI.Templates.Dashboard_AppStatus_Template.HTML([app.AreaID, app.AppID, app.AppName]);
            //            that.Selector.append(appsHtml);
            //        });

            //    }
            //},
            //DashboardAreaActions: {
            //    Bound: function () {
            //        let that = this;

            //        let areaid = this.Selector.attr('data-bind-areaid');

            //        let areaActions = Enumerable.From(Me.Root.Actions.Model.WorkflowActions).Where(action => action.AreaID == areaid).ToArray();

            //        if (areaActions.length > 0)
            //            $('.ActionsTitle_' + areaid).show();
            //        else
            //            $('.ActionsTitle_' + areaid).hide();

            //        $.each(areaActions, function (i, action) {
            //            let actionsHtml = Me.UI.Templates.Dashboard_AppStatus_Template.HTML([action.AreaID, action.ActionID, action.ActionName]);
            //            that.Selector.append(actionsHtml);
            //        });


            //    }
            //},
        //    AreaContainerHTML: {
        //        Bound: function () {

        //            let that = this;
        //            let html = '';

        //            //Me.Root.Areas.Get(function (areas) {
        //            //    Me.Model.Areas = areas.Data;

        //            //    Me.Root.Areas.Workflows.Get(function (workflows) {
        //            //        Me.Model.Workflows = workflows.Data;

        //            //        Me.Root.Areas.Workflows.Steps.Get(function (steps) {
        //            //            Me.Model.Steps = steps.Data;

        //            //            Me.Root.Apps.GetWorkflowApps(function (apps) {
        //            //                Me.Model.Apps = apps.Data;

        //            //                Me.Root.Actions.GetWorkflowActions(function (actions) {
        //            //                    Me.Model.Actions = actions.Data;

        //                            //    $.each(Me.Model.Areas, function (i, a) {

        //                            //        //Area Workflows
        //                            //        let workflowHtml = '';
        //                            //        let areaWorkflows = Enumerable.From(Me.Model.Workflows).Where(w => w.AreaID == a.AreaID).ToArray();

        //                            //        $.each(areaWorkflows, function (i, w) {
        //                            //            workflowHtml += Me.UI.Templates.Dashboard_WorkflowStatus_Template.HTML([a.AreaID, w.WorkflowID, w.WorkflowName, w.StepCount]);
        //                            //        });

        //                            //        //Area Apps (app and app/step logs)
        //                            //        let appsHtml = '';
        //                            //        let areaApps = Enumerable.From(Me.Model.Apps).Where(app => app.AreaID == a.AreaID).ToArray();
        //                            //        $.each(areaApps, function (i, app) {
        //                            //            appsHtml += Me.UI.Templates.Dashboard_AppStatus_Template.HTML([a.AreaID, app.AppID, app.AppName]);
        //                            //        });

        //                            //        //Area Actions (action/step logs)
        //                            //        let actionsHtml = '';
        //                            //        let areaActions = Enumerable.From(Me.Model.Actions).Where(action => action.AreaID == a.AreaID).ToArray();

        //                            //        $.each(areaActions, function (i, action) {
        //                            //            actionsHtml += Me.UI.Templates.Dashboard_ActionStatus_Template.HTML([a.AreaID, action.ActionID, action.ActionName]);
        //                            //        });

        //                            //        html += Me.UI.Templates.Dashboard_Area_Template.HTML([a.AreaID, a.AreaName, workflowHtml, appsHtml, actionsHtml]);
        //                            //    });

        //                            //    that.Selector.html(html);

        //                            //    $.each(Me.Model.Areas, function (i, a) {

        //                            //        let areaWorkflows = Enumerable.From(Me.Model.Workflows).Where(w => w.AreaID == a.AreaID).ToArray();
        //                            //        if (areaWorkflows.length > 0)
        //                            //            $('.DashboardStatusContainerTitle_' + a.AreaID).show(400);
        //                            //        else
        //                            //            $('.DashboardStatusContainerTitle_' + a.AreaID).hide(400);

        //                            //        let areaApps = Enumerable.From(Me.Model.Apps).Where(app => app.AreaID == a.AreaID).ToArray();

        //                            //        if (areaApps.length > 0)
        //                            //            $('.AppStatusContainerTitle_' + a.AreaID).show(400);
        //                            //        else
        //                            //            $('.AppStatusContainerTitle_' + a.AreaID).hide(400);

        //                            //        let areaActions = Enumerable.From(Me.Model.Actions).Where(action => action.AreaID == a.AreaID).ToArray();
        //                            //        if (areaActions.length > 0)
        //                            //            $('.ActionsStatusContainerTitle_' + a.AreaID).show(400);
        //                            //        else
        //                            //            $('.ActionsStatusContainerTitle_' + a.AreaID).hide(400);


        //                            //    });
        //        //                    });
        //        //                });
        //        //            });
        //        //        });
        //        //    });
        //        }
        //    }
        }
    };
    return Me;
});