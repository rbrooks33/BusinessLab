Apps.Define([], function (callback) {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Model: {
            DashboardHTML: '',
            SelectedAppLogs: []
        },
        Controls: {
            DashboardHTML: {
                Bound: function () {
                    let thisSelector = this.Selector;
                    Me.Root.Actions.Run(18, function (apps) {
                        Me.Parent.AppList = apps;
                        let thumbnailHtml = '';
                        $.each(apps, function (i, a) {
                            thumbnailHtml += Me.Parent.UI.Templates.Apps_AppThumbnail.HTML([a.AppName, a.AppDescription, a.AppID, a.LogSeverity, 1]);
                        });
                        thisSelector.html(thumbnailHtml);
                    });
                }
            }
        }

    };
    return Me;
})