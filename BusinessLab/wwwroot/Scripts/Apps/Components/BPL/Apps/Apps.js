Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            Apps.BindHTML(Me.UI.Selector, Me, true);
            Me.Root.ShowHeroHeader();
        },
        GetWorkflowApps: function (callback) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetWorkflowApps"), function (data) {
                callback(data);
            });

        },
        GetAllApps: function (callback) {
            Apps.Data.Execute("GetAllApps", [], function (result) {
                callback(result.Data);
            });
        },
        GetAllAppLogs: function (appId, callback) {
            Apps.Data.Execute("GetAllAppLogs",
                [{ Name: 'AppID', Value: appId.toString() }],
                function (result) {
                callback(result.Data);
            });
        },
        Edit: function (appId) {

            //NOTE: Dashboard populates workflows, apps and actions according to what it shows
            //at a later time, each component may load the collection completely
            let app = Enumerable.From(Me.Root.Dashboard2.Model.Apps).Where(a => a.AppID == appId).ToArray()[0];

            Me.EditApp.Show(app)
        },
        Model: {
            AppsHTML: ''
        },
        Controls: {
            AppsHTML: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {
                    Me.AppsTable.Refresh(this.Selector);
                }
            }
        }
    };
    return Me;
});