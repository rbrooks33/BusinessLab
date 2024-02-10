Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Refresh: function (callback) {
            Apps.Components.Helpers.Debug.Init();
            //$('#contentDebug').show();
            Apps.Components.Helpers.Debug.UI.Show(400);

            Me.Root.Actions.Run(9, function (data) {

                Me.Parent.Model.Connections = data;

                var settings =
                {
                    id: "Plan_Workflow_Step_Table",
                    data: Me.Parent.Model.Connections,
                    title: "Connections",
                    tablestyle: "margin:50px;width:85%;",
                    savecallback: function (obj, fieldName) {
                        Apps.Components.BPL.Admin.Connections.ConnectionsTable.Save(obj, fieldName);
                    },
                    rowbuttons: [
                        {
                            text: "Edit",
                            buttonclick: function (td, rowdata, editcontrol) {
                                Apps.Components.BPL.Admin.Connections.ConnectionsTable.Edit(rowdata.ConnectionID);
                            }
                        }

                    ],
                    tableactions: [
                        {
                            text: 'Add Connection',
                            actionclick: function () {
                                Apps.Components.BPL.Admin.Connections.ConnectionsTable.Add();
                            }
                        }
                    ],
                    fields: [
                        Apps.Grids.GetField('ConnectionID'),
                        Apps.Grids.GetField('ConnectionName'),
                        Apps.Grids.GetField('ConnectionTypeID'),
                        Apps.Grids.GetField('ConnectionTypeName'),
                        Apps.Grids.GetField('Properties')
                    ],
                    columns: [
                        Apps.Grids.GetColumn("ConnectionID", "ID"),
                        Apps.Grids.GetColumn("ConnectionName", "Name"),
                        Apps.Grids.GetColumn('ConnectionTypeID', 'Connection Type ID'),
                        Apps.Grids.GetColumn('ConnectionTypeName', 'Connection Type'),
                        Apps.Grids.GetColumn("Properties", "Properties")
                    ]
                };

                callback(Apps.Grids.GetTable(settings));
            });


        },
        Save: function (obj, changedFieldName) {

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'UpsertConnection' },
                    { Name: 'ConnectionID', Value: obj.ConnectionID.toString() }
                ],
                Data: obj
            };

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

            Apps.Notify('info', 'Saved ' + changedFieldName);

        },
        Edit: function (connectionId) {

            let connection = Enumerable.From(Me.Parent.Model.Connections).Where(c => c.ConnectionID == connectionId).ToArray()[0];
            let propertyHtml = '<div data-bind-property="PropertiesTableHTML"></div>';
            Me.ConnectionProperties.Model.SelectedConnection = connection;
            Apps.OpenDialog(Me.ConnectionProperties, 'ConnectionProperties_Dialog', 'Connection Properties', propertyHtml);
        }

    };
    return Me;
});