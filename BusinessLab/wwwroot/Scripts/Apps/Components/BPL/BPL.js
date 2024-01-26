Apps.Define([], function () {
    var Me = {
        Name: 'BPLHome',
        Color: '#1961AE',
        Initialize: function (callback) {

            Apps.Data.RegisterMyPOST(Me, 'Main', Apps.ActiveDeployment.WebRoot + '/api', [], true);
            Apps.Data.RegisterMyPOST(Me, 'MainAsync', Apps.ActiveDeployment.WebRoot + '/api', [], false);
            Apps.Data.RegisterGlobalPOST(Apps.ActiveDeployment.WebRoot + '/api', [], true);

            callback();

        },
        Show: function () {


            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetConfigs"), function (data) {

                Me.Model.Configs = data.Data;


                //Me.UI.HideAll();

                Me.Dashboard.Show();

                Me.ShowHeroHeader();

                Me.StartComponents();

                //Apps.AutoBind();


                Apps.Components.Helpers.PushHub.Subscriber().Publish('AppLoaded', true); //Notify app finished loading

                //Apps.Components.Helpers.Debug.Init();
                //$('#contentDebug').show();
                //Apps.Components.Helpers.Debug.UI.Show(400);

                //Apps.Require(['/Scripts/Apps/Resources/funcunit.js'], function (funcunit) { });
                //    if (Me.Model.LoggedInAs == 0)
                //        Me.ShowUsersDialog();
            });
        },
        ShowHeroHeader: function () {
            $.each($('.HeaderHeroHtml'), function (i, h) {
                $(h).html(Me.ConfigValue('HeaderHeroHtml'));
            });

        },
        UseBuiltInDB: function () {

            Me.Model.UseDB = 'UseBuiltInDB';

            let post = Me.Data.Posts.Main;
            let args = {
                Params: [
                    {Name: 'RequestName', Value: 'UseDB'}
                ],
                Message: 'local'
            };
            post.Refresh(args, [], function () {
                if (post.Success) {
                    location.reload();
                }
                else {
                    Me.HandleError(post.Result);
                }
            });
        },
        UseATECDevDB: function () {

            Me.Model.UseDB = 'UseATECDevDB';

            let post = Me.Data.Posts.Main;
            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'UseDB' }
                ],
                Message: 'dev'
            };
            post.Refresh(args, [], function () {
                if (post.Success) {
                    location.reload();
                }
                else {
                    Me.HandleError(post.Result);
                }
            });
        },
        UseATECLiveDB: function () {

            Me.Model.UseDB = 'UseATECLiveDB';

            let post = Me.Data.Posts.Main;
            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'UseDB' }
                ],
                Message: 'live'
            };
            post.Refresh(args, [], function () {
                if (post.Success) {
                    location.reload();
                }
                else {
                    Me.HandleError(post.Result);
                }
            });
        },
        ShowUsersDialog: function () {

            Me.Actions.Run(15, function (users) {

                Me.Model.Users = users;

                let table = Apps.Bind.GetTable({
                    data: users,
                    tableid: 'tablewithnoid',
                    theadbinding: function (firstRow) {
                        let th = '<th></th>';
                        $.each(Object.keys(firstRow), function (i, column) {
                            th += '<th>' + column + '</th>';
                        });
                        return th;
                    },
                    rowbinding: function (row) {
                        let td = '<tr>';
                        td += '<td><div class="btn btn-warning" onclick="Apps.Components.BPL.SetWorkingAs(' + row.UserID + ');">Me</div></td>'
                        $.each(Object.keys(row), function (i, column) {
                            td += '<td>' + row[column] + '</td>';
                        });
                        td += '</tr>';
                        return td;
                    }

                });


                Apps.OpenDialog(Me, 'WorkingAs_Dialog', 'I am working as...', Me.UI.Templates.WorkingAs.HTML([table[0].outerHTML]));
            });
        },
        SetWorkingAs: function (userId) {
            Me.Model.LoggedInAs = userId;
            let user = Enumerable.From(Me.Model.Users).Where(u => u.UserID == userId).ToArray()[0];
            $('.LoggedInAs').text(user.FirstName + ' ' + user.LastName);
            Apps.Components.Helpers.Dialogs.Close('WorkingAs_Dialog');
        },
        StartComponents: function () {
            let startComponents = Enumerable.From(Apps.ComponentList).Where(c => c.Start && c.Config.Start && c.Config.Start === true).ToArray();
            $.each(startComponents, function (index, component) {
                component.Start();
            });
        },
        HandleError: function (result) {

            Apps.Components.Helpers.Debug.Trace(this, JSON.stringify(result));

            vNotify.error({ text: 'A problem ocurred on the server.', title: 'Server Error', sticky: false, showClose: true });
            let textDiv = $('body > div.vnotify-container.vn-top-right > div > div.vnotify-text');
            textDiv.append('<div class="btn btn-dark" style="margin-top:10px;" onclick="Apps.Components.Helpers.OpenResponse(\'' + escape(JSON.stringify(result)) + '\');">View Response</div>');

            Apps.Notify('danger', 'Problem getting report.');
            $('#Admin_Editor_EditSaveResult').text(JSON.stringify(result));

        },
        ShowResult: function (result) {

            Apps.Components.Helpers.Debug.Trace(this, JSON.stringify(result));

            vNotify.info({ text: 'For testing, here is the result of your last operation.', title: 'Result Info', sticky: false, showClose: true });
            let textDiv = $('body > div.vnotify-container.vn-top-right > div > div.vnotify-text');
            textDiv.append('<div class="btn btn-dark" style="margin-top:10px;" onclick="Apps.Components.Helpers.OpenResponse(\'' + escape(JSON.stringify(result)) + '\');">View Response</div>');

            //Apps.Notify('info', 'Problem getting report.');
            //$('#Admin_Editor_EditSaveResult').text(JSON.stringify(result));

        },
        ShowBackground: function () {

            Apps.Components.Helpers.Debug.Trace(this);

            $('#Main_Modal_Background').show();
        },
        HideBackground: function () {

            Apps.Components.Helpers.Debug.Trace(this);

            $('#Main_Modal_Background').hide();
        },
        ConfigValue: function (configName) {
            let ret = "";
            let configs = Enumerable.From(Me.Model.Configs).Where(c => c.ConfigName == configName).ToArray();
            if (configs.length > 0)
                ret = configs[0].ConfigValue;
            return ret;
        },

        Model: {
            Users: [],
            LoggedInAs: 0,
            Configs: [],
            SampleConfig: { "ConfigID": 1, "ConfigName": "SqlConnection", "ConfigValue": "1", "Created": "", "Updated": "" }
        },
        Controls: {
            LoggedInAs: {
                Bound: function () {
                    //this.Selector.html('Nobody');
                }
            }
        }

    };
    return Me;
})