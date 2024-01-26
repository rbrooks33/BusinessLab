Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
        },
        Model: {
            Connections: []

        }
    };
    return Me;
});