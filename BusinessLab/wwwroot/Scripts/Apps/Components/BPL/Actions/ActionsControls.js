Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Model: {
            Actions: [],
            WorkflowActions: [],
            ActionTriggerTypesJS: '',
            ActionTriggerTypesSQL: '',
            BPLActionsHomePage: '',
            EditorTypes: [
                { Name: 'SQL' },
                { Name: 'CSharp' },
                { Name: 'CMD' },
                { Name: 'PS' }
            ],
            SQLEditor: '',
            CSEditor: '',
            UniqueID: '',
            PSEditor: null,
            CMDEditor: null,
            EditorTypeRadioSQL: '',
            EditorTypeRadioCS: '',
            EditorTypeRadioCMD: '',
            EditorTypeRadioPS: ''
        },
        Controls: {
            ActionsTable: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {

                    var that = this;
                    Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs('GetActions'), function (post) {

                        Apps.Components.BPL.Actions.Model.Actions = post.Data;

                        var settings =
                        {
                            id: "Admin_Editor_ActionsTable",
                            data: post.Data,
                            title: "",
                            tablestyle: "padding-left:50px;padding-right:50px;",
                            savecallback: function (obj, fieldName) {
                                Apps.Components.BPL.Actions.Save(obj);
                            },
                            tableactions: [
                                {
                                    text: 'Add Action',
                                    actionclick: function () {
                                        Apps.Components.BPL.Actions.Add();
                                    }
                                }
                            ],
                            rowbuttons: [
                                {
                                    text: 'Edit',
                                    buttonclick: function (element, obj, tr) {
                                        Apps.Components.BPL.Actions.Edit(obj);
                                    }
                                },
                                {
                                    text: 'Job',
                                    buttonclick: function (element, obj, tr) {
                                        Apps.Components.BPL.Actions.Edit(obj);
                                    }
                                }
                            ],
                            fields: [
                                Apps.Grids.GetField('ActionID'),
                                Apps.Grids.GetField('ActionName'),
                                Apps.Grids.GetField('ActionDescription'),
                                Apps.Grids.GetField('ConnectionID')
                            ],
                            columns: [
                                Apps.Grids.GetColumn("ActionID", "ID"),
                                Apps.Grids.GetColumn("ActionName", "Action"),
                                Apps.Grids.GetColumn("ActionDescription", "Description"),
                                Apps.Grids.GetColumn("ConnectionID", "Connection")
                            ]
                        };

                        let html = Apps.Grids.GetTable(settings);

                        that.Selector.html(html);

                    });

                }
            },
            ActionTriggerTypesJS: {},
            ActionTriggerTypesJSRun: {
                Clicked: function () {

                }
            }
            ,
            ActionTriggerTypesSQL: {},
            ActionTriggerTypesSQLRun: {
                Clicked: function () {

                }
            },
            EditorTypeRadioSQL: {
                Clicked: function () {

                    $('.ActionEditor').hide();

                    Me.Controls.SQLEditor.Selector.show();
                    Me.Controls.EditorTypeTitle.Selector.text('SQL');
                    this.SelectedType = 'SQL';
                    Me.Root.Actions.Resize();
                }
            },
            
            EditorTypeRadioCS: {
                Clicked: function (selector, propertyName, newValue, collIndex, isColl, event) {

                    $('.ActionEditor').hide();

                    Me.Controls.CSharpEditor.Selector.show();
                    Me.Controls.EditorTypeTitle.Selector.text('C#');
                    this.SelectedType = 'CS';
                    Me.Root.Actions.Resize();
                }
            },
            EditorTypeRadioCMD: {
                Clicked: function (selector, propertyName, newValue, collIndex, isColl, event) {

                    $('.ActionEditor').hide();

                    Me.Controls.CMDEditor.Selector.show();
                    Me.Controls.EditorTypeTitle.Selector.text('Windows Command Line');
                    this.SelectedType = 'CMD';
                    Me.Root.Actions.Resize();
                }
            },
            EditorTypeRadioPS: {
                Clicked: function (selector, propertyName, newValue, collIndex, isColl, event) {

                    $('.ActionEditor').hide();

                    Me.Controls.PSEditor.Selector.show();
                    Me.Controls.EditorTypeTitle.Selector.text('PowerShell');
                    this.SelectedType = 'PS';
                    Me.Root.Actions.Resize();
                }
            },
           SQLEditor: {
                Bound: function () {

                    //SQL Editor
                    this.Selector[0].id = 'BPLSQLEditor'
                   Me.Root.Actions.SqlEditor = ace.edit('BPLSQLEditor', {
                        autoScrollEditorIntoView: false,
                        selectionStyle: "text"
                    });
                   Me.Root.Actions.SqlEditor.setTheme("ace/theme/sqlserver");
                    var sqlServerMode = ace.require("ace/mode/sqlserver").Mode;
                   Me.Root.Actions.SqlEditor.session.setMode(new sqlServerMode());
                   Me.Root.Actions.SqlEditor.setValue(this.Data.EditedAction.Sql);

                }
            },
            CSharpEditor: {
                Bound: function () {

                    //CSHARP Editor
                    this.Selector[0].id = 'BPLCSharpEditor';
                    Me.Root.Actions.CSEditor = ace.edit('BPLCSharpEditor', {
                        autoScrollEditorIntoView: false,
                        selectionStyle: "text"
                    });
                    var cSharpMode = ace.require("ace/mode/csharp").Mode;
                    Me.Root.Actions.CSEditor.session.setMode(new cSharpMode());
                    Me.Root.Actions.CSEditor.setValue(this.Data.EditedAction.Code);

                }
            },
            CMDEditor: {
                Bound: function () {

                    //CMD Editor
                    this.Selector[0].id = 'BPLCMDEditor';
                    Me.Root.Actions.CMDEditor = ace.edit('BPLCMDEditor', {
                        autoScrollEditorIntoView: false,
                        selectionStyle: "text"
                    });
                    let mode = ace.require("ace/mode/batchfile").Mode;
                    Me.Root.Actions.CMDEditor.session.setMode(new mode());
                    Me.Root.Actions.CMDEditor.setTheme('ace/theme/terminal');
                    Me.Root.Actions.CMDEditor.setValue(this.Data.EditedAction.CodeCMD);

                }
            },
            PSEditor: {
                Bound: function () {

                    //POWERSHELL Editor
                    this.Selector[0].id = 'BPLPSEditor';
                    Me.Root.Actions.PSEditor = ace.edit('BPLPSEditor', {
                        autoScrollEditorIntoView: false,
                        selectionStyle: "text"
                    });
                    var mode = ace.require("ace/mode/powershell").Mode;
                    Me.Root.Actions.PSEditor.setTheme('ace/theme/tomorrow_night_blue');
                    Me.Root.Actions.PSEditor.session.setMode(new mode());
                    Me.Root.Actions.PSEditor.setValue(this.Data.EditedAction.CodePS);

                }
            },
            Sql: {},
            VariableDelimiter: {
                Bound: function () {
                    this.Selector.val(this.Data.EditedAction.VariableDelimiter);
                }
            },
            UniqueID: {
                Bound: function () {
                    this.Selector.val(this.Data.EditedAction.UniqueID);
                }
            },
            EditorTypeTitle: {},
            ActionSave: {
                Bound: function () {
                    this.Selector.text('Save');
                },
                Clicked: function () {

                    let action = Me.Root.Actions.Model.EditedAction;
                    let sqlValue = Me.Root.Actions.SqlEditor.getValue();
                    let csharpValue = Me.Root.Actions.CSEditor.getValue();
                    let cmdValue = Me.Root.Actions.CMDEditor.getValue();
                    let psValue = Me.Root.Actions.PSEditor.getValue();

                    let editorType = Me.Model.EditedAction.EditorType; // $('input[name="editortype"]:checked').val();

                    //Find sql params
                    let params = [];
                    let delimiter = Me.Controls.VariableDelimiter.Selector.val();

                    if (editorType == 'cs')
                        params = csharpValue.split(delimiter.trim());
                    else if (editorType == 'sql')
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

                    //let jsRequest = Apps.Data.GetPostArgs('RunAction');
                    //jsRequest.Params.push({ Name: 'ActionID', Value: action.ActionID.toString() });
                    //$.each(paramArray, function (index, pa) {
                    //    let isInt = Apps.Util.IsNumber(pa);

                    //    jsRequest.Params.push({ Name: pa, Value: isInt ? '123' : 'abc' });

                    //});

                    //$('[data-bind-collection-property="ActionTriggerTypes.Code[0]"]').text(JSON.stringify(jsRequest));

                    $('#Admin_Editor_EditSaveResult').text('');

                    //let action = Me.SelectedAction;
                    action.Sql = sqlValue;
                    action.Code = csharpValue;
                    action.CodeCMD = cmdValue;
                    action.CodePS = psValue;
                    action.EditorType = editorType;

                    let result = new Apps.Result2();
                    result.AddDataParams(action);
                    result.Data = JSON.stringify(action);

                    Apps.Data.Execute('SaveAction', result.Params, function (result) {
                        Apps.Notify('success', 'Action updated.');
                    }, null, result.Data);
                }
            },
            TestCode: {
                Defaults: function () {
                    this.Selector.html('Save &amp; Test');
                },
                Clicked: function () {
                    Me.Root.Actions.TestCode();
                }
            },
            ActionOutput: {

            },
            ActionSaveResult: {
                Bound: function () {
                    this.Selector.val(''); // unescape(this.Data.CodePS));
                }
            },
            ConnectionID: {
                Bound: function () {
                    let that = this; // isSelector = this.Selector;
                    Apps.Data.Execute("GetConnections", [], function (result) {
                        Apps.Util.GetSelectOptions(result.Data, that.Data.ConnectionID, 'Select a Connection', 'ConnectionID', 'ConnectionName', function (options) {
                            that.Selector.html(options);
                        });
                    });

                }
            }
        }
    };
    return Me;
});