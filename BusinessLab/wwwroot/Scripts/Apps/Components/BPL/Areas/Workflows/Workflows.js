Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        SelectedWorkflow: null,
        ParentName: '',
        Data: null,
        Selector: null,
        Initialize: function (callback) {
            callback();
        },
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
                    Apps.Components.BPL.Areas.Workflows.Save(arguments[0]);
                },
                tableactions: [
                    {
                        text: 'Add Workflow',
                        actionclick: function () {
                            Apps.Components.BPL.Areas.Workflows.Add();
                        }
                    }
                ],
                rowbuttons: [
                    {
                        text: 'Steps',
                        buttonclick: function () {
                            Apps.Grids.ShowChildren('Steps', 'WorkflowID', 'WorkflowName', arguments[1], arguments[2], Apps.Components.BPL.Areas.Workflows.SetSteps);
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
        GetAllWorkflows: function (callback) {
            Apps.Data.Execute("GetWorkflows", [], function (result) {
                callback(result.Data);
            });

        },
        GetAllWorkflowLogs: function (workflowId, callback) {
            Apps.Data.Execute("GetAllWorkflowLogs", [{ Name: 'WorkflowID', Value: workflowId.toString() }], function (result) {
                callback(result.Data);
            });

        },
        GetWorkflowLogDetail: function (workflowId, severityId, callback) {
            //let areaLogs = Me.Data.WorkflowLogs;
            Apps.Data.Execute("GetWorkflowLogDetail", [
                { Name: 'WorkflowID', Value: workflowId.toString() },
                { Name: 'SeverityID', Value: severityId.toString() }
            ], function (result) {
                callback(result.Data);
            });

        },
        Get: function (callback) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetWorkflows"), function (data) {
                callback(data);
            });

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

            let args = { Params: [ { Name: 'RequestName', Value: 'SaveWorkflow' } ], Data: workflow };

            post.Refresh(args, [], function () {

                if (post.Success) {
                    let index = Me.Data.findIndex(w => w.WorkflowID == workflow.WorkflowID);
                    Me.Data[index] = workflow;
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

            let data = Enumerable.From(Me.Steps.Model.Steps).Where(w => w.WorkflowID == parent[parentIdFieldName]).ToArray();

            Me.Steps.WorkflowID = parent[parentIdFieldName];
            Me.Steps.SetHTML(parentNameFieldName, data, $('#' + childCellId));
        },
        Edit: function (workflowId) {

            let workflow = Enumerable.From(Me.Model.Workflows).Where(w => w.WorkflowID == workflowId).ToArray()[0];
            Me.EditWorkflow.Show(workflow);

        },
        Data: {
            WorkflowLogs: []
        },
        Model: {
            Workflows:[]
        },
        Controls: {

        }

    };
    return Me;
})