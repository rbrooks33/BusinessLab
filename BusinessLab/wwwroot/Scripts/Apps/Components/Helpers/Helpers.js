Apps.Define([], function () {
    var Me = {
        Initialize: function (callback) {
            callback();
        },
        OpenResponse: function (resultEscapedString) {
            let resultString = unescape(resultEscapedString);
            Apps.Components.Helpers.Dialogs.Content('Helpers_Exception_Dialog', resultString);
            //Apps.Components.Helpers.Dialogs.Close('Helpers_Exception_Dialog');
            Apps.Components.Helpers.Dialogs.Open('Helpers_Exception_Dialog');

        }
    };
    return Me;
});