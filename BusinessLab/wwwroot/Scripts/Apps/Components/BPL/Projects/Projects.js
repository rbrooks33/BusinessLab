Apps.Define([], function () {
    let Me = {
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