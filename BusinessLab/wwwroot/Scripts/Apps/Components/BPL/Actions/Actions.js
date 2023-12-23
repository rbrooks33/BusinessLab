
Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            callback();
        },
        Show: function () {

            Me.UI.HideAll(); //Hides all but me

            //Apps.Components.Helpers.Actions.GetActions($('.BPL_Actions_Table_Container'));
        }
    };
    return Me;
});