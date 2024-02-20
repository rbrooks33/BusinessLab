Apps.Define([], function () {
   let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
        },
        Show: function (workflow) {

            let stepHtml = 'hiya';
            let html = Me.UI.Templates.EditWorkflow_Template.HTML([workflow.WorkflowID, workflow.WorkflowName, stepHtml]);

            Apps.OpenDialog(Me, 'EditWorkflowDialog', 'Edit Workflow', html);
        }
    };
    return Me;
});