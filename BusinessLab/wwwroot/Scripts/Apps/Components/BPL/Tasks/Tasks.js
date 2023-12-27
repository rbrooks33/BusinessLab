Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            Me.UI.Drop();
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            Me.TaskTable.Create(Me.Controls.TaskTableHTML.Selector);
            Apps.Components.Helpers.Debug.UI.Show();
        },
        Start: function () {
        },
        Add: function () {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs('AddTask'), function (post) {
                Me.TaskTable.Create(Me.Controls.TaskTableHTML.Selector);
            });
        },
        View: function (task) {
            Me.Model.SelectedTask = task;
            let html = Me.UI.Templates.TaskViewTemplate.HTML();
            Apps.OpenDialog(Me, 'View_Task_Dialog', 'Task Details', html);
        },
        Save: function (task, fieldName) {

            let args = Apps.Data.GetPostArgs('UpdateTask');
            args.Params.push({ Name: 'TaskID', Value: task.TaskID.toString() });
            args.Data = JSON.stringify(task);

            Apps.Data.ExecutePostArgs(args, function (post) {

                //Find row and update
                let row = Enumerable.From(Me.Model.Tasks).Where(d => d.TaskID == task.TaskID).ToArray();
                if (row.length == 1) {
                    row[0] = task;
                    Me.TaskTable.Create(Me.Controls.TaskTable.Selector);
                    Apps.Notify('success', 'Task updated.');
                }

            });
        },
        Model: {
            Tasks: [],
            TaskTableHTML: '',
            SelectedTask: {}
        },
        Controls: {
            TaskTableHTML: {

            },
            SelectedTask: {

            }
        }
    };
    return Me;
});