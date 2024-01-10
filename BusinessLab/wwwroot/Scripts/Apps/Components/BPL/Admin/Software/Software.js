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
                let softwareTableHTML = Me.SoftwareTable.Create(post.Data);
                if (callback)
                    callback(softwareTableHTML);
            });
        }
    };
    return Me;
});
