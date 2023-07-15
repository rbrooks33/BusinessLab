define([], function () {
    var Me = {
        Initialize: function (callback) {
            callback();
        },
        Show: function () {

            Me.UI.Templates.Auth_Google_LoginButton.Show();
        },
        HTML: function () {
            return Me.UI.Templates.Auth_Google_LoginButton.HTML();
        }  
    };
    return Me;
});