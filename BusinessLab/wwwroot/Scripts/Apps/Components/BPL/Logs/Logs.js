Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
            Apps.Data.Execute("GetLogs", [], function (result) {
                Me.Model.Logs = result.Data;
            });
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            Me.Root.ShowHeroHeader();

        },
        Add: function (stepId, title, description, uniqueId, logSeverityId) {
            Apps.Data.Execute('AddLog', [
                { Name: 'StepID', Value: stepId.toString() },
                { Name: 'Title', Value: title },
                { Name: 'Description', Value: description },
                { Name: 'UniqueID', Value: uniqueId },
                { Name: 'SeverityID', Value: logSeverityId.toString() }
            ]);
        },
        Model: {
            Logs: []
        },
        Controls: {

        }
    };
    return Me;
});