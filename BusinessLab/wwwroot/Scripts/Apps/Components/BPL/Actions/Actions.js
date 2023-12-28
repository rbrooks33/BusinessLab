Apps.Define(['./Controls/Editors.js','./Controls/ActionsTable.js'], function (editors, actionsTable) {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Data.GlobalPOST,
        Editors: editors,
        ActionsTable: actionsTable,
        SqlEditor: null,
        CSharpEditor: null,
        CMDEditor: null,
        PSEditor: null,
        SelectedAction: null,
        Initialize: function (callback) {

            Me.UI.Drop(); //This allows auto-binding to see me
            Me.Resize();
            $(window).resize(Me.Resize);
            if (callback)
                callback();
        },
        Resize: function () {
            if (Me.SqlEditor) {
                Me.SqlEditor.resize();
                Me.CSharpEditor.resize();
            }
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me and debug
            Apps.Components.Helpers.Debug.UI.Show();

        },
        Edit: function (action) {

            Me.Model.EditedAction = action;

            let html = Me.UI.Templates.BPL_Actions_EditPage_Template.HTML([action.ActionID, action.ActionName, action.UniqueID]);
            Apps.OpenDialog(Me, 'BPL_Actions_Edit_Dialog', 'Edit Dialog', html);

            $('[data-bind-collection-property="EditorTypes[0]"]').click(); //.prop('checked', true);

        },
        Add: function () {

            let post = Apps.Components.Home.Main;

            let myargs = {
                Params: [
                    { Name: "RequestName", Value: "AddAction" }
                ]

            };

            post.Refresh(myargs, [], function () {

                if (post.Success) {
                    Apps.Components.Helpers.Actions.GetActions();
                    Apps.Notify('success', 'Action added!');
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });
        },
        Save: function (action) {

            let args = Apps.Data.GetPostArgs('SaveAction');
            args.Params.push({ Name: 'ActionID', Value: action.ActionID.toString() });
            args.Data = JSON.stringify(action);

            Apps.Data.ExecutePostArgs(args, function (post) {

                //Find row and update
                let row = Enumerable.From(Me.Model.Actions).Where(a =>  a.ActionID == action.ActionID).ToArray();
                if (row.length == 1) {
                    row[0] = action;
                    Me.Controls.BPLActionsHomePage.Refresh(); // Me.ProjectTable.Create(Me.Controls.ProjectsTable.Selector);
                    Apps.Notify('success', 'Action updated.');
                }

            });

        },
        TestCode: function () {

            let action = Me.Model.EditedAction;
            let args = Apps.Data.GetPostArgs('TestActionCode');
            //args.Params.push({ Name: 'ActionID', Value: action.ActionID.toString() });

            switch (Me.Model.EditedAction.EditorType) {

                case 'PS':

                    args.Data = Data = {
                        ActionID: action.ActionID.toString(),
                        Code: escape(Me.PSEditor.getValue())
                    }

                    break;

                case 'SQL':

                    args.Data = Data = {
                        ActionID: action.ActionID.toString(),
                        Code: Me.SqlEditor.getValue()
                    }

                    break;


            }
            Apps.Data.ExecutePostArgs(args, function (post) {

                if (post.Result.FailMessages.length == 0) {

                    if (Me.Model.EditedAction.EditorType == 'PS') {
                        Me.Controls.EditedAction.ActionSaveResult.Selector.val(JSON.stringify(post.Result.SuccessMessages) + JSON.stringify(post.Result.FailMessages));
                    }
                    else if (Me.Model.EditedAction.EditorType == 'SQL') {
                        let html = Apps.Components.Helpers.Controls.QuickTable.GetTable(post.Data);
                        Me.Controls.EditedAction.ActionOutput.Selector.html(html);
                    }
                }
                else
                    Me.Controls.EditedAction.ActionSaveResult.Selector.val(JSON.stringify(post.Result.FailMessages));
            });
        },
        ViewJob: function () {
            Apps.Notify('info', 'TBD');
        },
        Model: {
            Actions: [],
            ActionTriggerTypes: [
                {
                    Name: 'JS',
                    Code: '',
                    Run: ''
                },
                {
                    Name: 'SQL',
                    Code: '',
                    RunButton: ''
                }
            ],
            BPLActionsHomePage: '',
            EditorTypes: [
                'SQL',
                'CSharp',
                'CMD',
                'PS'
            ],
            EditedAction: {
                UniqueID: '',
                PSEditor: null,
                CMDEditor: null
            },
            SQLEditor: '',
            SampleAction: {
                "ActionID": 1,
                "ActionName": "jlkjl",
                "ActionDescription": "@arg1",
                "EditorType": "csharp",
                "Code": "var tester = 1;",
                "CodeCMD": '',
                "CodePS": '',
                "Sql": "@arg2",
                "VariableDelimiter": "@arg4",
                "UniqueID": "@arg5",
                "IsJob": 1,
                "SuccessActionID": 2,
                "FailActionID": 3,
                "SuccessActionDescription": "@arg8",
                "FailActionDescription": "@arg7",
                "RepeatQuantity": 2,
                "RepeatIntervalSeconds": 5,
                "CronSchedule": "@arg11"
            }
        },
        Controls: {
            Refresh: function () {
                Me.Controls.Actions.Refresh();
            },
            BPLActionsHomePage: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {
                    var thisSelector = this.Selector;
                    Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs('GetActions'), function (post) {

                        Apps.Components.BPL.Actions.Model.Actions = post.Data;

                        thisSelector.html(Apps.Components.BPL.Actions.ActionsTable.Create(post.Data));

                    });

                }
            },
            Actions: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {

                }
            },
            ActionTriggerTypes: {

            },
            EditorTypes: {
                Bound: function () {

                },
                Changed: function (selector, propertyName, newValue, collIndex, isColl, event) {

                    $('.ActionEditor').hide();

                    switch (collIndex) {
                        case '0':
                            Me.Controls.EditedAction.SQLEditor.Selector.show();
                            Me.Controls.EditedAction.EditorTypeTitle.Selector.text('SQL');
                            this.SelectedType = 'SQL';
                            break;
                        case '1':
                            Me.Controls.EditedAction.CSharpEditor.Selector.show();
                            Me.Controls.EditedAction.EditorTypeTitle.Selector.text('C#');
                            this.SelectedType = 'CSharp';
                            break;
                        case '2':
                            Me.Controls.EditedAction.CMDEditor.Selector.show();
                            Me.Controls.EditedAction.EditorTypeTitle.Selector.text('CMD');
                            this.SelectedType = 'CMD';
                            break;
                        case '3':
                            Me.Controls.EditedAction.PSEditor.Selector.show();
                            Me.Controls.EditedAction.EditorTypeTitle.Selector.text('PowerShell');
                            this.SelectedType = 'PS';
                            break;
                    }
                    Me.Resize();
                },
                SelectedType: ''
            },
            EditedAction: {
                Sql: {},
                VariableDelimiter:{ },
                UniqueID: {
                    Bound: function () {

                    }
                },
                SQLEditor: {
                    Bound: function () {

                        //SQL Editor
                        this.Selector[0].id = 'BPLSQLEditor'
                        Me.SqlEditor = ace.edit('BPLSQLEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        Me.SqlEditor.setTheme("ace/theme/sqlserver");
                        var sqlServerMode = ace.require("ace/mode/sqlserver").Mode;
                        Me.SqlEditor.session.setMode(new sqlServerMode());
                        Me.SqlEditor.setValue(this.Data.EditedAction.Sql);

                    }
                },
                CSharpEditor: {
                    Bound: function () {

                        //CSHARP Editor
                        this.Selector[0].id = 'BPLCSharpEditor';
                        Me.CSharpEditor = ace.edit('BPLCSharpEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        var cSharpMode = ace.require("ace/mode/csharp").Mode;
                        Me.CSharpEditor.session.setMode(new cSharpMode());
                        Me.CSharpEditor.setValue(this.Data.EditedAction.Code);

                    }
                },
                CMDEditor: {
                    Bound: function () {

                        //CMD Editor
                        this.Selector[0].id = 'BPLCMDEditor';
                        Me.CMDEditor = ace.edit('BPLCMDEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        let mode = ace.require("ace/mode/batchfile").Mode;
                        Me.CMDEditor.session.setMode(new mode());
                        Me.CMDEditor.setTheme('ace/theme/terminal');
                        Me.CMDEditor.setValue(this.Data.EditedAction.CodeCMD);

                    }
                },
                PSEditor: {
                    Bound: function () {

                        //POWERSHELL Editor
                        this.Selector[0].id = 'BPLPSEditor';
                        Me.PSEditor = ace.edit('BPLPSEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        var mode = ace.require("ace/mode/powershell").Mode;
                        Me.PSEditor.setTheme('ace/theme/tomorrow_night_blue');
                        Me.PSEditor.session.setMode(new mode());
                        Me.PSEditor.setValue(this.Data.EditedAction.CodePS);

                    }
                },
                EditorTypeTitle: {},
                ActionSave: {
                    Bound: function () {
                        this.Selector.text('Save');
                    },
                    Clicked: function () {

                        let action = Me.Model.EditedAction;
                        let sqlValue = Me.SqlEditor.getValue();
                        let csharpValue = Me.CSharpEditor.getValue();
                        let cmdValue = Me.CMDEditor.getValue();
                        let psValue = Me.PSEditor.getValue();

                        let editorType = Me.Controls.EditorTypes.SelectedType; // $('input[name="editortype"]:checked').val();

                        //Find sql params
                        let params = [];
                        let delimiter = Me.Controls.EditedAction.VariableDelimiter.Selector.val();

                        if (editorType == 'CSharp')
                            params = csharpValue.split(delimiter.trim());
                        else if (editorType == 'SQL')
                            params = sqlValue.split(delimiter.trim());

                        /*
                          e.g. 
                            0 = "select * where blah = "
                            1 = "sdfsdf]] and blah2 = " 
                            2 = "sfffff]]"
                        */
                        let paramArray = [];

                        //A param will be prefixed by "@"
                        $.each(params, function (index, p) {

                            if (index > 0) //starts with second one
                            {
                                let endPosition = p.length;
                                let position = p.indexOf(' ');

                                if (position > -1)
                                    endPosition = position;

                                paramArray.push(p.substring(0, endPosition));
                            }
                        });

                        ////JavaScript call
                        //let jscall = '';
                        ////jscall += '{ "ActionID" : "' + action.ActionID + '",';
                        ////jscall += '     "RequestName": "RunAction"';


                        //jscall += '{ "RequestName": "RunAction"';
                        //jscall += '    , "Params" : [ { "Name" : "ActionID", "Value" : "' + action.ActionID + '" }';
                        // if (paramArray.length > 0) {
                        //    jscall += '     , ';
                        //    $.each(paramArray, function (index, pa) {
                        //        let isInt = Apps.Util.IsNumber(pa);
                        //        jscall += '{ "Name": "' + pa + '", "Value": "' + (isInt ? '123' : 'abc') + '" } ,';
                        //    });
                        //    jscall = jscall.substring(0, jscall.length - 1); //remove final comma

                        //    jscall += "]";
                        //}
                        //else {
                        //    jscall += ' ,"Params": []';
                        //}
                        //jscall += "}";

                        let jsRequest = Apps.Data.GetPostArgs('RunAction');
                        jsRequest.Params.push({ Name: 'ActionID', Value: action.ActionID.toString() });
                        $.each(paramArray, function (index, pa) {
                            let isInt = Apps.Util.IsNumber(pa);

                            jsRequest.Params.push({ Name: pa, Value: isInt ? '123' : 'abc' });

                        });

                        $('[data-bind-collection-property="ActionTriggerTypes.Code[0]"]').text(JSON.stringify(jsRequest));

                        $('#Admin_Editor_EditSaveResult').text('');

                        //let action = Me.SelectedAction;
                        action.Sql = sqlValue;
                        action.Code = csharpValue;
                        action.CodeCMD = cmdValue;
                        action.CodePS = psValue;
                        action.EditorType = editorType;

                        //let args = {
                        //    Params: [
                        //        { Name: 'RequestName', Value: 'SaveAction' }
                        //    ],
                        //    Data: action
                        //};
                        //post.Refresh(args, [], function () {

                        //    if (post.Success) {
                        //        Apps.Notify('success', 'Saved! Please refresh actions until Rodney implements two-way binding :)');
                        //    }
                        //    else {
                        //        Apps.Components.Home.HandleError(post.Result);
                        //    }
                        //});
                        let saveActionArgs = Apps.Data.GetPostArgs('SaveAction');
                        saveActionArgs.Params.push({ Name: 'ActionID', Value: action.ActionID.toString() });
                        saveActionArgs.Data = JSON.stringify(action);

                        Apps.Data.ExecutePostArgs(saveActionArgs, function (post) {


                        });

                    }
                },
                TestCode: {
                    Defaults: function () {
                        this.Selector.html('Save &amp; Test');
                    },
                    Clicked: function () {
                        Me.TestCode();
                    }
                },
                ActionOutput: {

                },
                ActionSaveResult: {
                    Bound: function () {
                        this.Selector.val(unescape(this.Data.CodePS));
                    }
                }
            }
        
        }
    };
    return Me;
});