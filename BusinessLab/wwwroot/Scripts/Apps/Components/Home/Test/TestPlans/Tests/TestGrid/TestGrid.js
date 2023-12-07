Apps.Define([], function () {
    var Me = {
        Initialize: function (callback) {

            Apps.Data.RegisterMyGET(Me, 'Tests', '/api/Test/GetTests?testPlanId={0}', null, true);

            if (callback)
                callback();
        },
        //Show: function () {
        //    Me.Refresh(function () {
        //        Me.Show();
        //    });
        //},
        Hide: function () {
            
        },
        Refresh: function (callback) {

            
            let selectedTestPlan = Me.Parent.Parent.Data.Gets.TestPlans.Selected;

            Me.Data.Gets.Tests.Refresh([selectedTestPlan.ID], function () {

                let tests = Me.Data.Gets.Tests.Data;

                $.each(tests, function (index, test) {
                    test['RoleIDs'] = [];
                });

                let table = Apps.Grid.GetTable({
                    id: "gridTests",
                    data: tests,
                    title: selectedTestPlan.TestPlanName + ' <span style="color:lightgrey;"> Tests</span>',
                    tableactions: [
                        {
                            text: "Add Test",
                            actionclick: function () {

                                Apps.Components.Apps.Test.TestPlans.Tests.TestGrid.Data.Gets.Tests.Selected = null;
                                Apps.Components.Apps.Test.TestPlans.Tests.Upsert();
                            }

                        }],
                    tablestyle: "background:aliceblue;",
                    rowactions: [
                        {
                            text: "Delete",
                            actionclick: function (td, test, tr) {
                                if (confirm('Are you sure?')) {
                                    test.Archived = true;
                                    Apps.Components.Apps.Test.TestPlans.Tests.TestGrid.Data.Gets.Tests.Selected = test;
                                    Apps.Components.Apps.Test.TestPlans.Tests.Upsert();
                                }
                            }
                        }
                    ],
                    rowbuttons: [
                        {
                            text: "Show Steps",
                            buttonclick: function (input, test, tr) {
                                //$(input).val('Steps (' + test.Steps.length + ')'); // $('#stepid_' + test.TestID).find( + ' div > input:nth-child(1)').val());
                                Apps.Components.Apps.Test.TestPlans.Tests.TestGrid.Data.Gets.Tests.Selected = test;
                                Apps.Components.Apps.Test.TestPlans.Tests.Steps.Show(input, test, tr);
                            }
                        },
                        //{
                        //    text: "Scripts",
                        //    buttonclick: function (input, test, tr) {
                        //        Apps.Components.Apps.Test.TestPlans.Tests.Steps.Show(input, test, tr);
                        //    }
                        //},
                        {
                            text: "Run",
                            buttonclick: function (input, test, tr) {
                                //Apps.Components.Apps.Test.TestPlans.Tests.RunFunctional(test);
                                Apps.Components.Apps.Test.TestPlans.Tests.RunManual(test);
                            }
                        }
                    ],
                    fields: [
                        { name: 'ID' },
                        { name: 'TestPlanID' },
                        {
                            name: 'TestName',
                            editclick: function (td, rowdata, editControl) { },
                            saveclick: function (td, test, input) {
                                test.TestName = $(input).val();
                                Apps.Components.Apps.Test.TestPlans.Tests.TestGrid.Data.Gets.Tests.Selected = test;
                                Apps.Components.Apps.Test.TestPlans.Tests.Upsert();
                            }
                        },
                        { name: 'RoleIDs' },
                        {
                            name: 'TestDescription',
                            editclick: function (td, rowdata, editControl) { },
                            saveclick: function (td, test, input) {
                                test.TestDescription = $(input).val();
                                Apps.Components.Apps.Test.TestPlans.Tests.TestGrid.Data.Gets.Tests.Selected = test;
                                Apps.Components.Apps.Test.TestPlans.Tests.Upsert();
                            }
                        },
                        { name: 'Results' }
                    ],
                    columns: [
                        {
                            fieldname: 'ID',
                            text: 'ID'
                        },
                        {
                            fieldname: 'TestPlanID',
                            text: 'TP ID', hidden: true
                        },
                        {
                            fieldname: 'TestName',
                            text: 'Name',
                            format: function (test) {
                                let result = '&nbsp;&nbsp;&nbsp;&nbsp;';
                                if (test.TestName)
                                    result = '<span style="font-size:17px;font-weight:bold;">' + test.TestName + '</span>';

                                return result;
                            }
                        },
                        {
                            fieldname: 'RoleIDs',
                            text: 'Roles'
                        },
                        {
                            fieldname: 'TestDescription',
                            text: 'Test',
                            format: function (test) {
                                let result = '&nbsp;&nbsp;&nbsp;&nbsp;';
                                if (test.TestDescription)
                                    result = test.TestDescription;

                                return result;
                            }
                        },
                        {
                            fieldname: 'Results',
                            text: 'Results',
                            format: function (test) {
                                return Apps.Components.Apps.Test.TestPlans.Tests.FormatResults(test);
                            }
                        }

                    ]
                });


                if (callback)
                    callback(table);

            });

        }
    };
    return Me;
});