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

        },
        HandleException: function (jsError) {
            let errObj = {
                message: jsError.message,
                stack: jsError.stack
            };
            Me.OpenResponse(JSON.stringify(errObj));
        //    if (result) {
        //        if (result.responseText && result.responseText.length > 50) {
        //            Apps.Notify('error', 'From server: ' + result.responseText.substring(0, 50));
        //            //vNotify.error({ text: 'text', title: 'title', sticky: true, showClose: true });
        //        }
        //        else if (result.responseText) {
        //            Apps.Notify('error', 'From server: ' + result.responseText);
        //        }
        //    }
        //    //Removed as unhelpfule from within power apps
        //    //    else {
        //    //        Apps.Notify('error', 'Unable to contact web server.');
        //    //    }
        }

    };
    return Me;
});