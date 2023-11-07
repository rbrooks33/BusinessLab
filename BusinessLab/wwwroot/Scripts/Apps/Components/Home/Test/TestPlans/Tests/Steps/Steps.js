define([], function () {
    var Me = {
        Initialize: function (callback) {

            //Apps.Data.RegisterGET('StepModel', '/api/Test/GetStepModel');
            //Apps.Data.RegisterMyGET(Me, 'Steps', '/api/Test/GetSteps?testId={0}', null, true);
            //Apps.Data.RegisterMyPOST(Me, 'UpsertStep','/api/Test/UpsertStep', null, true);

            //Apps.Data.StepModel.Refresh();
            callback();
        },
        Show: function (td, test, tr) {

            Me.Parent.TestGrid.Data.Gets.Tests.Selected = test;

            let testRow = $('#Test_Tests_TestRow' + test.ID);

            if (testRow.length == 0) {
               
                Me.GetSteps(test, function (html) {

                    $(tr).after('<tr><td id="Test_Tests_TestRow' + test.ID + '" style="display:none;" colspan="7">' + html + '</td></tr>');

                    testRow = $('#Test_Tests_TestRow' + test.ID);

                    testRow.show(400);

                });
            }
            else
                testRow.detach();

        },
        GetSteps: function (test, callback) {

            Me.Data.Gets.Steps.Refresh([test.ID], function (result) {

                Me.Parent.TestGrid.Data.Gets.Tests.Selected = test;

                let sortedSteps = Enumerable.From(Me.Data.Gets.Steps.Data).OrderBy(function (s) { return s.Order }).ToArray();

                let table = Apps.Grid.GetTable({
                    id: "gridSteps",
                    data: sortedSteps,
                    title: test.TestName + ' <span style="color:lightgrey;"> Steps</span>',
                    tableactions: [
                        {
                            text: "Add Step",
                            actionclick: function () {
                                Apps.Components.Apps.Test.TestPlans.Tests.Steps.Data.Gets.Steps.Selected = null;
                                Apps.Components.Apps.Test.TestPlans.Tests.Steps.UpsertStep();
                            }

                        }],
                    tablestyle: "background:cornsilk;",
                    rowactions: [
                        {
                            text: "Delete",
                            actionclick: function (td, step, tr) {
                                if (confirm('Are you sure?')) {
                                    step.Archived = true;
                                    Apps.Components.Apps.Test.TestPlans.Tests.Steps.Data.Gets.Steps.Selected = step;
                                    Apps.Components.Apps.Test.TestPlans.Tests.Steps.UpsertStep();
                                }
                            }
                        }

                    ],
                    rowbuttons: [
                        {
                            text: "Edit Script",
                            buttonclick: function (td, step, tr) {
                                Apps.Components.Apps.Test.TestPlans.Tests.Steps.Data.Gets.Steps.Selected = step;
                                Apps.Components.Apps.Test.TestPlans.Tests.Steps.EditTest.Show(step);
                            }
                        },
                        {
                            text: "Run",
                            buttonclick: function (td, step, tr) {
                                Apps.Components.Apps.Test.TestPlans.Tests.Steps.Data.Gets.Steps.Selected = step;
                                Apps.Components.Apps.Test.TestPlans.Tests.Steps.EditTest.Run();
                            }
                        }
                    ],
                    fields: [
                        Me.StepField('ID'),
                        Me.StepField('TestID'),
                        Me.StepField('Order'),
                        Me.StepField('PreConditions'),
                        Me.StepField('Instructions', 'editor'),
                        Me.StepField('Expectations', 'editor'),
                        Me.StepField('Variations'),
                        //Me.StepField('Script'),
                        Me.StepField('Results')
                    ],
                    columns: [
                        Me.StepColumn('ID', 'ID'),
                        Me.StepColumn('Order', 'Order'),
                        Me.StepColumn('PreConditions', 'Pre-Conditions'),
                        Me.StepColumn('Instructions', 'Instructions'),
                        Me.StepColumn('Expectations', 'Expectations'),
                        Me.StepColumn('Variations', 'Variations'),
                        //Me.StepColumn('Script', 'Test Script'),
                        Me.StepColumn('Results', 'Results')
                    ]
                });

                if (callback)
                    callback(table.outerHTML);
            });
        },
        UpsertStep: function () {

            //New
            let step = Apps.Data.StepModel.Data;
            step.TestID = Me.Parent.TestGrid.Data.Gets.Tests.Selected.ID; //selected test populated on edit (see below)

            //Update
            if (Me.Data.Gets.Steps.Selected)
                step = Me.Data.Gets.Steps.Selected;

            Me.Data.Posts.UpsertStep.Refresh(step, null, function () {
                Apps.Components.Apps.Test.TestPlans.Tests.Steps.RefreshSteps();
            });
        },
        RefreshSteps: function (test) {

            let testRow = $('#Test_Tests_TestRow' + Me.Parent.TestGrid.Data.Gets.Tests.Selected.ID);
            if (testRow.length == 1) {

                Me.GetSteps(Me.Parent.TestGrid.Data.Gets.Tests.Selected, function (html) {

                    testRow.html(html);

                });
            }
        },
        FormatResults: function (step) {
            //Get the last run instance for this test plan
            var result = '';
            let results = JSON.parse(step.Results);
            if (results) {
                result += Apps.Util.TimeElapsed(new Date(results.Instance.DateCreated));
                result += '<div style="display:flex;">';
                $.each(results.Runs, function (index, run) {

                    let backgroundColor = 'red';
                    if (run.IsNote) {
                        if (run.Passed)
                            backgroundColor = 'blue';
                        else
                            backgroundColor = 'orange';
                    }
                    if (run.Passed)
                        backgroundColor = 'green';

                    result += '<div title="' + run.Description + '" style="background-color:' + backgroundColor + '; width:15px;height:15px;border-radius:2px;margin:2px;"></div>';
                });
            }
            result += '</div>';
            return result;
        },
        StepField: function(fieldName, editType) {
            {
                //var editType = 'text';
                //if (fieldName === 'Script')
                //    editType = 'codeeditor';
                if (editType == null)
                    editType = "text";

                let fieldObj =
                {
                    name: fieldName,
                    edittype: editType,
                    editclick: function (td, step, editControl) {
                        Apps.Components.Apps.Test.TestPlans.Tests.Steps.StepEdit(step);
                    },
                    saveclick: function (td, step, input) {
                        Apps.Components.Apps.Test.TestPlans.Tests.Steps.StepSave(td, step, input);
                    }
                }
                return fieldObj;
            }

        },
        StepEdit: function (step) {
            let thisStepTests = Enumerable.From(Me.Parent.TestGrid.Data.Gets.Tests.Selected.Data).Where(function (t) { return t.ID == step.TestID }).ToArray();
            if (thisStepTests.length == 1) {
                Me.Parent.TestGrid.Data.Gets.Tests.Selected = thisStepTests[0];
            }
        },
        StepSave: function (td, step, input) {
            let fieldName = $(td).attr('data-fieldname');
            step[fieldName] = $(input).val();
            Me.Data.Gets.Steps.Selected = step;
            Apps.Components.Apps.Test.TestPlans.Tests.Steps.UpsertStep();
        },
        StepColumn: function (fieldName, text) {
            let colObj = {

                fieldname: fieldName,
                text: text,
                format: function (step) {
                    let result = '&nbsp;&nbsp;&nbsp;&nbsp;';
                    if (step[fieldName])
                        result = step[fieldName];

                    if (fieldName === 'Results') {
                        result = Apps.Components.Apps.Test.TestPlans.Tests.Steps.FormatResults(step); 
                    }
                    else if (fieldName === 'Script') {
                        result = '<textarea id="App_TestPlans_Tests_Steps_StepScript' + step.TestStepID + '" style="width:200px;height:50px;"></textarea>';
                    }

                    return result;
                }
            };
            return colObj;
        }
    };
    return Me;
});