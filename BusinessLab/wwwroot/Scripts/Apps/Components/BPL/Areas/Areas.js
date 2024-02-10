
Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
       Initialize: function (callback) {
           Me.UI.Drop();
           Me.Root.ShowHeroHeader();
            callback();
        },
        Show: function () {

            Me.UI.HideAll(); //Hides all but me
            Apps.BindHTML(Me.UI.Selector, Me, true);
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
            GetAreasActionID: 27
        },
        Model: {
            AreasHTML: '',
            SelectedAreaID: 0,
            Areas: [],
            Workflows: [],
            Steps: [],
            SelectedConnectionID: 0
        },
        Controls: {
            AreasHTML: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {

                    let that = this;
                    Me.Root.Actions.Run(Me.Configuration.GetAreasActionID, function (data) {

                        Me.Model.Areas = data;

                        var settings =
                        {
                            id: "Plan_Areas_Table",
                            data: Me.Model.Areas,
                            title: "Areas",
                            tablestyle: "padding-left:50px;padding-right:50px;",
                            savecallback: function (obj, fieldName) {

                                let args = {
                                    Params: [
                                        { Name: 'RequestName', Value: 'UpsertArea' },
                                        { Name: 'AreaID', Value: obj.AreaID.toString() }
                                    ],
                                    Data: obj
                                };

                                let root = Apps.Components.BPL;
                                let me = root.Areas;
                                let selector = me.Controls.Areas.Selector;
                                let mypost = Apps.Components.BPL.Data.Posts.Main;
                                mypost.Refresh(args, [], function () {

                                    if (mypost.Success) {
                                        //Find row and update
                                        let row = Enumerable.From(me.Model.Areas).Where(d => d.AreaID == obj.AreaID).ToArray();
                                        if (row.length == 1) {
                                            row[0] = obj;
                                            me.Controls.Areas.Refresh();
                                            Apps.Notify('success', fieldName + ' updated.');
                                        }
                                        else
                                            Apps.Notify('warning', 'Unable to update ' + fieldName);
                                    }
                                    else {
                                        root.HandleError(mypost.Result);
                                    }
                                });

                                //Apps.Notify('info', 'Saved ' + fieldName);
                            },
                            tableactions: [
                                {
                                    text: 'Add Area',
                                    actionclick: function () {
                                        Apps.Components.BPL.Areas.Add();
                                    }
                                }
                            ],
                            rowbuttons: [
                                {
                                    text: 'Workflows',
                                    buttonclick: function () {
                                        //Pass in distinct table name and field name of parent's unique id
                                        Apps.Grids.ShowChildren('Workflows', 'AreaID', 'AreaName', arguments[1], arguments[2], Apps.Components.BPL.Areas.SetWorkflows);
                                    }
                                }
                            ],
                            fields: [
                                Apps.Grids.GetField('AreaID'),
                                Apps.Grids.GetField('AreaName')
                            ],
                            columns: [
                                Apps.Grids.GetColumn('AreaID', 'ID'),
                                Apps.Grids.GetColumn("AreaName", "Area Name")
                            ]
                        };

                        let tableHtml = Apps.Grids.GetTable(settings);

                        that.Selector.html(tableHtml);
                    });
                }
            }
        },
        SetWorkflows: function (parent, parentIdFieldName, parentNameFieldName, childCellId) {

            //CUSTOM CODE TO SET DATA TO CHILD CELL:
            Me.Model.SelectedAreaID = parent[parentIdFieldName];

            let data = Enumerable.From(Me.Model.Workflows).Where(w => w.AreaID == parent[parentIdFieldName]).ToArray();

            Me.Workflows.SetHTML(parentNameFieldName, data, $('#' + childCellId));
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