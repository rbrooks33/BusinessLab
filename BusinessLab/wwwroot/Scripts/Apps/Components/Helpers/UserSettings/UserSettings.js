Apps.Define([], function () {
    var Me = {
        Initialize: function (callback) {

            if (callback)
                callback();

            //Me.RefreshUserSettings();
        },
        RefreshUserSettings: function () {

            Me.Post = Apps.Components.Common.Data.Posts.Main;

            ////Load user settings
            //let userSettingsArgs = {
            //    "Args": [
            //        { "Value": { "ArgName": "Method", "ArgValue": "GetUserSettings2" } },
            //        { "Value": { "ArgName": "iAppID", "ArgValue": "47" } },
            //        { "Value": { "ArgName": "sOfficeID", "ArgValue": "1234" } } // Apps.Components.Auth.User.localAccountId } }

            //    ]
            //};

            let request = {
                Params : [
                    { Name : "RequestCommand", Value : "GetAllUserSettings"}
                ]
            }

            Me.Post.Refresh(request, [], function () {
                if (Me.Post.Success) {

                    Me.Settings = Me.Post.Data;
                    
                }
                else {
                    Apps.Notify('danger', 'Failed getting user settings for Admin component.');
                   
                }
            });

        }

    };
    return Me;
});