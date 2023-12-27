Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            Me.UI.Drop(); //This allows auto-binding to see me
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
        },
        Start: function () {

        },
        CreateConnectionsTable: function (connectionsSectionSelector) {

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'GetDatabases' }
                ]
            };
            Me.Post.Refresh(args, [], function () {

                Me.Model.Databases = Me.Post.Data;

                var settings =
                {
                    id: "Plan_Workflow_Step_Table",
                    data: Me.Model.Databases,
                    title: "Sql Database Connections",
                    tablestyle: "margin:50px;width:85%;",
                    savecallback: function (obj, fieldName) {

                        let args = {
                            Params: [
                                { Name: 'RequestName', Value: 'UpsertDatabase' },
                                { Name: 'DatabaseID', Value: obj.DatabaseID.toString() }
                            ],
                            Data: obj
                        };

                        let root = Apps.Components.BPL;
                        let me = root.Admin;
                        let selector = me.Controls.AdminDatabasesSelect.Selector;
                        let mypost = Apps.Components.BPL.Data.Posts.Main;
                        mypost.Refresh(args, [], function () {

                            if (mypost.Success) {
                                //Find row and update
                                let row = Enumerable.From(me.Model.Databases).Where(d => d.DatabaseID == obj.DatabaseID).ToArray();
                                if (row.length == 1) {
                                    row[0] = obj;
                                    me.CreateConnectionsTable(selector);
                                    Apps.Notify('success', 'Database updated.');
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
                            text: 'Add Step',
                            actionclick: function () {
                                //Apps.Components.Home.Plan.Steps.Add();
                            }
                        }
                    ],
                    rowbuttons: [
                        {
                            text: 'Functional Specs',
                            buttonclick: function () {
                                //Apps.Components.Home.Plan.Steps.ShowFunctionalSpecs(arguments);
                            }
                        }
                    ],
                    fields: [
                        Apps.Grids.GetField('DatabaseID'),
                        Apps.Grids.GetField('DatabaseName'),
                        Apps.Grids.GetField('ConnectionString', 'editor'),
                    ],
                    columns: [
                        Apps.Grids.GetColumn("DatabaseID", "ID"),
                        Apps.Grids.GetColumn("DatabaseName", "Database Name"),
                        Apps.Grids.GetColumn("ConnectionString", "Connection String"),
                    ]
                };

                connectionsSectionSelector.html(Apps.Grids.GetTable(settings));
            });


        },
        Save: function (obj, changedFieldName) {


        },
        Model: {
            Databases: [],
            AdminDatabasesSelect: ''
        },
        Controls: {
            AdminDatabasesSelect: {
                Bound: function () {

                    Me.CreateConnectionsTable(this.Selector);

                }
            }
        }
    };
    return Me;
});