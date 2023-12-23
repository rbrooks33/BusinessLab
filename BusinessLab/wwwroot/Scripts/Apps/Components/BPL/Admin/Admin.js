Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            Me.UI.Drop(); //This allows auto-binding to see me
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
        },
        Start: function () {

        },
        Model: {
            AdminDatabasesSelect: ''
        },
        Controls: {
            AdminDatabasesSelect: {
                Bound: function () {

                    let post = Apps.Components.BPL.Data.Posts.Main;

                    let args = {
                        Params: [
                            { Name: 'RequestName', Value: 'GetDatabases' }
                        ]
                    };
                    post.Refresh(args, [], function () {
                        let databases = post.Data;
                    });

                    this.Selector.html(Apps.Util.GetSelectOptions(databases, ));
                }
            }
        }
    };
    return Me;
});