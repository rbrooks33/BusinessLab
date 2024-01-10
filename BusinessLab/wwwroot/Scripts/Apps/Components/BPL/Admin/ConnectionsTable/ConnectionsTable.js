Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Refresh: function (callback) {

            Me.Root.Actions.Run(9, function (data) {

                Me.Parent.Model.Connections = data;

                var settings =
                {
                    id: "Plan_Workflow_Step_Table",
                    data: Me.Parent.Model.Connections,
                    title: "Connections",
                    tablestyle: "margin:50px;width:85%;",
                    savecallback: function (obj, fieldName) {

                        let args = {
                            Params: [
                                { Name: 'RequestName', Value: 'UpsertConnection' },
                                { Name: 'ConnectionID', Value: obj.ConnectionID.toString() }
                            ],
                            Data: obj
                        };

                        let root = Apps.Components.BPL;
                        let me = root.Admin;
                        let selector = me.Controls.AdminConnectionsSelect.Selector;
                        let mypost = Apps.Components.BPL.Data.Posts.Main;
                        mypost.Refresh(args, [], function () {

                            if (mypost.Success) {
                                //Find row and update
                                let row = Enumerable.From(me.Model.Connections).Where(d => d.ConnectionID == obj.ConnectionID).ToArray();
                                if (row.length == 1) {
                                    row[0] = obj;
                                    me.CreateConnectionsTable(selector);
                                    Apps.Notify('success', 'Connection updated.');
                                }
                            }
                            else {
                                root.HandleError(mypost.Result);
                            }
                        });

                        Apps.Notify('info', 'Saved ' + fieldName);
                    },
                    tableactions: [
                        {
                            text: 'Add Connection',
                            actionclick: function () {
                                //Apps.Components.Home.Plan.Steps.Add();
                            }
                        }
                    ],
                    fields: [
                        Apps.Grids.GetField('ConnectionID'),
                        Apps.Grids.GetField('ConnectionName'),
                        Apps.Grids.GetField('ConnectionTypeName'),
                    ],
                    columns: [
                        Apps.Grids.GetColumn("ConnectionID", "ID"),
                        Apps.Grids.GetColumn("ConnectionName", "Name"),
                        Apps.Grids.GetColumn("ConnectionTypeName", "Connection Type"),
                    ]
                };

                callback(Apps.Grids.GetTable(settings));

            });

        },
        Save: function (obj, changedFieldName) {


        }


    };
    return Me;
});