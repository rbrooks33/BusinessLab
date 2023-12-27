Apps.Define([], function () {
    let Me = {
        Create: function (destinationSelector) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs('GetProjects'), function (post) {

                var settings =
                {
                    id: "BPL_Projects_Table",
                    data: Me.Parent.Model.Projects = post.Data,
                    title: "",
                    tablestyle: "margin:50px;width:85%;",
                    savecallback: function (obj, fieldName) {
                        Apps.Components.BPL.Projects.Save(obj, fieldName);
                    },
                    tableactions: [
                        {
                            text: 'Add Project',
                            actionclick: function () {
                                Apps.Components.BPL.Projects.Add();
                            }
                        }
                    ],
                    rowbuttons: [
                        {
                            text: 'View',
                            buttonclick: function (element, project, row) {
                                Apps.Components.BPL.Projects.View(project);
                            }
                        }
                    ],
                    fields: [
                        Apps.Grids.GetField('ProjectID'),
                        Apps.Grids.GetField('ProjectName'),
                        Apps.Grids.GetField('ProjectDescription', 'editor'),
                    ],
                    columns: [
                        Apps.Grids.GetColumn("ProjectID", "ID"),
                        Apps.Grids.GetColumn("ProjectName", "Project Name"),
                        Apps.Grids.GetColumn("ProjectDescription", "Description"),
                    ]
                };

                destinationSelector.html(Apps.Grids.GetTable(settings));

            });

        }
    };
    return Me;
});