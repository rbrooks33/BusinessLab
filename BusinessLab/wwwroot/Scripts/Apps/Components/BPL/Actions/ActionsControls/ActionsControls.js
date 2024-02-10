Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
       Initialize: function (callback) {
            callback();
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
                    Me.Parent.Resize();
                },
                SelectedType: ''
            },
            EditedAction: {
                Sql: {},
                VariableDelimiter: {},
                UniqueID: {
                    Bound: function () {

                    }
                },
                SQLEditor: {
                    Bound: function () {

                        //SQL Editor
                        this.Selector[0].id = 'BPLSQLEditor'
                        Me.Parent.SqlEditor = ace.edit('BPLSQLEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        Me.Parent.SqlEditor.setTheme("ace/theme/sqlserver");
                        var sqlServerMode = ace.require("ace/mode/sqlserver").Mode;
                        Me.Parent.SqlEditor.session.setMode(new sqlServerMode());
                        Me.Parent.SqlEditor.setValue(this.Data.EditedAction.Sql);

                    }
                },
                CSharpEditor: {
                    Bound: function () {

                        //CSHARP Editor
                        this.Selector[0].id = 'BPLCSharpEditor';
                        Me.Parent.CSharpEditor = ace.edit('BPLCSharpEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        var cSharpMode = ace.require("ace/mode/csharp").Mode;
                        Me.Parent.CSharpEditor.session.setMode(new cSharpMode());
                        Me.Parent.CSharpEditor.setValue(this.Data.EditedAction.Code);

                    }
                },
                CMDEditor: {
                    Bound: function () {

                        //CMD Editor
                        this.Selector[0].id = 'BPLCMDEditor';
                        Me.Parent.CMDEditor = ace.edit('BPLCMDEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        let mode = ace.require("ace/mode/batchfile").Mode;
                        Me.Parent.CMDEditor.session.setMode(new mode());
                        Me.Parent.CMDEditor.setTheme('ace/theme/terminal');
                        Me.Parent.CMDEditor.setValue(this.Data.EditedAction.CodeCMD);

                    }
                },
                PSEditor: {
                    Bound: function () {

                        //POWERSHELL Editor
                        this.Selector[0].id = 'BPLPSEditor';
                        Me.Parent.PSEditor = ace.edit('BPLPSEditor', {
                            autoScrollEditorIntoView: false,
                            selectionStyle: "text"
                        });
                        var mode = ace.require("ace/mode/powershell").Mode;
                        Me.Parent.PSEditor.setTheme('ace/theme/tomorrow_night_blue');
                        Me.Parent.PSEditor.session.setMode(new mode());
                        Me.Parent.PSEditor.setValue(this.Data.EditedAction.CodePS);

                    }
                },
                EditorTypeTitle: {},
                ActionSave: {
                    Bound: function () {
                        this.Selector.text('Save');
                    },
                    Clicked: function () {

                        let action = Me.Parent.Model.EditedAction;
                        let sqlValue = Me.Parent.SqlEditor.getValue();
                        let csharpValue = Me.Parent.CSharpEditor.getValue();
                        let cmdValue = Me.Parent.CMDEditor.getValue();
                        let psValue = Me.Parent.PSEditor.getValue();

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
                        // action.ConnectionID = 

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
                        Me.Parent.TestCode();
                    }
                },
                ActionOutput: {

                },
                ActionSaveResult: {
                    Bound: function () {
                        this.Selector.val(unescape(this.Data.CodePS));
                    }
                },
                ConnectionID: {
                    Bound: function () {
                        let that = this; // isSelector = this.Selector;
                        Me.Root.Actions.Run(9, function (data) {
                            Apps.Util.GetSelectOptions(data, that.Data.EditedAction.ConnectionID, 'Select a Connection', 'ConnectionID', 'ConnectionName', function (options) {
                                that.Selector.html(options);
                            });
                        });

                    }
                }
            }

        }

    };
    return Me;
});