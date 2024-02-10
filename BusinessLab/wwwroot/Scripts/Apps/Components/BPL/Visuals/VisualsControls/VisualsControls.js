Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
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
                Changed: function (propertyName, connectionId) {

                    let argParams = [
                        { Name: 'ConnectionID', Value: connectionId.toString() },

                    ]
                    Me.Root.Actions.Run(11, function (data) {

                        //Currently the "3" data type has two properties
                        //"Folder Path" and "Preview URL"
                        if (data.length == 2) { 
                            Me.Parent.Model.ConnectionProperties = data;

                            //let previewWindow = window.open(data[1].Value, '_blank','location=yes,height=570,width=520,scrollbars=yes,status=yes');

                            //Required format:
                            //data[0] should be url of component's preview page
                            //data[1] should be FOLDER of preview page

                            Me.Parent.Model.SelectedURL = data[1].Value;
                            Me.Parent.Model.SelectedFolder = data[0].Value;

                            let componentPathArray = data[0].Value.split("\\");
                            let componentName = componentPathArray[componentPathArray.length - 1];
                            let args = Apps.Data.GetPostArgs('GetContent');
                            args.Params.push({ Name: 'FolderPath', Value: data[0].Value });
                            args.Params.push({ Name: 'ComponentName', Value: componentName });

                            Apps.Data.ExecutePostArgs(args, function (post) {

                                let jsContent = Enumerable.From(post.Result.Params).Where(p => p.Name == 'JSContent').ToArray()[0];
                                let htmlContent = Enumerable.From(post.Result.Params).Where(p => p.Name == 'HTMLContent').ToArray()[0];
                                let cssContent = Enumerable.From(post.Result.Params).Where(p => p.Name == 'CSSContent').ToArray()[0];

                                Me.Parent.Model.JSEditor.setValue(jsContent.Value);
                                Me.Parent.Model.HTMLEditor.setValue(htmlContent.Value);
                                Me.Parent.Model.CSSEditor.setValue(cssContent.Value);
                            });
                        }

                    }, argParams);
                }
            }


        }

    };
    return Me;
});