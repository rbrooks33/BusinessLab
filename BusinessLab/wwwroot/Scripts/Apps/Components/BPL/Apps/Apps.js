Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
        },
        Model: {

        },
        Controls: {

        }
    };
    return Me;
});