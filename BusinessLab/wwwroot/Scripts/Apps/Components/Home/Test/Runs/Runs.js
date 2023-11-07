define([], function () {
    var Me = {
        Initialize: function (callback) {
        //    Apps.Data.RegisterGET('TestRunInstances', 'api/TestRun/GetTestRunInstances');
        //    Apps.Data.RegisterGET('TestRunInstanceRuns', 'api/TestRun/GetTestRuns?testRunInstanceId={0}');
        //    Apps.Data.RegisterGET('TestRunTestSteps', 'api/Test/GetSteps?testId={0}');
        //    Apps.Data.RegisterGET('TestRunTest', 'api/Test/GetTest?testId={0}');
        //    Apps.Data.RegisterGET('TestRunModel', 'api/TestRun/GetTestRunModel');
        //    Apps.Data.RegisterGET('TestRunInstanceModel', 'api/TestRun/GetTestRunInstanceModel');

        //    Apps.Data.RegisterPOST('UpsertTestRun', 'api/TestRun/UpsertTestRun');
        //    Apps.Data.RegisterPOST('UpsertTestRunInstance', '/api/TestRun/UpsertTestRunInstance');

        //    Apps.Data.TestRunModel.Refresh();
        //    Apps.Data.TestRunInstanceModel.Refresh();
            callback();
        },
        Show: function (newRunInstanceTypeId, uniqueId) {

            Me.UI.Show(400);
            Me.UI.Templates.Test_Runs_Template.Show(400);

            //Get instances
            Apps.Data.TestRunInstances.Refresh(null, function () {

                let table = '';
                table += '<table>';
                table += '<tr>';
                table += '<td class="tdheaderstyle"></td>';
                table += '<td class="tdheaderstyle">ID</td>';
                table += '<td class="tdheaderstyle">Type</td>';
                table += '<td class="tdheaderstyle">Unique ID</td>';
                table += '<td class="tdheaderstyle">Created</td>';
                table += '</tr>';

                $.each(Apps.Data.TestRunInstances.Data, function (index, tri) {

                    let triType = '';
                    switch (tri.Type) {
                        case 1: triType = 'Test Plan'; break;
                        case 2: triType = 'Test'; break;
                        case 3: triType = 'Step'; break;
                    }

                    table += '<tr>';
                    table += '<td>';
                    table += '  <div class="btn-group">';
                    table += '    <div class="btn btn-success" onclick="Apps.Components.Apps.Test.Runs.ShowRunInstance(' + tri.ID + ');">Show</div>';
                    if(tri.Type == 2) //for now only tests
                        table += '    <div class="btn btn-success" onclick="Apps.Components.Apps.Test.Runs.NewRunInstance(' + tri.Type + ', ' + tri.UniqueID + ');">New</div>';
                    table += '  </div>';
                    table += '</td>';
                    table += '<td>' + tri.ID + '</td>';
                    table += '<td>' + triType + '</td>';
                    table += '<td>' + tri.UniqueID + '</td>';
                    table += '<td>' + Apps.Util.TimeElapsed(new Date(tri.DateCreated)) + '</td>';
                    table += '</tr>';

                });

                table += '<tr>';
                table += '<td>';
                table += '</td>';
                table += '</tr>';

                table += '</table>';

                $('#divTestRunInstances').html(Me.UI.Templates.Test_Runs_TestRunInstances_Template.HTML([table])); //Put in top level placeholder

            });

            //Use run instance type to set up a new run instance for given type
            if (newRunInstanceTypeId) {

                if (newRunInstanceTypeId == 2) //test
                {
                    Me.ShowNewTestRun(newRunInstanceTypeId, uniqueId);
                }
            }

        },
        ShowNewTestRun: function (newRunInstanceTypeId, testId) {

            Apps.Data.TestRunTest.Refresh([testId], function () {

                var test = Apps.Data.TestRunTest.Data[0];

                Apps.Data.TestRunTestSteps.Refresh([testId], function () {
                    Me.RefreshTestRun(newRunInstanceTypeId, test, Apps.Data.TestRunTestSteps.Data);
                });
            });

        },
        RefreshTestRun: function (testRunInstanceTypeId, test, testSteps) {

            let runTable = '';
            runTable += '<h3>' + test.TestName + '</h3>';
            runTable += '<table>';
            runTable += '<tr>';
            runTable += '<td class="tdheaderstyle">Order</td>';
            runTable += '<td class="tdheaderstyle">Step</td>';
            runTable += '<td class="tdheaderstyle">Expected</td>';
            runTable += '</tr>';

            $.each(testSteps, function (index, s) {

                runTable += '<tr>';
                runTable += '<td>' + s.Instructions + '</td>';
                runTable += '<td>' + s.Expectations + '</td>';
                runTable += '<td style="text-align:center;">';
                runTable += '  <div class="btn-group">';
                if (s.Tested) {
                    if (s.Passed)
                        runTable += '<div style="background-color:green;border-radius:3px;width:27px;">&nbsp;</div>';
                    else
                        runTable += '<div style="background-color:red;border-radius:3px;width:27px;">&nbsp;</div>';
                }
                else {
                    runTable += '    <div class="btn btn-success" onclick="Apps.Components.Apps.Test.Runs.Pass(' + testRunInstanceTypeId + ', ' + test.ID + ', \'' + test.TestName + '\', ' + s.ID + ');">Pass</div>';
                    runTable += '    <div class="btn btn-danger" onclick="Apps.Components.Apps.Test.Runs.Fail(' + testRunInstanceTypeId + ', ' + test.ID + ', \'' + test.TestName + '\', ' + s.ID + ');">Fail</div>';
                }
                runTable += '  </div>';
                runTable += '</td>';
                runTable += '</tr>';

            });

            runTable += '<tr>';
            runTable += '<td>';
            runTable += '</td>';
            runTable += '</tr>';
            runTable
            runTable += '</table>';

            $('#divTestRunInstanceDetail').html(Me.UI.Templates.Test_Runs_NewTestRunInstance_Template.HTML([runTable, testRunInstanceTypeId, test.ID]));

        },
        NewRunInstance: function (runInstanceTypeId, uniqueId) {
            Me.Show(runInstanceTypeId, uniqueId);
        },
        ShowRunInstance: function (runInstanceId) {

            Apps.Data.TestRunInstanceRuns.Refresh([runInstanceId], function () {

                let table = '';
                table += '<table>';
                table += '<tr>';
                table += '<td class="tdheaderstyle">Run ID</td>';
                table += '<td class="tdheaderstyle">Step ID</td>';
                table += '<td class="tdheaderstyle">Passed</td>';
                //table += '<td class="tdheaderstyle">Created</td>';
                table += '</tr>';

                $.each(Apps.Data.TestRunInstanceRuns.Data, function (index, tri) {

                    let passedColor = 'green';
                    if (!tri.Passed)
                        passedColor = 'red';

                    table += '<tr>';
                    //table += '<td><div class="btn btn-success" onclick="Apps.Components.Apps.Test.Runs.ShowRunInstance(' + tri.ID + ');">Show</div></td>';
                    table += '<td>' + tri.TestRunID + '</td>';
                    table += '<td>' + tri.TestStepID + '</td>';
                    table += '<td><div style="background-color:' + passedColor + ';border-radius:3px;">&nbsp;</div></td>';
                    //table += '<td>' + Apps.Util.TimeElapsed(new Date(tri.DateCreated)) + '</td>';
                    table += '</tr>';

                });

                table += '<tr>';
                table += '<td>';
                table += '</td>';
                table += '</tr>';

                table += '</table>';

                $('#divTestRunInstanceDetail').html(Me.UI.Templates.Test_Runs_TestRunInstanceRuns_Template.HTML([table]));

            });
        },
        Pass: function (testRunInstanceTypeId, testId, testName, stepId) {
            //If someone is calling this it is because they are
            //showing a new instance
            let test = Apps.Data.TestRunTest.Data[0];
            let runSteps = Apps.Data.TestRunTestSteps.Data;
            let step = Enumerable.From(runSteps).Where(function (s) { return s.ID == stepId }).ToArray()[0];
            step['Tested'] = true;
            step.Passed = true;
            Me.RefreshTestRun(testRunInstanceTypeId, test, runSteps);
        },
        Fail: function (testRunInstanceTypeId, testId, testName, stepId) {
            let test = Apps.Data.TestRunTest.Data[0];
            let runSteps = Apps.Data.TestRunTestSteps.Data;
            let step = Enumerable.From(runSteps).Where(function (s) { return s.ID == stepId }).ToArray()[0];
            step['Tested'] = true;
            step.Passed = false;
            Me.RefreshTestRun(testRunInstanceTypeId, test, runSteps);
        },
        CreateRunInstance: function (newRunInstanceTypeId, uniqueId) {

            let runSteps = Apps.Data.TestRunTestSteps.Data;
            let newRunInstance = Apps.Data.TestRunInstanceModel.Data;

            newRunInstance.Type = newRunInstanceTypeId;
            newRunInstance.UniqueID = uniqueId;

            Apps.Data.Post('UpsertTestRunInstance', newRunInstance, function (result) {

                if (result.Success) {

                    let newTestInstanceId = result.Data.ID;

                    $.each(runSteps, function (index, runStep) {

                        let newTestRun = Apps.Data.TestRunModel.Data;
                        newTestRun.TestStepID = runStep.ID;
                        newTestRun.TestID = runStep.TestID;
                        newTestRun.TestRunInstanceID = newTestInstanceId;
                        newTestRun.Passed = runStep.Passed;

                        Apps.Data.Post('UpsertTestRun', newTestRun, function (result) {

                        });

                    });
                }

            });

            //$.each(runSteps, function (index, step) {

            //    let newTestRun = Apps.Data.TestRunModel.Data[0];

            //    newTestRun

            //    Apps.Data.Post('UpsertTestPlan', newTestRun, function () {

            //    });

            //});

        },
        Close: function () {
            Me.UI.Templates.Test_Runs_Template.Hide(400);
        }
    }
    return Me;
});