Apps.Define([], function () {
    var Me = {
        Initialize: function (callback) {
            callback(); 
        },
        Create: function (software) {

            var settings =
            {
                id: "Admin_Software_SoftwareTable",
                data: software,
                title: "Managed Software",
                tablestyle: "margin:50px;width:85%;",
                savecallback: function (obj, fieldName) {
                    Apps.Components.BPL.Admin.Software.Save(obj);
                },
                tableactions: [
                    {
                        text: 'Add Action',
                        actionclick: function () {
                            Apps.Components.Helpers.Admin.Software.Add();
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
        }
    };
    return Me;
})