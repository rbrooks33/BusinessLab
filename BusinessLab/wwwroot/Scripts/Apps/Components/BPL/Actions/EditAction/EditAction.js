Apps.Define([], function () {
   let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
        },
        Show: function (action) {

            let stepHtml = 'hiya';
            let html = Me.UI.Templates.EditAction_Template.HTML([action.ActionID, action.ActionName, stepHtml]);

            Apps.OpenDialog(Me, 'EditActionDialog', 'Edit Action', html);
        }
    };
    return Me;
});