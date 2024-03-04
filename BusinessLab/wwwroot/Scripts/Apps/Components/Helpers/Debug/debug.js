Apps.Define([], function () {
    var Me = {
        Name: 'Debug',
        Color: 'brown',
        Initialize: function (callback) {

            Me.UI.Show();

            Apps.Data.RegisterMyGET(Me, 'AddComponent', '/api/CLI/AddComponent?relativePath={0}&name={1}', null, true);
            Apps.Data.RegisterMyGET(Me, 'RemoveComponent', '/api/CLI/RemoveComponent?relativePath={0}&name={1}', null, true);


            if (Apps.ActiveDeployment.Debug)
                Me.BuildBar();

            if (callback)
                callback();



        },
        Init: function () {

            Apps.Components.Helpers.Dialogs.Register('Helpers_Debug_Dialog', {

                title: 'Component Editors',
                size: 'full-width',
                templateid: 'templateMyDialog1',
                buttons: [
                    {
                        id: 'Apps_EditSystem_Dialog_Cancel',
                        text: 'Ok',
                        action: 'Apps.Components.Helpers.Dialogs.Close(\'Helpers_Debug_Dialog\')'
                    }
                ]
            });

            Apps.Components.Helpers.Dialogs.Register('Helpers_Debug_Test_Dialog', {

                title: 'Tests Results',
                size: 'full-width',
                templateid: 'templateMyDialog1',
                buttons: [
                    {
                        id: 'Apps_EditSystem_Dialog_Test_Cancel',
                        text: 'Ok',
                        action: 'Apps.Components.Helpers.Dialogs.Close(\'Helpers_Debug_Test_Dialog\')'
                    }
                ]
            });

            $('#contentDebug').show();
            Me.BuildData();
        },
        CountDownTests: {
            count: 0,
            check: function () {
                this.count--;
                if (this.count === 0) {
                    if (this.done)
                        this.done();
                }
            },
            done: null
        },
        ShowApp: function (appId) {

            let appWindow = window.open('https://192.168.168.68:8099', '_blank', 'height=800,width=800');


        },
        ShowTasks: function () {

            let taskWindow = window.open(Apps.ActiveDeployment.WebRoot + '/Scripts/Apps/Components/Helpers/Debug/Tasks/index.html', '_blank', 'height=800,width=800');

        },
        TestPlanUnderTest: null,
        RunTests: function () {

            Me.Init();

            Apps.Components.Helpers.TestPlans.SalesWizardTests.Sunny_Day.Load();

            F.speed = 400;

            if (Me.TestPlanUnderTest) {

                var result = new Apps.Result2('Test plan' + Me.TestPlanUnderTest.Name);

                Me.TestResults = [];

                $('.TestResultsContentStyle').show();

                $('#Debug_TestResults_Header').empty();
                $('#Debug_TestResults_Content').empty();

                let buttonHtml = Me.UI.Templates.Debug_TestRunner_Buttons.HTML([escape(JSON.stringify(result))]);

                $('#Debug_TestResults_Header').prepend('<div style="display:flex;padding-left:5px;">' + Me.TestPlanUnderTest.Description + '</div>');
                $('#Debug_TestResults_Header').prepend('<div style="display:flex;padding-left:5px; font-weight:bold;">' + Me.TestPlanUnderTest.Name + '</div>');
                $('#Debug_TestResults_Header').prepend(buttonHtml);


                if (Me.TestPlanUnderTest.Reset)
                    Me.TestPlanUnderTest.Reset();


                $.each(Me.TestPlanUnderTest.Steps, function (index, step) {

                    step.Index = index + 1;

                    try {

                        result.AddMessage(step.Name, 'started.');

                        if (step.Test)
                            step.Test(step, result, Me.CountDownTests);
                        else
                            result.AddFail(step.Name, 'No test found.');

                        result.AddMessage(step.Name, 'Finished.');
                    }
                    catch (error) {

                        let timestamp = new Date().toLocaleTimeString();
                        result.AddFail(step.Name, '<b>Exception Type</b>:</br> ' + error.name + '</br><b>Message</b></br>' + error.message + '</br><b>Stack</b></br>' + error.stack);

                    }

                    //Starting step condition (default)
                    let color = 'lightgrey'; //Indeterminate/Incomplete/Pending // step.Passed ? 'green': 'red';
                    let stepHtml = Me.UI.Templates.TestStep.HTML([step.Name, step.Description, step.Passed, '', color, step.Index, step.FailMessage]);
                    $('#Debug_TestResults_Content').append('<div id="Debug_SUT_Step' + step.Index + '" style="display:flex;">' + stepHtml + '</div>');

                });

                //Fires after completion of all tests given countdowns set correctly
                Me.CountDownTests.done = function () {

                };

            }

        },
        OpenTestRunnerResults: function (escapedResultString) {

            let result = JSON.parse(unescape(escapedResultString));

            //Merge success/fail and order by date
            let messages = [];
            $.each(result.FailedMessages, function (i, m) {
                m['Success'] = false;
                messages.push(m);
            });
            $.each(result.SuccessMessages, function (i, m) {
                m['Success'] = true;
                messages.push(m);
            });
            $.each(result.Messages, function (i, m) {
                m['Success'] = null;
                messages.push(m);
            });

            let messagesByDate = Enumerable.From(messages).OrderBy(m => m.Timestamp).ToArray();

            var rowIndex = 1;

            let resultsHtml = Apps.Components.Helpers.Controls.QuickTable.GetTable(messagesByDate,

                //Header
                function () {

                    let header = `<tr><th>Index</th><th>Timestamp</th><th>Message</th><th>Data</th></tr>`;
                    return header;
                },
                //Row data
                function (row) {

                    let successColor = 'blank';
                    if (row.Success === true)
                        successColor = 'green';
                    else if (row.Success === false)
                        successColor = 'red';

                    let rowHtml = `<tr style="color:${successColor};"><td>${rowIndex++}</td><td>${row.Timestamp}</td><td>${row.Message}</td><td>${row.Data}</td></tr>`;
                    return rowHtml;

                });

            Apps.Components.Helpers.OpenResponse(resultsHtml);

        },
        CloseTestRunner: function () {
            $('.TestResultsContentStyle').hide();
        },
        SetTestSuccess: function (step, countdown) {
            //let thisStep = Enumerable.From(Me.SystemUnderTest.Steps).Where(s => s.Name == testName).ToArray()[0];
            countdown.count++;

            //Border 
            $('#Debug_SUT_Step' + step.Index).css('border', '1px solid green');

            //Square icon
            F('#Debug_SUT_Step' + step.Index + '_PassedDiv').exists(null, function () {
                $(arguments[0].selector).css('background-color', 'green').css('border', '1px solid green');
                countdown.check();
            });

            //Hide fail message
            $('#Debug_TestStep_StepDescription' + step.Index).show();
            $('#Debug_TestStep_FailMessage' + step.Index).hide();

        },
        SetTestIncomplete: function (step, countdown) { //Same as "Active"


            countdown.count++;

            //Border 
            $('#Debug_SUT_Step' + step.Index).css('border', '2px solid yellow');

            //Square icon
            F('#Debug_SUT_Step' + step.Index + '_PassedDiv').exists(null, function () {
                $(arguments[0].selector).css('background-color', 'yellow');
                countdown.check();
            });
        },
        SetTestFail: function (step, countdown) {

            countdown.count++;

            //Border 
            $('#Debug_SUT_Step' + step.Index).css('border', '1px solid red');

            //Square icon
            F('#Debug_SUT_Step' + step.Index + '_PassedDiv').exists(null, function () {
                $(arguments[0].selector).css('background-color', 'red');
                countdown.check();
            });

            //Show fail message
            $('#Debug_TestStep_StepDescription' + step.Index).hide();
            $('#Debug_TestStep_FailMessage' + step.Index).show();
        },

        TestResults: [],
        ShowBinding: function () {

            let rowIndex = 1;
            let controls = [];

            //$.each(Object.keys(Apps.Bind.ControlTypes), function (it, t) {

            //    $.each(Apps.Bind.ControlTypes[t].Controls, function (ic, c) {

            //        controls.push({
            //            RowIndex: rowIndex++,
            //            TypeName: t,
            //            ControlName: c.Name,
            //            State: c.State,
            //            Info: ''
            //        });

            //    });
            //});

            $.each(Apps.AutoBindReferences, function (i, ab) {

                controls.push({
                    RowIndex: rowIndex++,
                    TypeName: '[Auto-Bind Property]',
                    ControlName: ab.Name,
                    State: 0,
                    Info: 'Component: ' + ab.Component + '. Element: ' + ab.ElementType + ', ' + ab.ElementClass
                });
            });

            let bindingsHtml = Apps.Components.Helpers.Controls.QuickTable.GetTable(controls,

                //Header
                function () {

                    let header = `<tr><th>Index</th><th>Type</th><th>Control</th><th>State</th><th>Component</th></tr>`;
                    return header;
                },
                //Row data
                function (row) {

                    let rowHtml = `<tr><td>${row.RowIndex++}</td><td>${row.TypeName}</td><td>${row.ControlName}</td><td>${row.State}</td><td>${row.Info}</td></tr>`;
                    return rowHtml;

                });

            Apps.Components.Helpers.OpenResponse(bindingsHtml);

        },
        InitializeSmartTags: function () {
            $('#chkDebugShowSmartTags').change(function (e) {

                Apps.Pages.SmartTag.Event('show_tags');

            });

        },
        BuildBar: function () {

            //$(document.body).append('<div id="divDebugContainer"></div>');

            $('#contentDebug').html(Me.UI.Templates.Bar.HTML());

        },
        CloseDebugBar: function () {
            $('#contentDebug').hide();
        },
        ShowComponentHTML: '',
        //ShowComponentNamespace: '',
        ShowComponents: function () {

            Me.Init();

            //Apps.LoadComponentsConfig(true, function (components) {
            Apps.Download(Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Components/components.js?version=' + new Date().getTime(), function (response) {

                var components = JSON.parse(response).Components;

                //var compObj = Object.keys(Apps.Components);
                Me.ShowComponentHTML = '<div id="divComponentsContainer" style="border: 1px solid cornflowerblue; ">';
                Me.ShowComponentHTML += '<ul>';

                $.each(components, function (index, c) {

                    c['PreviewPath'] = '/Scripts/Apps/Components/' + c.Name;

                    //Top-level component
                    let parentnamespace = c.Name;
                    Me.ShowComponentHTML += '<li id="debug_component_' + c.Name + '" class="noliststyle" style="font-size:15px;cursor:pointer;" ';
                    Me.ShowComponentHTML += 'onmouseover="Apps.Components.Helpers.Debug.ComponentMouseOver(\'debug_component_' + c.Name + '\');" ';
                    Me.ShowComponentHTML += 'onmouseout="Apps.Components.Helpers.Debug.ComponentMouseOut(\'debug_component_' + c.Name + '\');" ';
                    Me.ShowComponentHTML += 'onclick="Apps.Components.Helpers.Debug.ComponentClick(\'' + c.Name + '\', \'' + parentnamespace + '\');" ';
                    Me.ShowComponentHTML += '>';
                    Me.ShowComponentHTML += c.Name + '&nbsp;';
                    /*
                    Me.ShowComponentHTML += '<div class="btn-group">';
                    Me.ShowComponentHTML +=         '<div class="btn btn-primary btn-sm py-0 px-0">';
                    Me.ShowComponentHTML +=             '<i class="fa fa-minus" style="cursor:pointer;" onclick="Apps.Components.Debug.RemoveComponent(\'' + parentnamespace + '\,\'' + c.Name + '\');"></i>';
                    Me.ShowComponentHTML +=         '</div>';
                    Me.ShowComponentHTML +=         '<div class="btn btn-primary btn-sm py-0 px-0">';
                    Me.ShowComponentHTML +=             '<i class="fa fa-plus" style="cursor:pointer;" onclick="Apps.Components.Debug.AddComponent(\'' + parentnamespace + '\,\'' + c.Name + '\');"></i>';
                    Me.ShowComponentHTML +=         '</div >';
                    Me.ShowComponentHTML +=     '</div>';
                    */
                    //Data
                    //Me.ShowComponentHTML +=     '<ul>';

                    //if (Apps.Components[c.Name] && Apps.Components[c.Name].Data) {
                    //    $.each(Apps.Components[c.Name].Data.Gets, function (index, get) {
                    //        Me.ShowComponentHTML += '<li>' + get.DataName + '</li>';
                    //    });
                    //}
                    //Me.ShowComponentHTML += '</ul>'

                    //Sub components
                    //Me.ShowComponentHTML +=         '<li class="noliststyle noliststylechild">';
                    //Me.ShowComponentHTML +=         '</li>';

                    Me.ShowComponentHTML += '</li>';
                    Me.ShowSubComponents(parentnamespace, c);


                });

                Me.ShowComponentHTML += '</ul>';
                Me.ShowComponentHTML += '</div>';

                let componentTree = Me.ShowComponentHTML;

                //Preview HTML
                let preview = Me.UI.Templates.Preview.HTML(['https://localhost:54322/index.html']);
                let tabs = Me.UI.Templates.ComponentEditorTabs.HTML([preview]);


                let componentListHtml = Me.UI.Templates.Window.HTML([componentTree, tabs]);

                //Fill Data tab
                let dataHtml = 'hiya';

                $('#ComponentEditor_DataTabContent').html(dataHtml);


                Apps.Components.Helpers.Dialogs.Content('Helpers_Debug_Dialog', componentListHtml);
                Apps.Components.Helpers.Dialogs.Open('Helpers_Debug_Dialog');

                
                let editor = ace.edit('HTMLEditorViewer', {
                    autoScrollEditorIntoView: false,
                    selectionStyle: "text"
                });
                editor.setTheme("ace/theme/chrome");
                mode = ace.require("ace/mode/html").Mode;
                editor.session.setMode(new mode());
                editor.setValue('hiya');

                //Apps.Tabstrips.Initialize('ComponentEditorTabstrip');
                //Apps.Tabstrips.Select('ComponentEditorTabstrip', 1);

                //Apps.Tabstrips.Initialize('ComponentsTabstrip');
                //Apps.Tabstrips.Select('ComponentsTabstrip', 0);

                //move components to tab content
                //$('#ComponentsTab_MainTabContent').html($('#divComponentsContainer').detach());
                //$('#ComponentsTab_MainTabContent').hide(); //rather, hide it because list gets wacky when put into tabstrip

                //$('.ComponentEditorTabstrip-tabstrip-custom').css('width', '800px');

                //Apps.Tabstrips.Initialize('PreviewTabstrip');
                //Apps.Tabstrips.Select('PreviewTabstrip', 0);

                //move preview to preview tab content
                //$('#PreviewTab_MainTabContent').html($('#debug_PreviewIframe').detach());

                //Expand the html tab
                //$('#ComponentEditor_HTMLTabContent')
                //    .css('width', '100%')
                //    .css('border', '3px solid cornflowerblue')
                //    .css('border-top-right-radius', '5px');


                ////PreviewTab_MainTabContent
                //$('#PreviewTab_MainTabContent')
                //    .css('width', '100%')
                //    .css('border', '3px solid cornflowerblue')
                //    .css('border-top-right-radius', '5px');

            });


        },
        ShowHTML: function () {
            $('.EditorViewers').hide();
            $('.EditorViewers.HTML').show();
        },
        ShowJS: function () {
            $('.EditorViewers').hide();
            $('.EditorViewers.JS').show();
        },
        ShowCSS: function () {
            $('.EditorViewers').hide();
            $('.EditorViewers.CSS').show();
        },
        ShowDATA: function () {
            $('.EditorViewers').hide();
            $('.EditorViewers.DATA').show();
        },
        ShowSubComponents: function (namespace, c) {

            if (c.Components) {
                let subcomponents = c.Components;

                Me.ShowComponentHTML += '<ul>';

                $.each(subcomponents, function (index, c) {
                    c['PreviewPath'] = c.PreviewPath + '/' + c.Name;
                    let mynamespace = namespace + '.' + c.Name;
                    Me.ShowComponentHTML += '<li id="debug_component_' + c.Name + '" class="noliststyle" style="font-size:15px;cursor:pointer;" ';
                    Me.ShowComponentHTML += 'onmouseover="Apps.Components.Helpers.Debug.ComponentMouseOver(\'debug_component_' + c.Name + '\');" ';
                    Me.ShowComponentHTML += 'onmouseout="Apps.Components.Helpers.Debug.ComponentMouseOut(\'debug_component_' + c.Name + '\');" ';
                    Me.ShowComponentHTML += 'onclick="Apps.Components.Helpers.Debug.ComponentClick(\'' + c.Name + '\', \'' + mynamespace + '\');">';
                    Me.ShowComponentHTML += c.Name + '&nbsp;';
                    //Me.ShowComponentHTML +=     '<i class="fa fa-plus" style="cursor:pointer;" onclick="Apps.Components.Debug.AddComponent(\'' + mynamespace + '\',\'' + c.Name + '\');"></i>&nbsp;';
                    //Me.ShowComponentHTML +=     '<i class="fa fa-minus" style="cursor:pointer;" onclick="Apps.Components.Debug.RemoveComponent(\'' + mynamespace + '\',\'' + c.Name + '\');"></i>';
                    Me.ShowComponentHTML += '</li>';
                    Me.ShowSubComponents(mynamespace, c);

                });

                //let cobj = eval('Apps.Components.' + namespace);

                Me.ShowComponentHTML += '</ul>';
            }
        },
        ComponentMouseOver(id) {
            //Apps.Notify('success', 'hiya');
            $('#' + id).removeClass('debugcomponentmouseout').addClass('debugcomponentmouseover');
            event.stopPropagation();
        },
        ComponentMouseOut(id) {
            //Apps.Notify('success', 'hiya');
            $('#' + id).removeClass('debugcomponentmouseover').addClass('debugcomponentmouseout');
            event.stopPropagation();
        },
        ComponentClick(configString, componentNamespace) {

            //let config = JSON.parse(configString);
            //let component = eval('Apps.Components.' + componentNamespace);

            //Apps.Notify('success', 'hiya');
            //let name = id.split('_')[2]; //e.g. debug_component_[name]
            let componentPath = componentNamespace.replaceAll('.', '/');

            //$('#ComponentEditor_HTMLTabContent').html('hiya ' + id);
            let path = Apps.ActiveDeployment.WebRoot + '/Scripts/Apps/Components/' + componentPath + '/Preview.html';
            let previewHtml = Me.UI.Templates.Preview.HTML([path]);
            $('#debug_PreviewContainer').html(previewHtml);

            //HTML tab
            var templateNames = '';
            $.each(Me.UI.Templates, function (t, index) {
                templateNames += t;
            });

            $('#ComponentEditor_HTMLTabContent').html(Me.UI.Templates.Debug_HTMLEditor.HTML([templateNames]));
            event.stopPropagation();
        },
        ShowTopology: function () {
        },
        AddComponent: function (parentPath, name) {
            //Apps.Notify('warning', parentPath);
            //let parentComponent = eval('Apps.' + parentPath);
            Me.Data.Gets.AddComponent.Refresh([parentPath, 'new name'], function (result) {
                if (Me.Data.Gets.AddComponent.Result.Success)
                    Me.ShowComponents();
                else
                    Apps.Notify('warning', 'Show components failed.');
            });
        },
        RemoveComponent: function (parentPath, name) {
            //Apps.Notify('warning', parentPath);
            //let parentComponent = eval('Apps.' + parentPath);
            Me.Data.Gets.RemoveComponent.Refresh([parentPath, 'new name'], function (result) {
                if (Me.Data.Gets.RemoveComponent.Result.Success)
                    Me.ShowComponents();
                else
                    Apps.Notify('warning', 'Show components failed.');
            });
        },
        TraceIndex: 0,
        Traces: [],
        Trace: function (caller, desc) {
            if (Apps.ActiveDeployment.Debug === true) {
                var stack = (new Error).stack;
                desc = desc ? ' (' + desc + ')' : '';
                var traceText = '<span title="' + stack + '" style="color:' + caller.Color + ';">' + (caller.Config ? caller.Config.Name : '') + '.' + arguments.callee.caller.name + '</span><i>' + desc + '</i>';
                Me.Traces.push({ traceindex: Me.TraceIndex, caller: traceText });
                Me.TraceIndex++;
            }
        },
        Build: function (name, key, coll) {

            var count = Object.keys(coll).length;

            $("#linkAppsButton" + key).text(name + " (" + count + ")");

            var offset1 = Object.keys(coll).length * 30;
            var offset2 = offset1 - (offset1 * 2); //make it a negative
            var offset3 = -30;

            $.each(coll, function (dataName, datum) {

                var rowCount = '0';
                if (datum)
                    rowCount = datum.length;

                var li2 = $('<li><a href="#">' + dataName + ' (' + rowCount + ')</a></li>').appendTo($('.' + key + '.second-level-menu'));

                var ul3 = $('<ul class="' + key + ' third-level-menu" style="position:relative;top:-30px;background-color:#999999;"></ul>').appendTo(li2);

                var li4 = $('<li><div id="divColumnList' + dataName + '" style="background-color:#999999;color:white;padding:15px;"></div></li>').appendTo(ul3);

                if (datum.length > 0) //at least one prop
                {
                    var propTop = 30;
                    //var props = Object.keys(datum);

                    $.each(datum, function (propIndex, propName) {
                        propTop -= 30;
                        $('<div>' + propName.Date + ' - ' + propName.Message + '</div>').appendTo($("#divColumnList" + dataName));
                    });

                    $("#divColumnList" + dataName).css("position", "fixed").css("bottom", "30px").height(datum[0].length * 30);
                }
            });

            $('.' + key + '.second-level-menu').css('top', offset2 + 'px');

        },
        DebugData: {},
        BuildData: function () {

            let datas = {
                Table1: [
                    {
                        T1C1: 't1  c1 r1',
                        T1C2: 't1 c2 r1'
                    },
                    {
                        T1C1: 't1  c1 r2',
                        T1C2: 't1 c2 r2'
                    }

                ],
                Table2: [
                    {
                        T2C1: 't2  c1 r1',
                        T2C2: 't2 c2 r1'
                    },
                    {
                        T2C1: 't2  c1 r2',
                        T2C2: 't2 c2 r2'
                    }
                ]
            };

            Me.DebugData = [];

            let dataCount = 0;
            $.each(Apps.ComponentList, function (i, c) {
                if (c.Model) {
                    dataCount++;
                }
            });

            $("#linkAppsDataButton").text("Data (" + dataCount + ")");

            var offset1 = dataCount * 30;
            var offset2 = offset1 - (offset1 * 2); //make it a negative
            var offset3 = -30;

            $.each(Apps.ComponentList, function (i, c) {
                if (c.Model) {
                    //Me.DebugData.push(c.Model);
                    let rowCount = Object.keys(c.Model).length;
                    let dataName = c.Config.Name;
                    var li2 = $('<li><a href="#" onclick="Apps.Components.Helpers.Debug.ShowData(\'' + dataName + '\', Apps.Components.Helpers.Debug.DebugData.' + dataName + ');">' + dataName + ' (' + rowCount + ')</a></li>').appendTo($('.data.second-level-menu'));
                    var ul3 = $('<ul class="data third-level-menu" style="position:relative;top:-30px;background-color:#999999;"></ul>').appendTo(li2);

                }
            });

            ////$.each(datas, function (dataName, datum) {
            //for (let x = 0; x < dataCount; x++) {

            //    let datum = Me.DebugData[Object.keys(Me.DebugData)[x]];


            //    let dataName = Object.keys(Me.DebugData)[x];

            //    var rowCount = '0';
            //    if (datum) {
            //        rowCount = datum.length;

            //        var li2 = $('<li><a href="#" onclick="Apps.Components.Helpers.Debug.ShowData(\'' + dataName + '\', Apps.Components.Helpers.Debug.DebugData.' + dataName + ');">' + dataName + ' (' + rowCount + ')</a></li>').appendTo($('.data.second-level-menu'));

            //        //var ul3 = $('<ul class="data third-level-menu" style="position:relative;top:-30px;background-color:#999999;"></ul>').appendTo(li2);

            //        //var li4 = $('<li><div id="divColumnList' + dataName + '" style="background-color:#999999;color:white;padding:15px;"></div></li>').appendTo(ul3);

            //    //    if (datum.length > 0) //at least one prop
            //    //    {
            //    //        var propTop = 30;
            //    //        var props = Object.keys(datum[0]);

            //    //        $.each(props, function (propIndex, propName) {
            //    //            propTop -= 30;
            //    //            $('<div>' + propName + '</div>').appendTo($("#divColumnList" + dataName));
            //    //        });

            //    //        $("#divColumnList" + dataName).css("position", "fixed").css("bottom", "30px").height(datum[0].length * 30);
            //    //    }
            //    }
            ////};

            $('.data.second-level-menu').css('top', offset2 + 'px');
        },
        BuildPages: function () {

        },
        ShowData: function (dataName, data) {

            //make a table
            var dataTable = Apps.Bind.GetTable({
                databindkey: "datatable",
                data: data,
                tableid: "tableAppsDataShow",
                rowbinding: function (row, rowindex) {

                    var rowProps = Object.keys(row);
                    var str = '';

                    if (rowindex === 0) {
                        str += '<tr>';
                        $.each(rowProps, function (rowPropIndex, rowProp) {
                            str += '    <td>' + rowProp + '</td > ';
                        });
                        str += '</tr>';
                    }

                    str += '<tr>';
                    $.each(rowProps, function (rowPropIndex, rowProp) {
                        str += '    <td>' + eval('row.' + rowProp) + '</td > ';
                    });
                    str += '</tr>';

                    return str;
                }
            });

            Apps.OpenDialog(Me, 'DataBarDialog', dataName + ' Data', dataTable[0].outerHTML);

            //add to dialog
        //    $('#dialogDebugShowData_Title').text(dataName + ' Data');
        //    Apps.Dialogs.Content('dialogDebugShowData', dataTable[0].outerHTML);
        //    Apps.Dialogs.SaveCallback = Me.CloseData;
        //    Apps.Dialogs.CancelCallback = Me.CloseData;
        //    Apps.Dialogs.Open('dialogDebugShowData');
        },
        CloseData() {
            Apps.Dialogs.Close('dialogDebugShowData');

        },
        Event: function (sender, args) {

            switch (sender) {

                case 'settings':

                    Apps.ReadConfig(function () {

                        Apps.Dialogs.Open('dialogAppsSettings');

                        var templateUrl = Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Debug/debug.html';
                        var templateArgs = [
                            Apps.Settings.WebRoot,
                            Apps.Settings.Port,
                            Apps.Settings.VirtualFolder,
                            Apps.Settings.AppsRoot,
                            Apps.Required
                        ];

                        Apps.Util.GetHTMLFromTemplate('templateAppsSettings', templateUrl, templateArgs, function (content) {

                            $('#dialogAppsSettings_Content').empty().append(content);

                        });
                    });
                    break;

                case 'save_config':

                    Apps.Settings.WebRoot = $('#txtDevWebRoot').val();
                    //Apps.Config.ProductionWebRoot = $('#txtProductionWebRoot').val();
                    Apps.Settings.VirtualFolder = $('#txtDevVirtualFolder').val();
                    //Apps.Config.ProductionVirtualFolder = $('#txtProductionVirtualFolder').val();
                    Apps.Settings.AppsRoot = $('#txtDevAppsRoot').val();
                    //Apps.Config.ProductionAppsRoot = $('#txtProductionAppsRoot').val();
                    Apps.Settings.Required = $('#txtRequiredComponents').val();
                    Apps.Settings.Port = $('#txtPort').val(); // $('#chkDevMode').prop('checked');

                    Apps.SaveConfig();

                    break;

                case 'design':

                    var pageContent = '';
                    var pages = Object.keys(Apps.Components);

                    pageContent += '<table>';
                    pageContent += '<tr><td>';
                    pageContent += '<div class="btn-group-vertical">';

                    pageContent += '<div><strong>Components</strong></div>';

                    $.each(pages, function (pageIndex, pageName) {

                        if (Apps.Components[pageName].Enabled) {

                            if (Apps.Components[pageName].Event) {

                                // var eventFunction = Apps.Pages[pageName].Event.toString();
                                // var eventContent = eventFunction.slice(eventFunction.indexOf("{") + 1, eventFunction.lastIndexOf("}"));


                            }
                            if (Apps.Components[pageName].Color === undefined)
                                Apps.Components[pageName].Color = 'black';

                            pageContent += '<div><span style= "background-color:' + Apps.Components[pageName].Color + ';color:white;">' + pageName + '</span></div>';

                            pageMethods = Object.keys(Apps.Components[pageName]);

                            $.each(pageMethods, function (pageMethodIndex, pageMethodName) {
                                var description = '';
                                if (pageMethodName === 'Description')
                                    description = '<div style="font-style: italic; font-size: 12px;font-weight:bold;">' + Apps.Components[pageName].Description + '</div>';

                                if (pageMethodName !== 'Enabled' && pageMethodName !== 'Name' && pageMethodName !== 'Color')
                                    pageContent += '<div style="padding-left:10px;">' + pageMethodName + description + '</div>';
                            });

                            var controls = Apps.Components[pageName].Controls;
                            $.each(controls, function (controlIndex, controlName) {

                                //pageContent += '<div class="btn btn-default" style="width:115px;">' + controlIndex + '</div>';
                                pageContent += '<div style="padding-left:20px;"><span style= "color:' + Apps.Pages[pageName].Controls[controlIndex].Color + ';"><strong>' + controlIndex + '</strong></span></div>';

                                var methods = Object.keys(Apps.Components[pageName].Controls[controlIndex]);
                                var functionList = '';
                                var otherList = '';

                                $.each(methods, function (methodIndex, methodName) {

                                    var methodPageName = pageName;
                                    var methodControlName = controlIndex;
                                    var type = (typeof eval('Apps.Components.' + methodPageName + '.Controls.' + methodControlName + '.' + methodName));

                                    if (type === 'function')
                                        functionList += '<div style="padding-left:40px;">' + methodName + '</div>';
                                    else
                                        otherList += '<div style="padding-left:40px;">' + methodName + '</div>';

                                    //if (Apps.Components[pageName].Controls[controlIndex].Bind)
                                    {
                                        var args = Me.GetArgs(eval('Apps.Components[pageName].Controls[controlIndex].' + methodName));
                                        //pageContent += 'Arguments: <textarea>' + args + '</textarea>';
                                        // pageContent += '<div style="padding-left:60px;">Args: ' + args + '</div>';
                                    }

                                });
                                pageContent += '<div style="padding-left:30px;">Functions</div>';
                                pageContent += functionList;
                                pageContent += '<div style="padding-left:30px;">Properties</div>';
                                pageContent += otherList;

                                //pageContent += '<div style="padding-left:40px;">Bind</div>';
                                //if (Apps.Components[pageName].Controls[controlIndex].Bind)
                                //{
                                //    var args = Me.GetArgs(Apps.Components[pageName].Controls[controlIndex].Bind);
                                //    //pageContent += 'Arguments: <textarea>' + args + '</textarea>';
                                //    pageContent += '<div style="padding-left:60px;">Args: ' + args + '</div>';
                                //}
                            });

                        }//enabled?
                    });
                    pageContent += '</div>'
                    pageContent += '</td>';
                    pageContent += '<td style="vertical-align:top;">';

                    //TRACE INFO
                    pageContent += '<div><strong>Trace</strong></div>';
                    $.each(Apps.Components.Helpers.Debug.Traces, function (traceIndex, trace) {
                        //{ traceindex: Apps.Debug.TraceIndex, caller: caller }
                        pageContent += '<div>' + trace.traceindex + ' ' + trace.caller + '</div>';
                    });

                    pageContent += '</td>';
                    pageContent += '</tr>';
                    pageContent += '</table>';

                    Apps.Components.Helpers.Dialogs.Content('Helpers_Debug_Dialog', pageContent);
                    Apps.Components.Helpers.Dialogs.Open('Helpers_Debug_Dialog');

                    break;

                case 'open_components':

                    Apps.Dialogs.Open('dialogComponents', 'open_components');

                    break;

                case 'new_component':

                    Apps.CreateComponent($('#txtNewComponentName').val());

                    break;

                case 'test':

                    Apps.ReloadComponentsReady = function () {

                        Apps.Notify('success', 'reloaded');

                        //test 1
                        require([Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/references/funcunit.js'], function (funcunit) {

                            F.speed = 400;

                            F('#divtestTable > div').click();

                            F('#divtest2Table > div').click();
                        });


                    };

                    Apps.ReloadUI();


                    break;
            }
        },
        Find: function (filterText, searchText) {

            var myElementFilterText = filterText; // 'Combo Panel';
            var myElementSearchText = searchText; // 'Combo Panel (Table)';
            var myElement = null;

            Me.FindAndReplace(myElementFilterText, 'sdfsd');

            if (Me.FoundElements.length === 1) {
                myElement = Me.FoundElements[0];
            }
            else if (Me.FoundElements.length > 1) {
                $.each(Me.FoundElements, function (eIndex, e) {
                    if (e.innerText === myElementSearchText) {
                        myElement = e;
                        return false;
                    }
                });
            }

            if (myElement)
                Apps.Notify('success', 'Found ' + searchText); //combo panel button.');
            else
                Apps.Notify('danger', 'Didn\'t find ' + searchText); //the table-based combo panel button. Found ' + Me.FoundElements.length + ' elements.');

            return myElement;
        },
        FoundElements: [],
        FindAndReplace: function (searchText, replacement, searchNode) {

            if (!searchText || typeof replacement === 'undefined') {
                // Throw error here if you want...
                return;
            }
            var regex = typeof searchText === 'string' ?
                new RegExp(searchText, 'g') : searchText,
                childNodes = (searchNode || document.body).childNodes,
                cnLength = childNodes.length,
                excludes = 'html,head,style,title,link,meta,script,object,iframe';
            while (cnLength--) {
                var currentNode = childNodes[cnLength];
                if (currentNode.nodeType === 1 &&
                    (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
                    arguments.callee(searchText, replacement, currentNode);
                }
                if (currentNode.nodeType !== 3 || !regex.test(currentNode.data)) {
                    continue;
                }
                Me.FoundElements.push(currentNode.parentNode);
                // break;
                //var parent = currentNode.parentNode,
                //    frag = (function () {
                //        var html = currentNode.data.replace(regex, replacement),
                //            wrap = document.createElement('div'),
                //            frag = document.createDocumentFragment();
                //        wrap.innerHTML = html;
                //        while (wrap.firstChild) {
                //            frag.appendChild(wrap.firstChild);
                //        }
                //        return frag;
                //    })();
                //parent.insertBefore(frag, currentNode);
                //parent.removeChild(currentNode);
            }
        },

        GetArgs: function (func) {

            // First match everything inside the function argument parens.
            var args = '';
            if (func) {
                var funcParts = func.toString().match(/function\s.*?\(([^)]*)\)/);
                if (funcParts && funcParts.length >= 2) {
                    args = funcParts[1];

                    //// Split the arguments string into an array comma delimited.
                    //return args.split(',').map(function (arg) {
                    //    // Ensure no inline comments are parsed and trim the whitespace.
                    //    return arg.replace(/\/\*.*\*\//, '').trim();
                    //}).filter(function (arg) {
                    //    // Ensure no undefined values are added.
                    //    return arg;
                    //});
                }
            }
            return args;
        },
        HandleError: function (settings) {

            var resultText = '';

            Me.Initialize();

            if (!settings.error) {
                if (settings.result.Success) {
                    if (settings.successcallback)
                        settings.successcallback();
                }
                else {
                    if (!settings.result.Message)
                        resultText = "no message";
                    else
                        resultText = settings.result.Message;
                }
            }
            else {
                resultText = settings.result.textResponse;
            }

            if (resultText.length > 0) {

                if (settings.notify && settings.notifymessage) {
                    //Use Notify
                    var notifyType = settings.notifytype ? settings.notifytype : 'warning';


                    Apps.Notify({
                        message: settings.notifymessage
                    }, {
                        type: notifyType, //info, success, warning, danger
                        delay: 400,
                        animate: { enter: 'animated fadeInUp', exit: 'animated fadeOutDown' }
                    });
                }

                if (settings.erroricon) {
                    if ($('#spanAppsErrorImage').length === 0) {
                        var iconLeft = settings.erroriconleft ? settings.erroriconleft : 100;
                        var iconTop = settings.erroricontop ? settings.erroricontop : 100;
                        var errorImageHtml = '<span id="spanAppsErrorImage" style="display:none;position:absolute;top:' + iconTop + 'px;left:' + iconLeft + 'px;"><img src="' + Apps.Settings.appsroot + '/Images/critical-issue-16.png" /></span>';
                        $(document.body).append($(errorImageHtml));
                    }
                }

                Me.SetErrorDialogContent(resultText, settings.tooltipposition ? settings.tooltipposition : 'bottom');
            }
        },
        HandleError2: function (error, errorMessage, errorDetails, successMessage, successCallback) {

            if (!$.notify) {
                //require([Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/references/notify.min.js'], function (notify) {

                //    Apps.Debug.HandleError2(error, errorMessage, errorDetails, successMessage, successCallback);

                //});

            }
            else {
                //position
                //var saveButtonsPosition = $('#groupSave').position();
                //var errorIconLeft = saveButtonsPosition ? saveButtonsPosition.left - 40 : 100;
                //var errorIconTop = 10;

                //Apps.Debug.HandleError(
                //            {
                //                error: false,
                //                result: result,
                //                notify: false,
                //                notifymessage: notifymessage,
                //                erroricon: false,
                //                erroriconleft: errorIconLeft,
                //                erroricontop: errorIconTop,
                //                tooltipposition: 'bottom',
                //                successcallback: success
                //            });


                if (error) {

                    Apps.Debug.SetErrorDialogContent(errorDetails, 'bottom'); //When details are needed
                    //success/info/warn/error
                    //$.notify(successMessage, { className: 'error', globalPosition: 'right top', autoHide: false, clickToHide: true });
                    Apps.Notify('warning', errorMessage);
                    //$.notify({
                    //    message: errorMessage,
                    //    url: 'javascript:Apps.Debug.ShowErrorDialog();'
                    //}, {
                    //        type: 'danger', //info, success, warning, danger
                    //        delay: 600,
                    //        animate: { enter: 'animated fadeInRight', exit: 'animated fadeOutLeft' },
                    //        mouse_over: 'pause',
                    //        offset: { x: 50, y: 50 }
                    //    });

                }
                else {
                    if (successMessage && successMessage.length > 0) {

                        Apps.Notify('success', successMessage);

                        //$.notify(successMessage, { className: 'success', globalPosition: 'right bottom', autoHide: true, clickToHide: false });

                        //$.notify({
                        //    message: successMessage
                        //},
                        //    {
                        //        type: 'success', //info, success, warning, danger
                        //        delay: 600,
                        //        animate: { enter: 'animated fadeInRight', exit: 'animated fadeOutLeft' },
                        //        offset: { x: 50, y: 50 }
                        //    });
                    }

                    if (successCallback)
                        successCallback();
                }
            }

            //Apps.Notify({
            //    message: notifymessage
            //}, {
            //    type: 'danger', //info, success, warning, danger
            //    delay: 400,
            //    element: null,
            //    position: 'relative',
            //    placement: { from: 'bottom', align: 'center'},
            //    animate: { enter: 'animated fadeInUp', exit: 'animated fadeOutDown' }
            //});

            // if (notify)
            //     Apps.Debug.Notify('danger', notifymessage, 400);

        },

        SetErrorDialogContent: function (content, tooltipposition) {
            Me.Initialize(); //Loads error dialog

            Apps.Dialogs.Content('AppsErrorDialog', '<textarea style="width:100%;height:158px;">' + content + '</textarea>');

            $("#spanAppsErrorImage")
                .attr("data-tooltip", content)
                .addClass('tooltip-' + tooltipposition)
                .show()
                .on('click', function (event) {
                    Me.ShowErrorDialog();
                });

        },
        ShowErrorDialog: function () {
            Apps.Dialogs.Open('AppsErrorDialog');
        },
        Notify: function (type, message, delay) {

            var myDelay = 0;
            if (delay)
                myDelay = delay;

            Apps.Notify({
                message: message
            }, {
                type: type, //info, success, warning, danger
                delay: myDelay,
                animate: { enter: 'animated fadeInUp', exit: 'animated fadeOutDown' }
            });
        }
    };
    return Me;
})