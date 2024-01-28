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
                        text: 'Add Action',
                        actionclick: function () {
                            Apps.Components.BPL.Admin.Software.Add();
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
                        text: 'Delete',
                        buttonclick: function (element, obj, tr) {
                            Apps.Components.BPL.Actions.Delete(obj);
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
        Save: function (obj, changedFieldName) {

            let argParams = [
                { Name: "SoftwareID", Value: obj.SoftwareID.toString() },
                { SoftwareName: obj.SoftwareName }
            ];

            Me.Root.Actions.Run(24, function () {
                Me.Controls.PropertiesTableHTML.Refresh();
            }, argParams);

            Apps.Notify('info', 'Saved ' + changedFieldName);

        },

    };
    return Me;
})