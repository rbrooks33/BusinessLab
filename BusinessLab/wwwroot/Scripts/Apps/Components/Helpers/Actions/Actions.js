define(['./Controls/ActionsTable.js'], function (ActionsTable) {
    var Me = {
        ActionsTable: ActionsTable,
        SqlEditor: null,
        CSharpEditor: null,
        SelectedAction: null,
        Initialize: function (callback) {

            Me.Resize();
            $(window).resize(Me.Resize);

            if (callback)
                callback();
        },
        InitializeEditors: function (action) {

            //CSHARP
            $("#Admin_Editor_Actions_Editor_CSHARP").text(action.sCode);
            Me.CSharpEditor = ace.edit('Admin_Editor_Actions_Editor_CSHARP', {
                autoScrollEditorIntoView: false,
                selectionStyle: "text"
            });
            var cSharpMode = ace.require("ace/mode/csharp").Mode;
            Me.CSharpEditor.session.setMode(new cSharpMode());

            //SQL Editor
            $("#Admin_Editor_Actions_Editor_SQL").text(action.sSql);
            Me.SqlEditor = ace.edit('Admin_Editor_Actions_Editor_SQL', {
                autoScrollEditorIntoView: false,
                selectionStyle: "text"
            });
            Me.SqlEditor.setTheme("ace/theme/sqlserver");
            var sqlServerMode = ace.require("ace/mode/sqlserver").Mode;
            Me.SqlEditor.session.setMode(new sqlServerMode());
            //Me.SqlEditor.resize();


            //Me.CSharpEditor.resize();
            //EXAMPLE
        //    $("Admin_Editor_Edit_Sql").text(report.sSql);
        //    Me.Editor = ace.edit('Admin_Editor_Edit_Sql', {
        //        autoScrollEditorIntoView: true,
        //        selectionStyle: "text"
        //    });

        //    Me.Editor.setTheme("ace/theme/sqlserver");
        //    var JavaScriptMode = ace.require("ace/mode/sqlserver").Mode;
        //    Me.Editor.session.setMode(new JavaScriptMode());

        //    let windowWidth = $('.Admin_Editor_Actions_Max_Container').width(); 
        //    $('.Admin_Editor_Actions_Max_Container').width(windowWidth - 1);
        //    Me.Resize();
        },
        Resize: function () {
            //Apps.Util.Middle($('#divIssuesMainContainer'));
            //Apps.Util.Center($('#divIssuesMainContainer'));
            if (Me.SqlEditor) {
                Me.SqlEditor.resize();
                Me.CSharpEditor.resize();
            }
        },
        GetActions: function () {

            let post = Apps.Components.Home.Main;

            //let args = {
            //    Method: "GetActions"
            //};
            let args = {
                "Params":
                    [
                        {
                            "Name": "RequestName", "Value": "GetActions"
                        }
                    ]
            };
            post.Refresh(args, [], function () {

                if (post.Success) {
                    var actions = post.Data;
                    var actionsTable = Me.ActionsTable.Create(actions);
                    $('#Admin_Editor_ActionsTable_Container').html(actionsTable);
                }
                else
                    Apps.Components.Main.HandleError(post.Result);

            });
        },
        Edit: function (args) {
            Me.SelectedAction = args[1];
            Me.OpenMax();
        },
        OpenMax: function () {

            let action = Me.SelectedAction; // JSON.parse(unescape(actionString));
            let maxHtml = Me.UI.Templates.Admin_Editor_Actions_Max.HTML([action.ActionID, action.ActionName, action.ActionDescription, action.IsCustom, action.Sql == null ? '' :action.Sql, action.Code]);

            $(document.body).append(maxHtml);


            //Apps.Util.CenterAbsolute($('.Admin_Editor_Actions_Max_Container'));
            //Apps.Util.MiddleAbsolute($('.Admin_Editor_Actions_Max_Container'));

            $('.Admin_Editor_Actions_Max_Container').show(400);

            Apps.Components.Home.ShowBackground();

            $("#Admin_Editor_Actions_Editor_SQL").hide();
            $("#Admin_Editor_Actions_Editor_CSHARP").hide();

            Me.InitializeEditors(action);

            $('#Admin_Editor_Actions_VariableDelimiter').val(action.VariableDelimiter)
            $('#Admin_Editor_Actions_UniqueID').val(action.UniqueID)

            if (action.EditorType) {
                Me.SwitchType(action.ActionID, action.EditorType.trim());
            }
            else
                Me.SwitchType(action.ActionID, 'sql');

            //$('.EditorRadioStyle').prop('checked', false);

            //if (action.sEditorType) {

            //    switch (action.sEditorType.trim()) {

            //        case 'sql':

            //            $("#Admin_Editor_Actions_Editor_SQL").show();
            //            $('#Admin_Editor_Actions_EditorTypeLabel').text('SQL');
            //            $('#Admin_Editor_Action_SqlRadio').prop('checked', true);

            //            break;

            //        case 'csharp':

            //            $("#Admin_Editor_Actions_Editor_CSHARP").show();
            //            $('#Admin_Editor_Actions_EditorTypeLabel').text('C#');
            //            $('#Admin_Editor_Action_CSharpRadio').prop('checked', true);

            //            break;
            //    }
            //}
            //else
            //    $("#Admin_Editor_Actions_Editor_SQL").show(); //default

            //HACKZILLA: Editors act wonky when clicking on a long line (go to end) before a resize
            setTimeout(function () {
                $("#Admin_Editor_Actions_Editor_SQL").width('99%');
                $("#Admin_Editor_Actions_Editor_CSHARP").width('99%');
                Me.Resize();
            }, 1000);
        },
        CloseMax: function () {
            $('.Admin_Editor_Actions_Max_Container').hide(400);
            $('.Admin_Editor_Actions_Max_Container').remove();
            Apps.Components.Home.HideBackground();
        },
        Save: function (actionid) {

            let post = Apps.Components.Home.Main;

            let sqlValue = Me.SqlEditor.getValue();
            let csharpValue = Me.CSharpEditor.getValue();
            let editorType = $('input[name="editortype"]:checked').val();

            //Find sql params
            let params = [];
            if (editorType == 'csharp')
                params = csharpValue.split($('#Admin_Editor_Actions_VariableDelimiter').val().trim());
            else if (editorType == 'sql')
                params = sqlValue.split($('#Admin_Editor_Actions_VariableDelimiter').val().trim());

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

            //JavaScript call
            let jscall = '';
            jscall += '{ "ActionID" : "' + actionid + '",';
            jscall += '     "Method": "RunAction"';

            if (paramArray.length > 0) {
                jscall += '     , "Params":[';
                $.each(paramArray, function (index, pa) {
                    let isInt = Apps.Util.IsNumber(pa);
                    jscall += '{ "Name": "' + pa + '", "Value": "' + (isInt ? '123' : 'abc') + '" } ,';
                });
                jscall = jscall.substring(0, jscall.length - 1); //remove final comma

                jscall += "]";
            }
            else {
                jscall += ' ,"Params": []';
            }
            jscall += "}";

            //let jsondata = '{';
            //$.each(paramArray, function (index, pa) {
            //    jsondata += '' + pa + ':"[your ' + pa + ']",';
            //});
            //jsondata = jsondata.substring(0, jsondata.length - 1) + '}';

            //jscall += '{ "ActionID": "' + actionid.toString() + '" } },';



            $('#Admin_Editor_Actions_JS').text(jscall);

            //T-SQL
            //$('#Admin_Editor_Actions_TSQL').text('exec sp_Common_Workflow_ActionRun  \'' + $('#Admin_Editor_Actions_UniqueID').val() + '\', \'' + jsondata + '\'');


            ////C# call
            //let cSharpText = '';
            //cSharpText += 'var actionArgs = new List < ActionArgValue > ()';
            //cSharpText += '{';
            //$.each(paramArray, function (index, pa) {
            //    cSharpText += '    new ActionArgValue() { Value = new ActionArg() { ArgName = "' + pa + '", ArgValue = "[your ' + pa + ']" } },';
            //    //jsondata += '' + pa + ':"[your ' + pa + ']",';
            //});
            ////cSharpText = cSharpText.substring(0, cSharpText.length - 1); //remove final comma

            //cSharpText += '};';

            //cSharpText += 'CommonClassLib.Classes.Main.RunAction("' + Me.SelectedAction.UniqueID + '", actionArgs, common, action, db, hub, ref result);';
            //$('#Admin_Editor_Actions_CSHARP').text(cSharpText);


            $('#Admin_Editor_EditSaveResult').text('');

            //let myargs = {
            //    Method: "SaveActionCode",
            //    ActionID: actionid.toString(),
            //    Sql: sqlValue,
            //    Code: csharpValue,
            //    VariableDelimiter: $('#Admin_Editor_Actions_VariableDelimiter').val(),
            //    UniqueID: $('#Admin_Editor_Actions_UniqueID').val(),
            //    EditorType: editorType
            //};

            //let args = {
            //    Params : [
            //        { Name: "RequestName", Value: "SaveAction" },
            //        { Name: "ActionID", Value: actionid.toString() },
            //        { Name: "Sql", Value: "" },
            //        { Name: "Code", Value: "" },
            //        { Name: "", Value: "" },
            //        { Name: "", Value: "" },
            //        { Name: "", Value: "" },
            //    ]
            //}

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'SaveAction'}
                ],
                Data: {
                    ActionID: actionid.toString(),
                    Sql: sqlValue,
                    Code: csharpValue,
                    VariableDelimiter: $('#Admin_Editor_Actions_VariableDelimiter').val(),
                    UniqueID: $('#Admin_Editor_Actions_UniqueID').val(),
                    EditorType: editorType
                }
            };
            post.Refresh(args, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Saved!');
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });

        },
        TestCode: function (actionid) {

            let post = Apps.Components.Home.Main;
            let officeId = '12345abc';
            let email = 'sdfssdfs';
            let spuserid = 0;

            if (Apps.Components.Auth && Apps.Components.Auth.SignedIn) {
                officeId = Apps.Components.Auth.User.localAccountId;
                email = Apps.Components.Auth.Email;
                spuserid = Apps.Components.Auth.User.SPUserID;
            }

            //let myargs = {
            //    Method: "TestCode",
            //    iActionTypeID: actionid.toString(),
            //    sCode: Me.CSharpEditor.getValue(),
            //    OfficeID: officeId,
            //    Email: email
            //};

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'TestActionCode' }
                ],
                Data: {
                    ActionID: actionid.toString(),
                    Code: Me.CSharpEditor.getValue()
                }
            };

            post.Refresh(args, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Test Run Success!');
                    $('#Admin_Editor_Actions_Output').val(post.Data);
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });


        },
        TestCodeResult: function (result) {
            let output = $('#Admin_Editor_Actions_Output').html();
            output = result.message + '<br />' + output;
            $('#Admin_Editor_Actions_Output').html(output);
        },
        TestSql: function (actionid) {

            let post = Apps.Components.Home.Main;

            let args = JSON.parse($('#Admin_Editor_Actions_JS').text());

            $('#Admin_Editor_Actions_Output').empty();

            post.Refresh(args, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Saved!');

                    let outputTable = Apps.Components.Controls.QuickTable.GetTable(post.Data);

                    $('#Admin_Editor_Actions_Output').html(outputTable);
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });

        },
        TestPrint: function (actionid) {

            let myargs = {
                "Args": [
                    { "Value": { "ArgName": "Method", "ArgValue": "TestPrint" } },
                    { "Value": { "ArgName": "ActionTypeID", "ArgValue": actionid.toString() } },
                    { "Value": { "ArgName": "Code", "ArgValue": Me.CSharpEditor.getValue() } }
                ]
            };

            Me.Main.Refresh(myargs, [], function () {

                if (Me.Main.Success) {
                    Apps.Notify('success', 'Test Run Success!');
                    $('#Admin_Editor_Actions_Output').val(JSON.stringify(Me.Main.Result));
                }
                else {
                    Apps.Components.Home.HandleError(Me.Home.Result);
                }
            });


        },
        RunPA: function (actionid) {

            let myargs = JSON.parse($('#Admin_Editor_Actions_PA').val());

            Me.Main.Refresh(myargs, [], function () {

                if (Me.Home.Success) {
                    Apps.Notify('success', 'Saved!');
                    $('#Admin_Editor_Actions_Output').val(Me.Main.Data);
                }
                else {
                    Apps.Components.Main.HandleError(Me.Main.Result);
                }
            });

        },
        RunJS: function (actionid) {

            let jscode = $('#Admin_Editor_Actions_JS').val();
            let myargs = JSON.parse(jscode);

            Me.Main.Refresh(myargs, [], function () {

                if (Me.Main.Success) {
                    Apps.Notify('success', 'Saved!');
                    $('#Admin_Editor_Actions_Output').val(Me.Main.Data);
                }
                else {
                    Apps.Components.Main.HandleError(Me.Main.Result);
                }
            });

        },
        SwitchType: function (actionid, type) {


            Me.SelectedAction.sEditorType = type;
            $('.EditorRadioStyle').prop('checked', false);
            $("#Admin_Editor_Actions_Editor_SQL").hide();
            $("#Admin_Editor_Actions_Editor_CSHARP").hide();

            if (type == 'sql') {
                $('#Admin_Editor_Actions_EditorTypeLabel').text('SQL');
                $("#Admin_Editor_Actions_Editor_SQL").show();
                $('#Admin_Editor_Action_SqlRadio').prop('checked', true);

            }
            else if (type == 'csharp') {
                $('#Admin_Editor_Actions_EditorTypeLabel').text('C#');
                $("#Admin_Editor_Actions_Editor_CSHARP").show();
                $('#Admin_Editor_Action_CSharpRadio').prop('checked', true);

            }

            //Me.Save(actionid); //Don't ever do this again
        }
    };
    return Me;
});