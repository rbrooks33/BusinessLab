Apps.Define([], function () {

    let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
        },
        Add: function (stepId) {

            if (Me.Model.RelationshipTypeName == 'Apps') {

                let args = [
                    { Name: 'AppID', Value: Me.Model.UniqueID.toString() },
                    { Name: 'StepID', Value: stepId.toString() }
                ];

                Apps.Data.Execute("AddStepToApp", args, function () {
                    Me.Controls.AppStepRelationships.Refresh();
                });
            }
        },
        Remove: function (stepId) {

            if (Me.Model.RelationshipTypeName == 'Apps') {

                let args = [
                    { Name: 'AppID', Value: Me.Model.UniqueID.toString() },
                    { Name: 'StepID', Value: stepId.toString() }
                ];

                Apps.Data.Execute("RemoveStepFromApp", args, function () {
                    Me.Controls.AppStepRelationships.Refresh();
                });
            }

        },
        GetSelectedWorkflowStepsHTML: function (workflowId, callback) {

            let workflow = Enumerable.From(Me.Parent.Parent.Model.Workflows).Where(w => w.WorkflowID == workflowId).ToArray()[0];
            let steps = Enumerable.From(Me.Parent.Model.Steps).Where(s => s.WorkflowID == workflowId).ToArray();
            let html = '<table class="table">';
            $.each(steps, function (i, s) {
                html += Me.UI.Templates.StepRelationships_SourceRow_Template.HTML([s.StepID, s.StepName]);
            });
            html += '</table>';

            callback(html);
        },
        Model: {
            UniqueID: 0,
            RelationshipTypeName: '',
            AppStepRelationships: '',
            StepRelationshipWorkflows: ''
        },
        Controls: {
            AppStepRelationships: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {
                    //This works, if only called from here, where all are bound
                    Me.Model.UniqueID = this.Selector.attr('data-bind-uniqueid');
                    Me.Model.RelationshipTypeName = this.Selector.attr('data-bind-relationshiptypename');

                    let html = Me.UI.Templates.StepRelationships_Template.HTML(
                        [
                            Me.Model.UniqueID,
                            Me.Model.RelationshipTypeName
                        ]);

                    this.Selector.html(html);

                    Apps.BindElement('StepRelationshipSource', Me);
                    Apps.BindElement('StepRelationshipSourceSteps', Me);
                    Apps.BindElement('StepRelationshipTarget', Me);
                }
            },
            StepRelationshipSource: {
                Bound: function () {
                    let that = this;
                    Apps.Util.GetSelectOptions(Me.Parent.Parent.Model.Workflows, 0, 'Select A Workflow', 'WorkflowID', 'WorkflowName', function (options) {

                        that.Selector.html(options);

                    });
                },
                Changed: function (elementName, workflowId) {

                    Me.GetSelectedWorkflowStepsHTML(workflowId, function (html) {

                        Me.Controls.StepRelationshipSourceSteps.Selector.html(html); //TODO: use integrated model

                    });
                }
            },
            StepRelationshipSourceSteps: {},
            StepRelationshipTarget: {
                Bound: function () {

                    let that = this;
                    let id = this.Selector.attr('data-bind-uniqueid');

                    Apps.Data.Execute("GetAppSteps", [{ Name: 'AppID', Value: id }],
                        function (data) {

                            let html = '<table class="table">';
                            html += '<th></th><th>Step</th><th></th><th>Workflow</th>'
                            $.each(data.Data, function (i, s) {
                                html += Me.UI.Templates.StepRelationships_TargetRow_Template.HTML([s.StepID, s.StepName, s.WorkflowID, s.WorkflowName]);
                            });
                            html == '</table>';

                            that.Selector.html(html);
                        });
                }
            },
        }
    };
    return Me;
});