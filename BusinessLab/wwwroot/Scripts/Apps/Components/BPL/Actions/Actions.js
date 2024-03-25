Apps.Define(['./ActionsControls.js'], function (controls) {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Data.GlobalPOST,
        Controls: controls.Controls,
        Model: controls.Model,
        SqlEditor: null,
        CSEditor: null,
        CMDEditor: null,
        PSEditor: null,
        SelectedAction: null,
        Initialize: function (callback) {

            //Me.UI.Drop(); //This allows auto-binding to see me
            Me.Resize();
            $(window).resize(Me.Resize);
            if (callback)
                callback();
        },
        Resize: function () {
            if (Me.SqlEditor)
                Me.SqlEditor.resize();
            if (Me.CSEditor)
                Me.CSEditor.resize();
            if (Me.CMDEditor)
                Me.CMDEditor.resize();
            if (Me.PSEditor)
                Me.PSEditor.resize();
        },
        Show: function () {

            Me.UI.Drop();
            Me.UI.HideAll(); //Hides all but me and debug

            Apps.BindElement('ActionsTable', Me);
            //Apps.BindHTML(Me.UI.Selector, Me);

            Apps.Components.Helpers.Debug.UI.Show();
            Me.Root.ShowHeroHeader();

        },
        GetAllActions: function (callback) {
            Apps.Data.Execute("GetAllActions", [], function (result) {
                Me.Model.Actions = result.Data;
                callback(result.Data);
            });
        },
        GetAllActionLogs: function (actionId, callback) {
            Apps.Data.Execute("GetAllActionLogs",
                [{ Name: 'ActionID', Value: actionId.toString() }],
                function (result) {
                    callback(result.Data);
                });
        },
        GetActionLogDetail: function (actionId, areaId, severityId, callback) {
            //let areaLogs = Me.Data.WorkflowLogs;
            Apps.Data.Execute("GetActionLogDetail", [
                { Name: 'ActionID', Value: actionId.toString() },
                { Name: 'AreaID', Value: areaId.toString() },
                { Name: 'SeverityID', Value: severityId.toString() }
            ], function (result) {
                callback(result.Data);
            });

        },
        GetWorkflowActions: function (callback) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetWorkflowActions"), function (result) {
                Me.Model.WorkflowActions = result.Data;
                callback(result.Data);
            });

        },
        GetAreaActions: function (callback) {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetAreaActions"), function (data) {
                callback(data);
            });

        },
        Edit: function (action) {
            Me.Model.EditedAction = action;
            let html = Me.UI.Templates.BPL_Actions_EditPage_Template.HTML([action.ActionID, action.ActionName, action.UniqueID]);
            Apps.OpenDialog(Me, 'BPL_Actions_Edit_Dialog', 'Edit Dialog', html);

            switch (action.EditorType) {
                case 'sql': Me.Controls.EditorTypeRadioSQL.Clicked(); break;
                case 'cs': Me.Controls.EditorTypeRadioCS.Clicked(); break;
                case 'cmd': Me.Controls.EditorTypeRadioCMD.Clicked(); break;
                case 'ps': Me.Controls.EditorTypeRadioPS.Clicked(); break;
            }
        },
        Add: function () {
            Apps.Data.Execute("AddAction", [], function (result) {
                  Me.Show();
            });
        },

        Save: function (action) {

            action.RepeatQuantity = action.RepeatQuantity ? action.RepeatQuantity : 0;
            action.RepeatIntervalSeconds = action.RepeatIntervalSeconds ? action.RepeatIntervalSeconds : 0;

            let result = new Apps.Result2();
            result.AddDataParams(action);

            Apps.Data.Execute('SaveAction', result.Params, function (result) {

                //Find row and update
                let row = Enumerable.From(Me.Model.Actions).Where(a =>  a.ActionID == action.ActionID).ToArray();
                if (row.length == 1) {
                    row[0] = action;
                    Me.Controls.BPLActionsHomePage.Refresh(); // Me.ProjectTable.Create(Me.Controls.ProjectsTable.Selector);
                    Apps.Notify('success', 'Action updated.');
                }

            }, null, result.Data);

        },

        ////Add: function () {

        ////    let post = Apps.Components.Home.Main;

        ////    let myargs = {
        ////        Params: [
        ////            { Name: "RequestName", Value: "AddAction" }
        ////        ]

        ////    };

        ////    post.Refresh(myargs, [], function () {

        ////        if (post.Success) {
        ////            Apps.Components.Helpers.Actions.GetActions();
        ////            Apps.Notify('success', 'Action added!');
        ////        }
        ////        else {
        ////            Apps.Components.Home.HandleError(post.Result);
        ////        }
        ////    });
        ////},
        TestCode: function () {

            let action = Me.Model.EditedAction;
            let args = Apps.Data.GetPostArgs('TestActionCode');
            args.Params.push({ Name: 'ActionID', Value: action.ActionID.toString() });

            switch (Me.Model.EditorType) {

                case 'PS':

                    args.Data = {
                        ActionID: action.ActionID.toString(),
                        Code: escape(Me.PSEditor.getValue())
                    };

                    break;

                case 'SQL':

                    args.Data = {
                        ActionID: action.ActionID.toString(),
                        Code: Me.SqlEditor.getValue()
                    };

                    break;

                case 'CSharp':

                    args.Data = {
                        ActionID: action.ActionID.toString(),
                        Code: Me.CSEditor.getValue()
                    };

            }
            Apps.Data.ExecutePostArgs(args, function (post) {

                Me.Controls.ActionSaveResult.Selector.val(JSON.stringify(post.Result));

                if (post.Result.Success && post.Result.FailMessages.length == 0) {

                    if (Me.Model.EditedAction.EditorType == 'ps') {
                        Me.Controls.ActionSaveResult.Selector.val(JSON.stringify(post.Result.SuccessMessages) + JSON.stringify(post.Result.FailMessages));
                    }
                    else if (Me.Model.EditedAction.EditorType == 'sql') {
                        let html = Apps.Components.Helpers.Controls.QuickTable.GetTable(post.Data);
                        Me.Controls.ActionOutput.Selector.html(html);
                    }
                    else if (Me.Model.EditedAction.EditorType == 'cs') {
                        Me.Controls.ActionOutput.Selector.html(post.Data);
                    }
                }

            });

        },
        Run: function (actionId, callback, argParams) {
            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'RunAction' },
                    { Name: 'ActionID', Value: actionId.toString() }
                ]
            };
            if (argParams) {
                $.each(argParams, function (i, a) {
                    args.Params.push(a);
                });
            }
            Apps.Data.ExecutePostArgs(args, function (post) {
                if (post.Success)
                    callback(post.Data);
                else {
                    Apps.Components.BPL.HandleError(post.Result);
                }
            });
        },
        ViewJob: function () {
            Apps.Notify('info', 'TBD');
        },
        EditSteps: function (actionId) {
            //NOTE: Dashboard populates workflows, apps and actions according to what it shows
            //at a later time, each component may load the collection completely
            let action = Enumerable.From(Me.Root.Dashboard2.Model.Actions).Where(a => a.ActionID == actionId).ToArray()[0];

            Me.EditAction.Show(action)


        }
    };
    return Me;
});