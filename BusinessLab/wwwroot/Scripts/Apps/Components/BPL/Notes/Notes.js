Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            //Me.UI.Drop();
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            Apps.BindHTML(Me.UI.Selector, Me, true);
            Me.Root.ShowHeroHeader();
        },
        Model: {
        },
        Controls: {
            NotesHTML: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {
                    var thisSelector = this.Selector;
                    Me.NotesTable.Refresh(function (notesHtml) {
                        thisSelector.html(notesHtml);
                    })
                }
            }
        }
    };
    return Me;
});