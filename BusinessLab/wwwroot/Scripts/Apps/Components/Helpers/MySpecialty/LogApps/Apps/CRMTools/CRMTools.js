define([], function () {
    var Me = {
        Initialize: function (callback) {
            callback();
        },
        GetContent: function () {
            return Me.UI.Templates.Main.HTML();
        },
        CreateLead: function () {
            Apps.Notify('success', 'create');
        }
    };
    return Me;
});