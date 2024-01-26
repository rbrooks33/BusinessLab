Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Refresh: function (destinationSelector) {
            Me.Root.Actions.Run(Me.Root.Model.Configs.DevGetAllAppsActionID, function (apps) {

                //Get other connections
                Me.Root.Actions.Run(11, function (connections) {

                    let bplConnections = Enumerable.From(connections)
                        .Where(c => c.ConnectionTypeID == 4
                            && c.Name == 'IsAppsDataSource'
                            && c.Value == 'true').ToArray();


                    var settings =
                    {
                        id: "Apps_Table",
                        data: apps,
                        title: "Apps",
                        tablestyle: "margin:50px;width:85%;",
                        savecallback: function (obj, fieldName) {
                            Apps.Components.BPL.Apps.AppsTable.Save(obj, fieldName);
                        },
                        tableactions: [
                            {
                                text: 'Add App',
                                actionclick: function () {
                                    Apps.Components.BPL.Apps.AppsTable.Add();
                                }
                            }
                        ],
                        fields: [
                            Apps.Grids.GetField('AppID', 'text', false),
                            Apps.Grids.GetField('AppName'),
                            Apps.Grids.GetField('AppDescription')
                        ],
                        columns: [
                            Apps.Grids.GetColumn("AppID", "ID"),
                            Apps.Grids.GetColumn("AppName", "Name"),
                            Apps.Grids.GetColumn("AppDescription", "Description")
                        ]
                    };
                    let html = Apps.Grids.GetTable(settings);
                    destinationSelector.html(html);

                });
            });

        },
        Add: function () {
            Me.Root.Actions.Run(19, function () {
                Me.Parent.Controls.NotesHTML.Refresh();
            });
        },
        Save: function (obj, changedFieldName) {

            let argParams = [
                { "Name": "Value", "Value": obj.Value },
                { "Name": "ConnectionTypePropertyID", "Value": obj.ConnectionTypePropertyID.toString() },
            ];

            Me.Root.Actions.Run(20, function () {
                Me.Controls.PropertiesTableHTML.Refresh();
            }, argParams);

            Apps.Notify('info', 'Saved ' + changedFieldName);

        },

        Model: {
            PropertiesTableHTML: '',
            SelectedConnection: {}
        },
        Controls: {
            PropertiesTableHTML: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {
                    Me.Refresh(this.Selector);
                }
            }
        }
    };
    return Me;
});