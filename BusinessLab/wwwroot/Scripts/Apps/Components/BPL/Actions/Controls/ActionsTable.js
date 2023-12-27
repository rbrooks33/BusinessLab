Apps.Define([], function () {
    var Me = {
        Create: function (actions) {

            var settings =
            {
                id: "Admin_Editor_ActionsTable",
                data: actions,
                title: "",
                tablestyle: "padding-left:50px;padding-right:50px;",
                savecallback: function (obj, fieldName) {
                    Apps.Components.BPL.Actions.Save(obj);
                },
                tableactions: [
                    {
                        text: 'Add Action',
                        actionclick: function () {
                            Apps.Components.Helpers.Actions.ActionsTable.Add();
                        }
                    }
                ],
                rowbuttons: [
                    {
                        text: 'Edit',
                        buttonclick: function (element, obj, tr) {
                            Apps.Components.BPL.Actions.Edit(obj);
                        }
                    },
                    {
                        text: 'Job',
                        buttonclick: function (element, obj, tr) {
                            Apps.Components.BPL.Actions.Edit(obj);
                        }
                    }

                ],
                fields: [
                    Apps.Grids.GetField('ActionID'),
                    Apps.Grids.GetField('ActionName'),
                    Apps.Grids.GetField('ActionDescription'),
                    Apps.Grids.GetField('SuccessActionID'),
                    Apps.Grids.GetField('SuccessActionDescription'),
                    Apps.Grids.GetField('FailActionID'),
                    Apps.Grids.GetField('FailActionDescription'),
                    Apps.Grids.GetField('UniqueID'),
                    Apps.Grids.GetField('RepeatQuantity'),
                    Apps.Grids.GetField('RepeatIntervalSeconds'),
                    Apps.Grids.GetField('CronSchedule')
                ],
                columns: [
                    Apps.Grids.GetColumn("ActionID", "ID"),
                    Apps.Grids.GetColumn("ActionName", "Action"),
                    Apps.Grids.GetColumn("ActionDescription", "Description"),
                    Apps.Grids.GetColumn("SuccessActionID", "Yes Action"),
                    Apps.Grids.GetColumn("SuccessActionDescription", "Yes Description"),
                    Apps.Grids.GetColumn("FailActionID", "No Action"),
                    Apps.Grids.GetColumn("FailActionDescription", "No Description"),
                    Apps.Grids.GetColumn("UniqueID", "Tag"),
                    Apps.Grids.GetColumn("RepeatQuantity", "Repeat Times"),
                    Apps.Grids.GetColumn("RepeatIntervalSeconds", "Repeat Interval (Seconds)"),
                    Apps.Grids.GetColumn("CronSchedule", "Custom Schedule (CRON)")
                //    Me.GetColumn("IsJob", "Is Job", function (action) {
                //        return action.IsJob ? 'Yes' : 'No';
                //    })
                ]
            };

            return Apps.Grids.GetTable(settings);
        }
    };
    return Me;
})