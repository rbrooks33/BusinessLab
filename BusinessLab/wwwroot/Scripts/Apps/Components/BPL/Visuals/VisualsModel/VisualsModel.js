Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Model: {
            VisualsConnections: '',
            ConnectionProperties: [],
            SelectedFolder: '',
            JSEditor: {},
            HTMLEditor: {},
            CSSEditor: {},
            SelectedURL: '',
            SelectedFolder: ''
        }

    };
    return Me;
});