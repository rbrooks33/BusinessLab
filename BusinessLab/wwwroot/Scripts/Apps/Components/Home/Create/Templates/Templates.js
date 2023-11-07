define([], function () {
    var Me = {
        Editor: null,
        EditorResult: null,
        TemplateModel: null,
        CurrentTemplate: null,
        Initialize: function (callback) {

            //Register Exception dialog
            Apps.Components.Helpers.Dialogs.Register('Templates_Dialog', {
                title: 'Templates',
                size: 'full-width',
                templateid: 'templateMyDialog1',
                buttons: [
                    {
                        id: 'Apps_EditSystem_Dialog_Cancel',
                        text: 'Ok',
                        action: 'Apps.Components.Helpers.Dialogs.Close(\'Helpers_Exception_Dialog\')'
                    }
                ]
            });

            //Me.UI.Drop();

            //Apps.Get2('/api/Create/GetTemplateModel', function (result) {

            //    if (result.Success) {

            //        Me.TemplateModel = result.Data;

            //        Me.Editor = ace.edit("Create_Templates_Content_Textarea");
            //        Me.Editor.setTheme("ace/theme/monokai");
            //        Me.Editor.session.setMode("ace/mode/csharp");
            //        Me.Editor.renderer.onResize(true);

            //        Me.EditorResult = ace.edit("Create_Templates_Result_Textarea");
            //        Me.EditorResult.setTheme("ace/theme/monokai");
            //        Me.EditorResult.session.setMode("ace/mode/csharp");
            //        Me.EditorResult.renderer.onResize(true);

            //        //Apps.Notify('success', 'Got template model!');

            //        if (callback)
            //            callback();
            //    }
            //    else {
            //        Apps.Notify('warning', 'Problem getting templates.');
            //    }
            //});

                        if (callback)
                            callback();
                    }
                    else {
                        Apps.Notify('warning', 'Problem getting templates.');
                    }
                });
        },
        Show: function () {

            //Me.UI.Show(400);

            let post = Apps.Components.Home.Main;

            let args = {
                Params: [
                    { Name: "RequestName", Value: "GetTemplates" }
                ]
            };

            post.Refresh(args, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Got templates!');

                    let html = '';
                    html += '<table style="margin:15px;">';
                    $.each(post.Data, function (index, template) {
                        html += '  <tr>';
                        html += '    <td ><div class="btn btn-sm btn-warning" onclick="Apps.Components.Home.Create.Templates.Edit(' + template.TemplateID + ');">Edit</div></td>';
                        html += '    <td style="text-align:center;">' + template.TemplateID + '</td>';
                        html += '    <td>&nbsp;</td>';
                        html += '    <td>' + template.TemplateName + '</td>';
                        html += '  </tr>';
                    });
                    html += '</table>';

                    var pageHtml = Me.UI.Templates.Templates_Main.HTML([html]);
                    //if (Me.CurrentTemplate) {
                    //    Me.Edit(Me.CurrentTemplate.ID);
                    //}

                    //$('#Create_Templates_Menu_Container_Div').html(html);

                    Apps.Components.Helpers.Dialogs.Content('Templates_Dialog', pageHtml);
                    Apps.Components.Helpers.Dialogs.Open('Templates_Dialog');

                    $('#Create_Templates_Menu_Container_Div').html(html);
                }
                else
                    Apps.Components.Home.HandleError(post.Result);



            });
        },
        Hide: function () {
            Me.UI.Hide(400);
        },
        New: function () {
            Apps.Post2('/api/Create/UpsertTemplate', JSON.stringify(Me.TemplateModel), function (result) {
                if (result.Success) {
                    Apps.Notify('success', 'Saved template!');
                    Me.Show();
                }
                else
                    Apps.Notify('warning', 'Problem saving template.');
            });
        },
        Edit: function (templateId) {

            let post = Apps.Components.Home.Main;

            let args = {
                Params: [
                    { Name: "RequestName", Value: "GetTemplate" },
                    { Name: "TemplateID", Value: templateId.toString() }
                ]
            };

            post.Refresh(args, [], function () {

                if (post.Success) {
                    //Apps.Notify('success', 'Got templates!');

                    $('#Create_Templates_TemplateName_Div').val(post.Data.TemplateName);

                    Me.Editor.setValue(post.Data.TemplateContent ? post.Data.TemplateContent : '');

                    $('#Create_Templates_Content_Container_Div').show(400).find('.ace_editor').height('48vh').width('70vw');
                    $('#Create_Templates_Result_Container_Div').show(400).find('.ace_editor').height('48vh').width('70vw');

                    //Populate properties
                    var propHtml = '';
                    propHtml += '<table class="table">';
                    //$.each(Me.CurrentTemplate.TemplateProperties, function (index, prop) {
                    //    propHtml += '  <tr>';
                    //    propHtml += '    <td>#' + prop.ID + '</td>';
                    //    propHtml += '    <td><input id="TemplatePropertyFind' + prop.ID + '" type="text" value="' + prop.TemplatePropertyFind + '" /></td>';
                    //    propHtml += '    <td><input id="TemplatePropertyReplace' + prop.ID + '" type="text" value="' + prop.TemplatePropertyReplace + '" /></td>';
                    //    propHtml += '    <td><div class="btn btn-sm btn-warning" onclick="Apps.Components.Apps.Create.Templates.DeleteProperty(' + prop.ID + ');">Remove</div></td>';
                    //    propHtml += '  </tr>';
                    //});
                    propHtml += '</table>';

                    $('#Create_Templates_Properties_Container_Div').html(propHtml);
                }
                else
                    Apps.Components.Home.HandleError(post.Result);



            });

        //    Apps.Get2('/api/Create/GetTemplate?templateId=' + templateId, function (result) {

        //        if (result.Success) {

        //            Me.CurrentTemplate = result.Data[0];

        //            $('#Create_Templates_TemplateName_Div').val(Me.CurrentTemplate.TemplateName);

        //            Me.Editor.setValue(Me.CurrentTemplate.TemplateContent ? Me.CurrentTemplate.TemplateContent : '');

        //            $('#Create_Templates_Content_Container_Div').show(400).find('.ace_editor').height('48vh').width('70vw');
        //            $('#Create_Templates_Result_Container_Div').show(400).find('.ace_editor').height('48vh').width('70vw');

        //            //Populate properties
        //            var propHtml = '';
        //            propHtml += '<table>';
        //            $.each(Me.CurrentTemplate.TemplateProperties, function (index, prop) {
        //                propHtml += '  <tr>';
        //                propHtml += '    <td>#' + prop.ID + '</td>';
        //                propHtml += '    <td><input id="TemplatePropertyFind' + prop.ID + '" type="text" value="' + prop.TemplatePropertyFind + '" /></td>';
        //                propHtml += '    <td><input id="TemplatePropertyReplace' + prop.ID + '" type="text" value="' + prop.TemplatePropertyReplace + '" /></td>';
        //                propHtml += '    <td><div class="btn btn-sm btn-warning" onclick="Apps.Components.Apps.Create.Templates.DeleteProperty(' + prop.ID + ');">Remove</div></td>';
        //                propHtml += '  </tr>';
        //            });
        //            propHtml += '</table>';

        //            $('#Create_Templates_Properties_Container_Div').html(propHtml);
        //        }
        //        else
        //            Apps.Notify('warning', 'Problem getting template.');
        //    });
        },
        Save: function () {

            Me.CurrentTemplate.TemplateContent = Me.Editor.getValue();
            Me.CurrentTemplate.TemplateName = $('#Create_Templates_TemplateName_Div').val();

            $.each(Me.CurrentTemplate.TemplateProperties, function (index, prop) {
                prop.TemplatePropertyFind = $('#TemplatePropertyFind' + prop.ID).val();
                prop.TemplatePropertyReplace = $('#TemplatePropertyReplace' + prop.ID).val();
                Me.SaveProperty(prop);
            });

            Apps.Post2('/api/Create/UpsertTemplate', JSON.stringify(Me.CurrentTemplate), function (result) {
                if (result.Success) {
                    Apps.Notify('success', 'Saved template!');

                    Me.Show();
                }
                else
                    Apps.Notify('warning', 'Problem saving template.');
            });

        },
        AddProperty: function () {

            let newProp = {
                ID: 0,
                TemplateID: Me.CurrentTemplate.ID,
                TemplatePropertyFind: '',
                TemplatePropertyReplace: ''
            };
            Me.SaveProperty(newProp);
        },
        SaveProperty: function (prop) {

            Apps.Post2('/api/Create/UpsertTemplateProperty', JSON.stringify(prop), function (result) {
                if (result.Success) {
                    Apps.Notify('success', 'Saved template property!');

                    Me.Show();
                }
                else
                    Apps.Notify('warning', 'Problem saving template property.');
            });
        },
        DeleteProperty: function (propId) {
            Apps.Get2('/api/Create/ArchiveTemplateProperty?propertyId=' + propId, function (result) {
                if (result.Success) {
                    Apps.Notify('success', 'Removed template property!');

                    Me.Show();
                }
                else
                    Apps.Notify('warning', 'Problem removing template property.');
            });
        },
        Create: function () {

            var created = Me.Editor.getValue();

            $.each(Me.CurrentTemplate.TemplateProperties, function (index, prop) {
                created = created.replaceAll(prop.TemplatePropertyFind, prop.TemplatePropertyReplace);
            });

            Me.EditorResult.setValue(created);
        }
    };
    return Me;
});