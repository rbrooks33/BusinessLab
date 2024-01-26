Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            Me.Root.ShowHeroHeader();
        },
        Model: {

        },
        Controls: {

        }
    };
    return Me;
});