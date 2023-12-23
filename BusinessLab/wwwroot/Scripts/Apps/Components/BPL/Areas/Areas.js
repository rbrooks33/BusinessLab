
Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            callback();
        },
        Show: function () {

            Me.UI.HideAll(); //Hides all but me
        },
        ViewAreaWorkflows: function (areaId) {

            let rowHtml = '';

            let workflows = [];
            $.each(Me.Model.Areas, function (i, a) {
                $.each(a.Workflows, function (i, w) {
                    if (a.AreaID == areaId)
                        workflows.push(w);
                });
            });

            $.each(workflows, function (i, w) {
                rowHtml += Me.UI.Templates.Workflow_Row.HTML([w.WorkflowID, w.WorkflowName]);
            });

            let tableHtml = Me.UI.Templates.Workflow_Table.HTML([rowHtml]);

            $('#areaworkflows_' + areaId).html(tableHtml);

            if($('#areaworkflows_' + areaId).is(':visible'))
                $('#areaworkflows_' + areaId).hide(400);
            else
                $('#areaworkflows_' + areaId).show(400);
        },
        ViewWorkflowSteps: function (workflowId) {


            let rowHtml = '';
            let steps = [];
            $.each(Me.Model.Areas, function (i, a) {
                $.each(a.Workflows, function (i, w) {

                    if (w.WorkflowID == workflowId) {
                        $.each(w.Steps, function (i, s) {
                            steps.push(s);
                        });
                    }
                });
            });

            $.each(steps, function (i, s) {
                rowHtml += Me.UI.Templates.Step_Row.HTML([s.StepID, s.StepName]);
            });

            let tableHtml = Me.UI.Templates.Step_Table.HTML([rowHtml]);

            $('#workflowsteps_' + workflowId).html(tableHtml);

            if($('#workflowsteps_' + workflowId).is(':visible'))
                $('#workflowsteps_' + workflowId).hide(400);
            else
                $('#workflowsteps_' + workflowId).show(400);
        },
        Test: function () {
            Apps.OpenDialog(Me, 'test_dialog', 'blah', '<textarea id="myhiya">hiya</textarea>');

            tinymce.init({
                selector: '#myhiya',
                height: 500,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
            });
            //$('#myhiya').tinymce();
        },
        //GetAreasTable: function () {
        //    let html = '';
        //    Apps.Components.Helpers.Controls.QuickTable.GetTable(Me.Model.Areas,
        //        function (row) {
        //            return row.AreaID;
        //        },
        //        function (row) {
        //            return row.AreaName;
        //        });
        //},
        Model: {
            Areas: [
                {
                    AreaID: 1, AreaName: 'area one', Workflows: [
                        {
                            AreaID: 1, WorkflowID: 1, WorkflowName: 'workflow one', Steps: [
                                { WorkflowID: 1, StepID: 1, StepName: 'w one, step 1'}
                            ]
                        },
                        {
                            AreaID: 1, WorkflowID: 2, WorkflowName: 'workflow two', Steps: [
                                { WorkflowID: 1, StepID: 1, StepName: 'w 2, step 1' }                            ]
                        }
                    ]
                },
                {
                    AreaID: 2, AreaName: 'area two', Workflows: [
                        {
                            AreaID: 2, WorkflowID: 3, WorkflowName: 'workflow three', Steps: [
                                { WorkflowID: 1, StepID: 1, StepName: 'w 3, step 1' }                            ]
                        },
                        {
                            AreaID: 2, WorkflowID: 4, WorkflowName: 'workflow four', Steps: [
                                { WorkflowID: 1, StepID: 1, StepName: 'w 4, step 1' }                            ]
                        }
                    ]
                }
            ]

        },
        Controls: {
            Areas: {
                Bound: function () {

                    let rowHtml = '';
                    let actionsHtml = Me.UI.Templates.Areas_ButtonDropdown.HTML();
                    $.each(Me.Model.Areas, function (i, a) {
                        rowHtml += Me.UI.Templates.Area_Row.HTML([a.AreaID, a.AreaName, actionsHtml]);
                    });

                    let tableHtml = Me.UI.Templates.Area_Table.HTML([rowHtml]);

                   this.Selector.html(tableHtml);
                }
            }
        }
    };
    return Me;
});