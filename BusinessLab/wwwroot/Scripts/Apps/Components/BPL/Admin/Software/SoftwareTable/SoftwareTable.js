Apps.Define([], function () {
    var Me = {
        Initialize: function (callback) {
            callback(); 
        },
        Refresh: function (software) {

            var settings =
            {
                id: "Admin_Software_SoftwareTable",
                data: software,
                title: "Managed Software",
                tablestyle: "margin:50px;width:85%;",
                savecallback: function (obj, fieldName) {
                    Apps.Components.BPL.Admin.Software.SoftwareTable.Save(obj, fieldName);
                },
                tableactions: [
                    {
                        text: 'Add Software',
                        actionclick: function () {
                            Apps.Components.BPL.Admin.Software.SoftwareTable.Add();
                        }
                    },
                    {
                        text: 'Add BPL Server',
                        actionclick: function () {
                            Apps.Components.BPL.Admin.Software.AddBPLServer();
                        }
                    }

                ],
                rowactions: [
                    {
                        text: 'Open Folder',
                        actionclick: function (element, obj, tr) {
                            Apps.Components.BPL.Admin.Software.OpenFolder(obj);
                        }
                    },
                    {
                        text: 'Open In Git',
                        actionclick: function (element, obj, tr) {
                            Apps.Components.BPL.Actions.OpenInGit(obj);
                        }
                    },
                    {
                        text: 'Open Publish',
                        actionclick: function (element, obj, tr) {
                            Apps.Components.BPL.Admin.Software.Publish.Open(obj);
                        }
                    }


                ],
                rowbuttons: [
                    {
                        text: 'Edit',
                        buttonclick: function (element, obj, tr) {
                            Apps.Components.BPL.Admin.Software.Edit(obj);
                        }
                    },
                    {
                        text: 'Archive',
                        buttonclick: function (element, obj, tr) {
                            Apps.Components.BPL.Admin.Software.SoftwareTable.Archive(obj);
                        }
                    }

                ],
                fields: [
                    Apps.Grids.GetField('SoftwareID'),
                    Apps.Grids.GetField('SoftwareName'),
                    Apps.Grids.GetField('SoftwareDescription')
                ],
                columns: [
                    Apps.Grids.GetColumn("SoftwareID", "ID"),
                    Apps.Grids.GetColumn("SoftwareName", "Name"),
                    Apps.Grids.GetColumn("SoftwareDescription", "Description")
                ]
            };

            return Apps.Grids.GetTable(settings);
        },
        Add: function () {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs('AddSoftware'), function (post) {
                Me.Parent.GetTable();
            });

        },
        Save: function (obj, changedFieldName) {

            let argParams = [
                { Name: "SoftwareID", Value: obj.SoftwareID.toString() },
                { SoftwareName: obj.SoftwareName }
            ];

            Me.Root.Actions.Run(24, function () {
                //Me.Controls.PropertiesTableHTML.Refresh();
                Me.Parent.GetTable();
            }, argParams);

            Apps.Notify('info', 'Saved ' + changedFieldName);

        },
        Archive: function (software) {

        }
    };
    return Me;
})