Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            Me.UI.Drop();
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            Me.ProjectTable.Create(Me.Controls.ProjectsTable.Selector);
            Apps.Components.Helpers.Debug.UI.Show();
        },
        Start: function () {
        },
        Add: function () {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs('AddProject'), function (post) {
                Me.ProjectTable.Create(Me.Controls.ProjectsTable.Selector);
            });
        },
        View: function (project) {
            Me.Model.SelectedProject = project;
            let html = Me.UI.Templates.ProjectViewTemplate.HTML();
            Apps.OpenDialog(Me, 'View_Project_Dialog', 'Project Details', html);
        },
        Save: function (project, fieldName) {

            let args = Apps.Data.GetPostArgs('UpsertProject');
            args.Params.push({ Name: 'ProjectID', Value: project.ProjectID.toString() });
            args.Data = JSON.stringify(project);

            Apps.Data.ExecutePostArgs(args, function (post) {

                //Find row and update
                let row = Enumerable.From(Me.Model.Projects).Where(d => d.ProjectID == project.ProjectID).ToArray();
                if (row.length == 1) {
                    row[0] = project;
                    Me.ProjectTable.Create(Me.Controls.ProjectsTable.Selector);
                    Apps.Notify('success', 'Project updated.');
                }

            });
        },
        Model: {
            Projects: [],
            ProjectsTable: '',
            SelectedProject: {}
        },
        Controls: {
            ProjectsTable: {

            }
        }
    };
    return Me;
});