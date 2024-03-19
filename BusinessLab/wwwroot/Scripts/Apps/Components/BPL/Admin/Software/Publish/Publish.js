Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            callback();
        },
        Open: function (software) {
            Me.Data.Software = software;
            let html = Me.UI.Templates.PublishDialog.HTML([software.SoftwareID, software.SoftwareName]);
            Apps.OpenDialog(Me, 'SoftwarePublishDialog', 'Software Publish', html);
        },
        Build: function () {
            Apps.Data.Execute("Software.Build", [{ Name: 'SoftwareID', Value: Me.Data.Software.SoftwareID.toString() }], function (data) {

            });
        },
        Publish: function () {
            Apps.Data.Execute("Software.Publish", [{ Name: 'SoftwareID', Value: Me.Data.Software.SoftwareID.toString() }], function (data) {

            });
        },
        Data: {
            Software: {}
        }
    };
    return Me;
});