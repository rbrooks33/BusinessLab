
Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
       Initialize: function (callback) {
           //Me.UI.Drop();
           Me.Root.ShowHeroHeader();
            callback();
        },
        Show: function () {

            Me.Model = Me.AreasControls.Model;
            Me.Controls = Me.AreasControls.Controls;
            Me.PopulateAreaModels(function () {
                Me.UI.HideAll(); //Hides all but me
                Apps.BindHTML(Me.UI.Selector, Me, true);
            });
        },
        //Returns all area related data
        PopulateAreaModels: function (callback) {
            Apps.Data.Execute("GetAreas", [], function (areas) {
                Me.Model.Areas = areas.Data;
                Apps.Data.Execute("GetWorkflows", [], function (workflows) {
                    Me.Workflows.Model.Workflows = workflows.Data;
                    Apps.Data.Execute("GetSteps", [], function (steps) {
                        Me.Workflows.Steps.Model.Steps = steps.Data;
                        if (callback)
                            callback();
                    });
                });
            });
        },
        GetAllAreaLogs: function (areaId, callback) {
            Apps.Data.Execute("GetAllAreaLogs",[{ Name: 'AreaID', Value: areaId.toString() } ], function (result) {
                Me.Data.AreaLogs = result.Data;
                callback(result.Data);
            });
        },
        GetAreaLogDetail: function (areaId, severityId, callback) {
            //let areaLogs = Me.Data.AreaLogs;
            Apps.Data.Execute("GetAreaLogDetail", [
                { Name: 'AreaID', Value: areaId.toString() },
                { Name: 'SeverityID', Value: severityId.toString() }
            ], function (result) {
                callback(result.Data);
            });

        },
        GetAllAreas: function (callback) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetAreas"), function (result) {
                callback(result.Data);
            });
        },
        Get: function (callback) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetAreas"), function (data) {
                callback(data);
            });
        },
        Add: function () {
            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'UpsertArea' },
                    { Name: 'AreaID', Value: '0' }
                ],
                Data: {
                    AreaID: '0'
                }
            };
            Me.Post.Refresh(args, [], function () {
                if (Me.Post.Success) {
                    Apps.Notify('success', 'New Area added!');
                }
                else {
                    Me.Root.HandleError(Me.Post.Result);
                }
            }); 
        },
        Save: function (obj, fieldName) {

        },
        Configuration: {
            
        },
        SetWorkflows: function (parent, parentIdFieldName, parentNameFieldName, childCellId) {

            //CUSTOM CODE TO SET DATA TO CHILD CELL:
            Me.Model.SelectedAreaID = parent[parentIdFieldName];

            let data = Enumerable.From(Me.Workflows.Model.Workflows).Where(w => w.AreaID == parent[parentIdFieldName]).ToArray();

            Me.Workflows.SetHTML(parentNameFieldName, data, $('#' + childCellId));
        },
        Data: {
            AreaLogs: []
        },
        Model: {
            Areas:[]
        }

        //ViewAreaWorkflows: function (areaId) {

        //    let rowHtml = '';

        //    let workflows = [];
        //    $.each(Me.Model.Areas, function (i, a) {
        //        $.each(a.Workflows, function (i, w) {
        //            if (a.AreaID == areaId)
        //                workflows.push(w);
        //        });
        //    });

        //    $.each(workflows, function (i, w) {
        //        rowHtml += Me.UI.Templates.Workflow_Row.HTML([w.WorkflowID, w.WorkflowName]);
        //    });

        //    let tableHtml = Me.UI.Templates.Workflow_Table.HTML([rowHtml]);

        //    $('#areaworkflows_' + areaId).html(tableHtml);

        //    if ($('#areaworkflows_' + areaId).is(':visible'))
        //        $('#areaworkflows_' + areaId).hide(400);
        //    else
        //        $('#areaworkflows_' + areaId).show(400);
        //},
        //ViewWorkflowSteps: function (workflowId) {


        //    let rowHtml = '';
        //    let steps = [];
        //    $.each(Me.Model.Areas, function (i, a) {
        //        $.each(a.Workflows, function (i, w) {

        //            if (w.WorkflowID == workflowId) {
        //                $.each(w.Steps, function (i, s) {
        //                    steps.push(s);
        //                });
        //            }
        //        });
        //    });

        //    $.each(steps, function (i, s) {
        //        rowHtml += Me.UI.Templates.Step_Row.HTML([s.StepID, s.StepName]);
        //    });

        //    let tableHtml = Me.UI.Templates.Step_Table.HTML([rowHtml]);

        //    $('#workflowsteps_' + workflowId).html(tableHtml);

        //    if ($('#workflowsteps_' + workflowId).is(':visible'))
        //        $('#workflowsteps_' + workflowId).hide(400);
        //    else
        //        $('#workflowsteps_' + workflowId).show(400);
        //},

    };
    return Me;
});