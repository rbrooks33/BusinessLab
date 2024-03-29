﻿Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        WorkflowID: 0,
        ParentName: '',
        Data: null,
        Selector: null,
        SelectedStep: null,
        Initialize: function (callback) {

            Apps.Components.Helpers.Dialogs.Register('BPL_Areas_Workflows_Steps_FunctionalSpecs_Dialog', {
                title: 'Step Functional Specifications',
                size: 'full-width',
                templateid: 'templateMyDialog1',
                buttons: [
                    {
                        id: 'Home_Plan_FunctionalSpecs_Dialog_Save',
                        text: 'Save &amp; Close',
                        action: 'Apps.Components.BPL.Areas.Workflows.Steps.SaveFunctionalSpecs()'
                    },
                    {
                        id: 'Home_Plan_FunctionalSpecs_Dialog_Cancel',
                        text: 'Cancel',
                        action: 'Apps.Components.Helpers.Dialogs.Close(\'BPL_Areas_Workflows_Steps_FunctionalSpecs_Dialog\')'
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
                    Apps.Components.BPL.Areas.Workflows.Steps.Save(arguments[0]);
                },
                tableactions: [
                    {
                        text: 'Add Step',
                        actionclick: function () {
                            Apps.Components.BPL.Areas.Workflows.Steps.Add();
                        }
                    }
                ],
                rowbuttons: [
                    {
                        text: 'Functional Specs',
                        buttonclick: function () {
                            Apps.Components.BPL.Areas.Workflows.Steps.ShowFunctionalSpecs(arguments);
                        }
                    }
                ],
                fields: [
                    Apps.Grids.GetField('StepID'),
                    Apps.Grids.GetField('StepName'),
                    Apps.Grids.GetField('StepDescription', 'editor'),
                    Apps.Grids.GetField('FunctionalSpecs', 'editor'),
                    Apps.Grids.GetField('StepOrder')
                ],
                columns: [
                    Apps.Grids.GetColumn("StepID", "ID"),
                    Apps.Grids.GetColumn("StepName", "Step"),
                    Apps.Grids.GetColumn("StepDescription", "Description"),
                    Apps.Grids.GetColumn('FunctionalSpecs', 'Functional Specifications'),
                    Apps.Grids.GetColumn('StepOrder', 'Order')
                ]
            };

            return Apps.Grids.GetTable(settings);
        },
        Refresh: function () {
            //TODO: Depends on having called "Set"
            Me.SetHTML(Me.ParentName, Me.Data, Me.Selector);
        },
        Get: function (callback) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetSteps"), function (data) {
                callback(data);
            });

        },

        Save: function (step) {

            step.StepDescription = step.StepDescription ? step.StepDescription : '[edit]';

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'SaveStep' },
                    { Name: 'StepID', Value: step.StepID.toString() }
                ],
                Data: JSON.stringify(step)
            };

            let index = Me.Data.findIndex(s => s.StepID == step.StepID);
            Me.Data[index] = step;

            Me.Post.Refresh(args, [], function () {

                if (Me.Post.Success) {
                    Apps.Notify('success', 'Saved! ');
                    Me.Refresh();
                }
                else {
                    Me.Root.HandleError(Me.Post.Result);
                }
            });

        },
        Add: function () {

            let myargs = {
                Params: [
                    { Name: "RequestName", Value: "AddStep" },
                    { Name: "WorkflowID", Value: Me.WorkflowID.toString() }
                ]

            };

            Me.Post.Refresh(myargs, [], function () {

                if (Me.Post.Success) {
                    Apps.Notify('success', 'Step added!');
                    Me.Refresh();
                }
                else {
                    Me.Root.HandleError(post.Result);
                }
            });
        },
        ShowFunctionalSpecs: function (args) {

            Me.SelectedStep = args[1];

            let specs = Me.UI.Templates.FunctionalSpecs.HTML([Me.SelectedStep.FunctionalSpecs]);
            Apps.Components.Helpers.Dialogs.Content('BPL_Areas_Workflows_Steps_FunctionalSpecs_Dialog', specs);
            Apps.Components.Helpers.Dialogs.Open('BPL_Areas_Workflows_Steps_FunctionalSpecs_Dialog');

            $('#Home_Plan_Steps_FunctionalSpec_Editor').jqte();

            //HACKZILLA: Make dialogs more configurable
            let dialogTitle = $('#BPL_Areas_Workflows_Steps_FunctionalSpecs_Dialog > div > div > div.dialog-header > table > tbody > tr:nth-child(1) > td:nth-child(1) > h5');
            dialogTitle.text(Me.SelectedStep.StepName + ' Functional Specs');
        },
        SaveFunctionalSpecs: function (args) {
            Me.SelectedStep.FunctionalSpecs = $('#myDialog_BPL_Areas_Workflows_Steps_FunctionalSpecs_Dialog > div > div > div.dialog-body > div > div.jqte_editor').html();
            Me.Save(Me.SelectedStep);
            Apps.Components.Helpers.Dialogs.Close('BPL_Areas_Workflows_Steps_FunctionalSpecs_Dialog');

        },
        Model: {
            Steps:[]
        },
        Controls: {

        }
    };
    return Me;
})