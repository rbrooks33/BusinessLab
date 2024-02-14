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

                                $.each(Me.Model.Areas, function (i, a) {

                                    let workflowHtml = '';
                                    let areaWorkflows = Enumerable.From(Me.Model.Workflows).Where(w => w.AreaID == a.AreaID).ToArray();

                                    $.each(areaWorkflows, function (i, w) {
                                        workflowHtml += Me.UI.Templates.Dashboard_WorkflowStatus_Template.HTML([w.WorkflowName]);
                                    });
                                    html += Me.UI.Templates.Dashboard_Area_Template.HTML([a.AreaID, a.AreaName, workflowHtml]);
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