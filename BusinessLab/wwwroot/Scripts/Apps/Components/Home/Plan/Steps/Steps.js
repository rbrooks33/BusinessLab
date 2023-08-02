define([], function () {
    var Me = {
        WorkflowID: 0,
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
                id: "Plan_Workflow_Step_Table",
                data: data,
                title: parentNameFieldName + " Steps",
                tablestyle: "margin:50px;width:85%;",
                savecallback: function () {
                    Apps.Components.Home.Plan.Steps.Save(arguments[0]);
                },
                tableactions: [
                    {
                        text: 'Add Step',
                        actionclick: function () {
                            Apps.Components.Home.Plan.Steps.Add();
                        }
                    }
                ],
                //rowbuttons: [
                //    {
                //        text: 'Steps',
                //        buttonclick: function () {
                //            Apps.Components.Helpers.Actions.Edit(arguments);
                //        }
                //    }
                //],
                fields: [
                    Apps.Grids.GetField('StepID'),
                    Apps.Grids.GetField('StepName'),
                    Apps.Grids.GetField('StepDescription', 'editor')
                ],
                columns: [
                    Apps.Grids.GetColumn("StepID", "ID"),
                    Apps.Grids.GetColumn("StepName", "Step"),
                    Apps.Grids.GetColumn("StepDescription", "Description")
                ]
            };

            return Apps.Grids.GetTable(settings);
        },
        Refresh: function () {
            //TODO: Depends on having called "Set"
            Me.SetHTML(Me.ParentName, Me.Data, Me.Selector);
        },
        Save: function (step) {

            let post = Apps.Components.Home.Main;

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'SaveStep' }
                ],
                Data: step
            };

            let index = Me.Data.findIndex(s => s.StepID == step.StepID);
            Me.Data[index] = step;

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
        Add: function () {

            let post = Apps.Components.Home.Main;

            let myargs = {
                Params: [
                    { Name: "RequestName", Value: "AddStep" },
                    { Name: "WorkflowID", Value: Me.WorkflowID.toString() }
                ]

            };

            post.Refresh(myargs, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Step added!');
                    Me.Refresh();
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });
        },

    };
    return Me;
})