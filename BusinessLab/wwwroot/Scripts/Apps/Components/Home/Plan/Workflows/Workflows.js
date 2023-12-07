Apps.Define([], function () {
    var Me = {
        SelectedWorkflow: null,
        ParentName: '',
        Data: null,
        Selector: null,
        SetHTML: function (parentNameFieldName, data, selector) {

            selector.html(Me.GetHTML(parentNameFieldName, data));

            Me.Selector = selector;
            Me.Data = data;
            Me.ParentName = parentNameFieldName;
        },
        GetHTML: function (parentNameFieldName, data) {

            Me.Data = data;
            Me.ParentName = parentNameFieldName;

            var settings =
            {
                id: "Plan_Workflow_Table",
                data: data,
                title: parentNameFieldName + " Workflows",
                tablestyle: "margin:50px;width:85%;",
                savecallback: function () {
                    Apps.Components.Home.Plan.Workflows.Save(arguments[0]);
                },
                tableactions: [
                    {
                        text: 'Add Workflow',
                        actionclick: function () {
                            Apps.Components.Home.Plan.Workflows.Add();
                        }
                    }
                ],
                rowbuttons: [
                    {
                        text: 'Steps',
                        buttonclick: function () {
                            Apps.Grids.ShowChildren('Steps', 'StepID', 'WorkflowName', arguments[1], arguments[2], Apps.Components.Home.Plan.Workflows.SetSteps);
                        }
                    }
                ],
                fields: [
                    Apps.Grids.GetField('WorkflowName'),
                    Apps.Grids.GetField('WorkflowDescription', 'editor')
                ],
                columns: [
                    Apps.Grids.GetColumn("WorkflowName", "Workflow"),
                    Apps.Grids.GetColumn("WorkflowDescription", "Description")
                ]
            };

            return Apps.Grids.GetTable(settings);
        },
        Refresh: function () {
            //TODO: Depends on having called "Set"
            Me.SetHTML(Me.ParentName, Me.Data, Me.Selector);
        },
        Add: function () {
                let post = Apps.Components.Home.Main;

                let myargs = {
                    Params: [
                        { Name: "RequestName", Value: "AddWorkflow" },
                        { Name: "AreaID", Value: Me.Parent.Areas.SelectedAreaID.toString() }
                    ]

                };

                post.Refresh(myargs, [], function () {

                    if (post.Success) {
                        //Apps.Components.Helpers.Actions.GetActions();
                        Apps.Notify('success', 'Workflow added!');
                    }
                    else {
                        Apps.Components.Home.HandleError(post.Result);
                    }
                });

        },
        Save: function (workflow) {

            let post = Apps.Components.Home.Main;

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'SaveWorkflow' }
                ],
                Data: workflow
            };

            let index = Me.Data.findIndex(w => w.WorkflowID == workflow.WorkflowID);
            Me.Data[index] = workflow;

            post.Refresh(args, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Saved! ');
                    Me.Refresh();
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });

        },
        SetSteps: function (parent, parentIdFieldName, parentNameFieldName, childCellId) {

            //CUSTOM CODE TO SET DATA TO CHILD CELL:

            let data = Enumerable.From(Me.Parent.StepList).Where(w => w.WorkflowID == parent['WorkflowID']).ToArray();

            Me.Parent.Steps.WorkflowID = parent['WorkflowID'];
            Me.Parent.Steps.SetHTML(parentNameFieldName, data, $('#' + childCellId));
        }

    };
    return Me;
})