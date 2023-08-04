define([], function () {
    var Me = {
        WorkflowID: 0,
        ParentName: '',
        Data: null,
        Selector: null,
        SelectedStep: null,
        Initialize: function (callback) {

            Apps.Components.Helpers.Dialogs.Register('Home_Plan_FunctionalSpecs_Dialog', {
                title: 'Step Functional Specifications',
                size: 'full-width',
                templateid: 'templateMyDialog1',
                buttons: [
                    {
                        id: 'Home_Plan_FunctionalSpecs_Dialog_Save',
                        text: 'Save &amp; Close',
                        action: 'Apps.Components.Home.Plan.Steps.SaveFunctionalSpecs()'
                    },
                    {
                        id: 'Home_Plan_FunctionalSpecs_Dialog_Cancel',
                        text: 'Cancel',
                        action: 'Apps.Components.Helpers.Dialogs.Close(\'Home_Plan_FunctionalSpecs_Dialog\')'
                    }

                ]
            });

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
                rowbuttons: [
                    {
                        text: 'Functional Specs',
                        buttonclick: function () {
                            Apps.Components.Home.Plan.Steps.ShowFunctionalSpecs(arguments);
                        }
                    }
                ],
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
        ShowFunctionalSpecs: function (args) {

            Me.SelectedStep = args[1];

            let specs = Me.UI.Templates.FunctionalSpecs.HTML([Me.SelectedStep.FunctionalSpecs]);
            Apps.Components.Helpers.Dialogs.Content('Home_Plan_FunctionalSpecs_Dialog', specs);
            Apps.Components.Helpers.Dialogs.Open('Home_Plan_FunctionalSpecs_Dialog');

            $('#Home_Plan_Steps_FunctionalSpec_Editor').jqte();

            //HACKZILLA: Make dialogs more configurable
            let dialogTitle = $('#myDialog_Home_Plan_FunctionalSpecs_Dialog > div > div > div.dialog-header > table > tbody > tr:nth-child(1) > td:nth-child(1) > h5');
            dialogTitle.text(Me.SelectedStep.StepName + ' Functional Specs');
        },
        SaveFunctionalSpecs: function (args) {
            Me.SelectedStep.FunctionalSpecs = $('#Home_Plan_Steps_FunctionalSpec_Editor').val();
            Me.Save(Me.SelectedStep);
        }
    };
    return Me;
})