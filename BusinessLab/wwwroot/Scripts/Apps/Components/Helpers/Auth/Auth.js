Apps.Define([], function () {
    var Me = {
        User: {
            Email: null,
            FullName: null,
            UserID: null,
            IsSignedIn: false
        },
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            //Me.UI.Templates.Auth_LoginButtons.Show();
            //Me.Google.Show();
            //Me.Microsoft.Show();

            //$('#Auth_GoogleButton').html($('#g_id_signin').detach());
        }
    };
    return Me;
});