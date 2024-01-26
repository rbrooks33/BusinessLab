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