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

            Apps.BindElement('AreaContainerHTML', Me);

        },
        Model: {
            Areas: [],
            AreaContainerHTML: ''
        },
        Controls: {
            AreaContainerHTML: {
                Bound: function () {

                    let that = this;
                    let html = '';

                    Me.Root.Areas.Get(function (areas) {
                        Me.Model.Areas = areas.Data;

                        Me.Root.Areas.Workflows.Get(function (workflows) {
                            Me.Model.Workflows = workflows.Data;

                            Me.Root.Areas.Workflows.Steps.Get(function (steps) {
                                Me.Model.Steps = steps.Data;

                                Me.Root.Apps.GetWorkflowApps(function (apps) {
                                    Me.Model.Apps = apps.Data;

                                    Me.Root.Actions.GetWorkflowActions(function (actions) {
                                        Me.Model.Actions = actions.Data;

                                        $.each(Me.Model.Areas, function (i, a) {

                                            //Area Workflows
                                            let workflowHtml = '';
                                            let areaWorkflows = Enumerable.From(Me.Model.Workflows).Where(w => w.AreaID == a.AreaID).ToArray();
                                            
                                            $.each(areaWorkflows, function (i, w) {
                                                workflowHtml += Me.UI.Templates.Dashboard_WorkflowStatus_Template.HTML([w.WorkflowName]);
                                            });

                                            //Area Apps (app and app/step logs)
                                            let appsHtml = '';
                                            let areaApps = Enumerable.From(Me.Model.Apps).Where(app => app.AreaID == a.AreaID).ToArray();
                                            areaApps.length > 0 ? $('.AppStatusContainerTitle').show() : $('.AppStatusContainerTitle').hide();
                                            $.each(areaApps, function (i, app) {
                                                appsHtml += Me.UI.Templates.Dashboard_AppStatus_Template.HTML([app.AppName]);
                                            });

                                            //Area Actions (action/step logs)
                                            let actionsHtml = '';
                                            let areaActions = Enumerable.From(Me.Model.Actions).Where(action => action.AreaID == a.AreaID).ToArray();

                                            $.each(areaActions, function (i, action) {
                                                actionsHtml += Me.UI.Templates.Dashboard_ActionStatus_Template.HTML([action.ActionName]);
                                            });

                                            html += Me.UI.Templates.Dashboard_Area_Template.HTML([a.AreaID, a.AreaName, workflowHtml, appsHtml, actionsHtml]);
                                        });
                                    });
                                });
                            });
                        });

                        that.Selector.html(html);

                    });
                }
            }
        }
    };
    return Me;
});