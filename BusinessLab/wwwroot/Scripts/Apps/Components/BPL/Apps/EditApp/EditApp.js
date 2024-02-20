Apps.Define([], function () {
   let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
        },
        Show: function (app) {

            let stepHtml = 'hiya';
            let html = Me.UI.Templates.EditApp_Template.HTML([app.AppID, app.AppName, stepHtml]);

            Apps.OpenDialog(Me, 'EditAppDialog', 'Edit App', html);

            Apps.BindElement('AppStepRelationships', Me.Root.Areas.Workflows.Steps.StepRelationships);
        }
    };
    return Me;
});