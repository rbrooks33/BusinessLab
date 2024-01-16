Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
       Initialize: function (callback) {
            callback();
        },
        Refresh: function (destinationSelector) {
            Me.Root.Actions.Run(11, function (properties) {

                let myProperties = Enumerable.From(properties)
                    .Where(p => p.ConnectionTypeID == Me.Model.SelectedConnection.ConnectionTypeID)
                    .ToArray();

                var settings =
                {
                    id: "ConnectionProperties_Table",
                    data: myProperties,
                    title: "<i>" + Me.Model.SelectedConnection.ConnectionName + "</i> Properties <br/> Type: " + myProperties[0].ConnectionTypeName,
                    tablestyle: "margin:50px;width:85%;",
                    savecallback: function (obj, fieldName) {
                        Apps.Components.BPL.Admin.Connections.ConnectionsTable.ConnectionProperties.Save(obj, fieldName);
                    },
                    //tableactions: [
                    //    {
                    //        text: 'Add Property',
                    //        actionclick: function () {
                    //            Apps.Components.BPL.Admin.ConnectionsTable.ConnectionProperties.Add();
                    //        }
                    //    }
                    //],
                    fields: [
                        Apps.Grids.GetField('ConnectionTypeID', 'text', false),
                        Apps.Grids.GetField('Name', 'text', false),
                        Apps.Grids.GetField('Value')
                    ],
                    columns: [
                        Apps.Grids.GetColumn("ConnectionTypeID", "ID"),
                        Apps.Grids.GetColumn("Name", "Name"),
                        Apps.Grids.GetColumn("Value", "Value")
                    ]
                };
                let html = Apps.Grids.GetTable(settings);
                destinationSelector.html(html);

            });

        },
        //NOTE: Currently only value update is permitted here
        //Add: function () {
        //    let params = [{ Name: 'UserID', Value: Me.Root.Model.LoggedInAs.toString() }]
        //    Me.Root.Actions.Run(14, function () {
        //        Me.Parent.Controls.NotesHTML.Refresh();
        //    }, params);
        //},
        Save: function (obj, changedFieldName) {

            let argParams = [
                { "Name": "Value", "Value": obj.Value },
                { "Name": "ConnectionTypePropertyID", "Value": obj.ConnectionTypePropertyID.toString() },
            ];

            Me.Root.Actions.Run(17, function () {
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