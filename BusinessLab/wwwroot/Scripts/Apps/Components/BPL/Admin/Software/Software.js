Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            //Me.UI.Drop(); //This allows auto-binding to see me
            callback();
        },
        GetTable: function (callback) {
            let args = Apps.Data.GetPostArgs('GetSoftware');
            Apps.Data.ExecutePostArgs(args, function (post) {
                let softwareTableHTML = Me.SoftwareTable.Refresh(post.Data);
                if (callback)
                    callback(softwareTableHTML);
            });
        },
        OpenFolder: function (software) {
            //window.open("file:///Work/Learning/BusinessLab2/BusinessLab/Software");
            //let softwareRoot = Me.Root.Admin.Configs.GetConfigValue("SoftwareRootFolder");
            let args = Apps.Data.GetPostArgs('OpenFolder');
            args.Params.push({ Name: 'SoftwareID', Value: software.SoftwareID.toString() });
            Apps.Data.ExecutePostArgs(args, function (post) { });

        },
        OpenInGit: function () {

        },
        AddBPLServer: function () {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("AddBPLServer"), function (data) {
                Apps.Notify('success', 'Server project created!');
            });

        }
    };
    return Me;
});
