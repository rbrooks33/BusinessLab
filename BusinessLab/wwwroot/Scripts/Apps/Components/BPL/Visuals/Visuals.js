Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
       
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            Me.UI.Drop();
            Me.UI.HideAll(); //Hides all but me
            //Me.ShowComponents();

            Me.Model.JSEditor = ace.edit('JSEditorViewer', {
                autoScrollEditorIntoView: false,
                selectionStyle: "text"
            });
            Me.Model.JSEditor.setTheme("ace/theme/chrome");
            mode = ace.require("ace/mode/javascript").Mode;
            Me.Model.JSEditor.session.setMode(new mode());

            Me.Model.HTMLEditor = ace.edit('HTMLEditorViewer', {
                autoScrollEditorIntoView: false,
                selectionStyle: "text"
            });
            Me.Model.HTMLEditor.setTheme("ace/theme/chrome");
            mode = ace.require("ace/mode/html").Mode;
            Me.Model.HTMLEditor.session.setMode(new mode());

            Me.Model.CSSEditor = ace.edit('CSSEditorViewer', {
                autoScrollEditorIntoView: false,
                selectionStyle: "text"
            });
            Me.Model.CSSEditor.setTheme("ace/theme/chrome");
            mode = ace.require("ace/mode/css").Mode;
            Me.Model.CSSEditor.session.setMode(new mode());

            Apps.BindHTML(Me.UI.Selector, Me, true);
        },
        ShowComponents: function (componentsFilePath) {

            //Me.Init();

            //Apps.LoadComponentsConfig(true, function (components) {
            Apps.Download(componentsFilePath, function (response) {

                var components = JSON.parse(response).Components;

                //var compObj = Object.keys(Apps.Components);
                Me.ShowComponentHTML = '<div id="divComponentsContainer">';
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
                //let preview = Me.UI.Templates.Preview.HTML(['https://localhost:54322/index.html']);

                //$('.PreviewViewer').html(preview);
                $('.ComponentTree').html(componentTree);
                //let tabs = Me.UI.Templates.ComponentEditorTabs.HTML([preview]);


                //let componentListHtml = Me.UI.Templates.Window.HTML([componentTree, tabs]);

                //Fill Data tab
                //let dataHtml = 'hiya';

                //$('#ComponentEditor_DataTabContent').html(dataHtml);


                //Apps.Components.Helpers.Dialogs.Content('Helpers_Debug_Dialog', componentListHtml);
                //Apps.Components.Helpers.Dialogs.Open('Helpers_Debug_Dialog');




                Me.ShowCOMPONENTS();
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
        ShowCOMPONENTS: function () {
            $('.EditorViewers').hide();
            $('.EditorViewers.COMPONENTS').show();
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
        ShowPREVIEW: function () {
            $('.EditorViewers').hide();
            $('.EditorViewers.PREVIEW').show();
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

        Model: {
            VisualsConnections: '',
            ConnectionProperties: [],
            SelectedFolder: '',
            JSEditor: {},
            HTMLEditor: {},
            CSSEditor: {}
        },
        Controls: {
            VisualsConnections: {
                Bound: function () {
                    let thisSelector = this.Selector;
                    Me.Root.Actions.Run(10, function (data) {
                        Apps.Util.GetSelectOptions(data, 0, 'Select a Connection', 'ConnectionID', 'ConnectionName', function (options) {
                            thisSelector.html(options);
                        });
                    });
                },
                Changed: function (propertyName, connetionId) {
                    let argParams = [
                        { Name: 'ConnectionTypeID', Value: '3' } 
                    ]
                    Me.Root.Actions.Run(11, function (data) {
                        Me.Model.ConnectionProperties = data;

                        //let previewWindow = window.open(data[1].Value, '_blank','location=yes,height=570,width=520,scrollbars=yes,status=yes');

                        //Required format:
                        //data[0] should be url of component's preview page
                        //data[1] should be FOLDER of preview page

                        Me.Model.SelectedURL = data[1].Value;
                        Me.Model.SelectedFolder = data[0].Value;

                        let componentPathArray = data[0].Value.split("\\");
                        let componentName = componentPathArray[componentPathArray.length - 1];
                        let args = Apps.Data.GetPostArgs('GetContent');
                        args.Params.push({ Name: 'FolderPath', Value: data[0].Value });
                        args.Params.push({ Name: 'ComponentName', Value: componentName });

                        Apps.Data.ExecutePostArgs(args, function (post) {

                            let jsContent = Enumerable.From(post.Result.Params).Where(p => p.Name == 'JSContent').ToArray()[0];
                            let htmlContent = Enumerable.From(post.Result.Params).Where(p => p.Name == 'HTMLContent').ToArray()[0];
                            let cssContent = Enumerable.From(post.Result.Params).Where(p => p.Name == 'CSSContent').ToArray()[0];

                            Me.Model.JSEditor.setValue(jsContent.Value);
                            Me.Model.HTMLEditor.setValue(htmlContent.Value);
                            Me.Model.CSSEditor.setValue(cssContent.Value);
                        });


                    }, argParams);
                }
            }
        }
    };
    return Me;
});