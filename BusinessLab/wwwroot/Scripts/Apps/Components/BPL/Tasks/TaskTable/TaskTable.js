Apps.Define([], function () {
    let Me = {
        Create: function (destinationSelector) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs('GetTasks'), function (post) {

                var settings =
                {
                    id: "BPL_Tasks_Table",
                    data: Me.Parent.Model.Tasks = post.Data,
                    title: "",
                    tablestyle: "margin:50px;width:85%;",
                    savecallback: function (obj, fieldName) {
                        Apps.Components.BPL.Tasks.Save(obj, fieldName);
                    },
                    tableactions: [
                        {
                            text: 'Add Task',
                            actionclick: function () {
                                Apps.Components.BPL.Tasks.Add();
                            }
                        }
                    ],
                    rowbuttons: [
                        {
                            text: 'View',
                            buttonclick: function (element, task, row) {
                                Apps.Components.BPL.Tasks.View(task);
                            }
                        }
                    ],
                    fields: [
                        Apps.Grids.GetField('TaskID'),
                        Apps.Grids.GetField('TaskName'),
                        Apps.Grids.GetField('TaskDescription', 'editor'),
                    ],
                    columns: [
                        Apps.Grids.GetColumn("TaskID", "ID"),
                        Apps.Grids.GetColumn("TaskName", "Task Name"),
                        Apps.Grids.GetColumn("TaskDescription", "Description"),
                    ]
                };

                destinationSelector.html(Apps.Grids.GetTable(settings));

            });

        }
    };
    return Me;
});