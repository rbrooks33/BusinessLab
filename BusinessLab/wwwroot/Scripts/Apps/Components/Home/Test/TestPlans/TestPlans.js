Apps.Define(['./ResultsInterval/ResultsInterval.js'], function (resultsinterval) {
    var Me = {
        ResultsInterval: resultsinterval,
        CurrentTestPlanRow: null,
        Initialize(callback) {

            Me.UI.Show(400);

            callback();
            //Data sources
            //Apps.Data.RegisterGET('TestPlan', '/api/Test/GetTestPlan?testPlanId={0}')
            //Apps.Data.RegisterGET('TestPlanModel', '/api/Test/GetTestPlanModel');
            //Apps.Data.RegisterGET('RunFunctional', '/api/TestRun/RunFunctional?appId={0}&type={1}&uniqueId={2}');
            //Apps.Data.RegisterGET('LatestResults', '/api/TestRun/GetLatestResults?type={0}&uniqueId={1}');
            //Apps.Data.RegisterPOST('UpsertTestPlan', '/api/Test/UpsertTestPlan');

            //Apps.Data.RegisterMyGET(Me, 'TestPlans', '/api/Test/GetTestPlans?appId={0}', null, true);
            //Apps.Data.RegisterMyPOST(Me, 'CloudTestPlans', 'https://appsjs.net/Event?source=GetTestPlans&authType={0}&email={1}', null, false);

            //Apps.Data.TestPlanModel.Refresh();

        },
        IntervalID: null,
        IntervalOn: false,
        RefreshResultSIntervalOn: false,
        Interval: function () {
            if (Me.IntervalOn) {
                //Apps.Notify('info', 'interval happening');
                $('.IntervalIndicatorStyle').css('border-color', 'green');
                $('.IntervalIndicatorStyle').css('background-color', 'green');
                setTimeout(function () { $('.IntervalIndicatorStyle').css('background-color', 'inherit'); }, 400);

                //Run test plan tests
                Me.IntervalOn = false;
                $('#gridTestPlans_Row0_RowButton1').click(); //Click Test Plans Run
            }
        },
        IntervalStart: function() {
            Me.IntervalID = setInterval(Me.Interval, 3000);
            Me.IntervalOn = true;
            $('.IntervalIndicatorStyle').css('border-color', 'green');
        },
        IntervalStop: function () {
            Me.IntervalID = null;
            Me.IntervalOn = false;
            $('.IntervalIndicatorStyle').css('border-color', 'cornflowerblue');
            $('.IntervalIndicatorStyle').css('background-color', 'inherit');
        },
        Show: function () {

            var app = Apps.Data.App.Data[0];

            if (app.IsServer)
                $('#divIsServer').show();

            Me.Data.Gets.TestPlans.Refresh([app.AppID], function () {

                let testPlans = Me.Data.Gets.TestPlans.Data;

                //$.each(testPlans, function (index, tp) {
                //    tp['Results'] = '';
                //});

                let table = Apps.Grid.GetTable({
                    id: "gridTestPlans",
                    data: testPlans,
                    title: app.AppName + ' <span style="color:lightgrey;">Test Plans</span>',
                    tableactions: [
                        {
                            text: "Run",
                            actionclick: function () {
                                Apps.Components.Apps.Test.TestPlans.RunFunctional();
                            }

                        },
                        {
                            text: "Show Runs",
                            actionclick: function () {
                                Apps.Components.Apps.Test.Runs.Show();
                            }

                        },
                        {
                            text: "Add Test Plan",
                            actionclick: function () {
                                Apps.Components.Apps.Test.TestPlans.Data.Gets.TestPlans.Selected = null; //so it will create new
                                Apps.Components.Apps.Test.TestPlans.UpsertTestPlan();
                            }

                        },
                        {
                            text: "Timer On",
                            actionclick: function () {
                                Apps.Components.Apps.Test.TestPlans.IntervalStart();
                            }

                        },
                        {
                            text: "Timer Off",
                            actionclick: function () {
                                Apps.Components.Apps.Test.TestPlans.IntervalStop();
                            }

                        }

                    ],
                    tablestyle: "",
                    rowactions: [
                        {
                            text: "Delete",
                            actionclick: function (td, testPlan, tr) {
                                if (confirm('Are you sure?')) {
                                    testPlan.Archived = true;
                                    Apps.Components.Apps.Test.TestPlans.Data.Gets.TestPlans.Selected = testPlan;
                                    Apps.Components.Apps.Test.TestPlans.UpsertTestPlan();
                                }
                            }
                        },
                        {
                            text: "Refresh Results On",
                            actionclick: function (td, testPlan, tr) {
                                Apps.Components.Apps.Test.TestPlans.ResultsInterval.TheIntervalStart(testPlan, tr);
                            }
                        },
                        {
                            text: 'Refresh Results Off',
                            actionclick: function (td, testPlan, tr) {
                                Apps.Components.Apps.Test.TestPlans.ResultsInterval.TheIntervalStop(testPlan, tr);
                            }
                        },
                        {
                            text: 'Add Test',
                            actionclick: function (td, testPlan, tr) {
                                Apps.Components.Apps.Test.TestPlans.Data.Gets.TestPlans.Selected = testPlan;
                                Apps.Components.Apps.Test.TestPlans.Tests.Upsert();
                            }
                        }

                    ],
                    rowbuttons: [
                        {
                            text: "Tests",
                            buttonclick: function (td, testPlan, tr) {
                                Apps.Components.Apps.Test.TestPlans.Data.Gets.TestPlans.Selected = testPlan;
                                Apps.Components.Apps.Test.TestPlans.ShowTests(testPlan, tr);
                            }
                        },
                        {
                            text: 'Run',
                            buttonclick: function (td, testPlan, tr) {
                                Apps.Components.Apps.Test.TestPlans.RunFunctional(testPlan, tr);
                            }
                        }
                    ],
                    fields: [
                        { name: 'ID' },
                        {
                            name: 'TestPlanName',
                            editclick: function (td, rowdata, editControl) {
                            },
                            saveclick: function (td, testPlan, input) {
                                testPlan.AppID = Apps.Data.App.Data[0].AppID;
                                testPlan.TestPlanName = $(input).val();
                                Apps.Components.Apps.Test.TestPlans.Data.Gets.TestPlans.Selected = testPlan;
                                Apps.Components.Apps.Test.TestPlans.UpsertTestPlan();
                            }
                        },
                        {
                            name: 'TestPlanDescription',
                            editclick: function (td, rowdata, editControl) {
                            },
                            saveclick: function (td, testPlan, input) {
                                testPlan.AppID = Apps.Data.App.Data[0].AppID;
                                testPlan.TestPlanDescription = $(input).val();
                                Apps.Components.Apps.Test.TestPlans.Data.Gets.TestPlans.Selected = testPlan;
                                Apps.Components.Apps.Test.TestPlans.UpsertTestPlan();
                            } },
                        { name: 'Results'}
                    ],
                    columns: [
                        {
                            fieldname: 'ID',
                            text: 'ID'
                        },
                        {
                            fieldname: 'TestPlanName',
                            text: 'Name',
                            format: function (testPlan) {
                                let result = '&nbsp;&nbsp;&nbsp;&nbsp;';
                                if (testPlan.TestPlanName)
                                    result = '<span style="font-size:22px;font-weight:bold;">' + testPlan.TestPlanName + '</span>';

                                return result;
                            }
                        },
                        {
                            fieldname: 'TestPlanDescription',
                            text: 'Description',
                            format: function (testPlan) {
                                let result = '&nbsp;&nbsp;&nbsp;&nbsp;';
                                if (testPlan.TestPlanDescription)
                                    result = '<span>' + testPlan.TestPlanDescription + '</span>';

                                return result;
                            }
                        },
                        {
                            fieldname: 'Results',
                            text: 'Results',
                            format: function (testPlan) {
                                return Apps.Components.Apps.Test.TestPlans.FormatResults(testPlan);
                            }
                        }
                    ]
                });

                $('#App_Test_TemplateContent').html(table.outerHTML);

                $.each(testPlans, function (index, tp) {
                    $('#gridTestPlans_Row' + index + '_RowButton0').val('Show Tests');
                });

                let tpHTML = Apps.Util.GetHTML('Apps_Tests_TestPlan_Template');
                $('#gridTestPlans').before(tpHTML);

            });
        },
        UpsertTestPlan: function () {

            let testPlan = Apps.Data.TestPlanModel.Data;
            if (Me.Data.Gets.TestPlans.Selected)
                testPlan = Me.Data.Gets.TestPlans.Selected;

            testPlan.AppID = Apps.Data.App.Data[0].AppID;

            Apps.PostSync('/api/Test/UpsertTestPlan', JSON.stringify(testPlan), function () {
                Apps.Notify('success', 'Upserted test plan.');
                Apps.Components.Apps.Test.TestPlans.Show();
            });
        },
        //ShowTests: function (testPlan, tr) {
        //    //Me.Data.Gets.TestPlans.Selected = testPlan;
        //    //Me.Tests.Initialize(testPlan.TestPlanName, testPlan.ID, tr, function () {
        //    //Me.CurrentTableRow = tr;
        //    Me.ShowTests(testPlan, tr);
        //    //});
        //},
        //Shows/hides tests. Gets test data on first show.
        ShowTests: function (testPlan, tr) {

            //let selectedTestPlan = Me.Parent.Data.Gets.TestPlans.Selected;

            //let testsRowId = 'Test_Tests_TestPlanRow' + testPlan.ID;
            //let testsRow = $('#' + testsRowId);

            //Uses callback since it might need to populate tests for first time show
            Me.GetTestsRow(testPlan, tr, function (testsRow) {

                if (testsRow.css('display') == 'none' || testsRow.css('display') == undefined)
                    testsRow.show(500);
                else
                    testsRow.hide(500);

            });


        },
        RefreshTests: function () {

            Me.GetTestsHtml(function (html) {

                let testPlan = Me.Data.Gets.TestPlans.Selected; //Populated on "Tests" row button
                Me.GetTestsRow(testPlan, null, function (testsRow) {

                    //Populate with test html
                    testsRow.find('td').html(html);

                });

            });

        },
        GetTestsRow: function (testPlan, tr, callback) {

            //Look for row under Test Plan. If not there, create it. If there, detach it.
            let testPlanRow = tr; // Me.CurrentTableRow;
            let testsRowId = 'Test_Tests_TestPlanRow' + testPlan.ID;
            let testsRow = $('#' + testsRowId);

            //Insert row under test plan if it's not there yet
            if (testsRow.length == 0) {

                Me.GetTestsHtml(function (html) {
                    $(testPlanRow).after('<tr id="' + testsRowId + '" style="display:none;"><td colspan="6">' + html + '</td></tr>');

                    testsRow = $('#' + testsRowId); //Have to select again

                    callback(testsRow);
                });

            }
            else
                callback(testsRow);

            //return testsRow;
        },
        GetTestsHtml: function (callback) {

            Me.Tests.Refresh(function (table) {

                //let row = Me.GetTestsRow()
                //Populate with test html
                //row.find('td').html(table.outerHTML);

                if (callback)
                    callback(table.outerHTML);

            });
        },
        FormatResults: function (testPlan) {
            //Get the last run instance for this test plan
            var result = '';
            let results = JSON.parse(testPlan.Results);
            if (results) {
                result += Apps.Util.TimeElapsed(new Date(results.Instance.DateCreated));
                result += '<div style="display:flex;">';

                let groupedRuns = Enumerable.From(results.Runs).GroupBy('$.TestID').ToArray();

                $.each(groupedRuns, function (index, runGroup) {

                    let stepGroups = Enumerable.From(runGroup.source).GroupBy('$.TestStepID').ToArray();

                    $.each(stepGroups, function (stepGroupIndex, stepGroup) {

                        //Look for only non-note, that is the result
                        let passResult = Enumerable.From(stepGroup.source).Where('$.IsNote == false').ToArray();

                        if (passResult.length == 1) {

                            let backgroundColor = 'red';
                            if(passResult[0].Passed)
                                backgroundColor = 'green';

                            result += '<div title="' + passResult[0].Description + '" style="background-color:' + backgroundColor + '; width:15px;height:15px;border-radius:2px;margin:2px;"></div>';
                        }
                        //else
                        //    Apps.Notify('warning', 'Pass result either zero or more than one for test plan ' + testPlan.ID);

                    });
                });
            }
            result += '</div>';
            return result;  
        },
        RunFunctional: function (tp, tableRow) {
            Apps.Data.RunFunctional.Refresh([Apps.Data.App.Data[0].AppID, 1, tp.ID], function () {
                Apps.Data.TestPlan.Refresh([tp.ID], function () {
                    Me.RefreshResults(Apps.Data.TestPlan.Data, tableRow, function () {
                        if(Me.IntervalID > 0) //Interval is active
                            Me.IntervalOn = true; //Turn interval back on after test run
                    });
                });
            });
        },
        RefreshResults: function (testPlan, tableRow, callback) {

            let rowIndex = $(tableRow).attr('rowindex');
            let resultsCell = $('#gridTestPlans_ViewFormat_Row' + rowIndex + '_ColResults');
            let tpResults = Me.FormatResults(testPlan);

            resultsCell.html(tpResults);

            if (Apps.Data.Tests) {

                //Refresh tests if open
                Apps.Data.Tests.Refresh([testPlan.ID], function () {

                    $.each(Apps.Data.Tests.Data, function (testIndex, test) {

                        let testHTML = Me.Tests.FormatResults(test);

                        let testGridRows = $('#gridTests').find('tr');
                        $.each(testGridRows, function (rowIndex, testGridRow) {

                            let rowDataIndex = $(testGridRow).attr('rowindex');
                            let rowData = $(testGridRow).attr('rowdata');

                            if (rowData) {
                                let testData = JSON.parse(unescape(rowData));
                                if (testData.ID == test.ID) {
                                    //Found row for this test
                                    $('#gridTests_ViewFormat_Row' + rowDataIndex + '_ColResults').html(testHTML);
                                }
                            }

                        });

                        if (Apps.Data.Steps) {
                            //Refresh Steps if open/visible
                            Apps.Data.Steps.Refresh([test.ID], function () {

                                $.each(Apps.Data.Steps.Data, function (stepIndex, step) {


                                    let stepHTML = Me.Tests.Steps.FormatResults(step);
                                    let stepGridRows = $('#gridSteps').find('tr'); //_ViewFormat_Row0_ColResults')

                                    $.each(stepGridRows, function (stepRowIndex, stepGridRow) {

                                        let stepRowDataIndex = $(stepGridRow).attr('rowindex');
                                        let stepRowData = $(stepGridRow).attr('rowdata');

                                        if (stepRowData) {
                                            let stepData = JSON.parse(unescape(stepRowData));
                                            if (stepData.ID == step.ID) {
                                                //Found row for this step
                                                $('#gridSteps_ViewFormat_Row' + stepRowDataIndex + '_ColResults').html(stepHTML);
                                            }
                                        }

                                    });

                                });
                            });
                        }
                    });

                    if (callback)
                        callback();

                });
            }
            else {
                if (callback)
                    callback();
            }
        },
        RunUnits: function () {
            Apps.Get2('api/Test/RunUnits?appId=' + Me.CurrentApp.AppID, function (result) {
                if (result.Success) {
                    Apps.Notify('success', 'Tests run successfully!');
                    let testResult = result.Data;
                    if (testResult.TestsPassed) {
                        Apps.Notify('success', 'All tests (' + testResult.Passed + ') passed!');
                    }
                    else {
                        Apps.Notify('warning', 'Some tests (' + testResult.Failed + ') failed :(');
                    }
                }
                else
                    Apps.Notify('warning', 'Tests run not successful.');
            });
        }
    };
    return Me;
});