﻿Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Name: 'BPLHome',
        Color: '#1961AE',
        Initialize: function (callback) {

            Apps.Data.RegisterMyPOST(Me, 'Main', Apps.ActiveDeployment.WebRoot + '/api', [], true);
            Apps.Data.RegisterMyPOST(Me, 'MainAsync', Apps.ActiveDeployment.WebRoot + '/api', [], false);
            Apps.Data.RegisterGlobalPOST(Apps.ActiveDeployment.WebRoot + '/api', [], true);

            callback();

        },
        Show: function () {

            Me.Logs.Add(2, 'test step 2 log', 'testing adding from js', 'rodney', 1);

            Me.Dashboard2.Show();

            Me.Admin.Configs.Refresh(function () {

                Me.ShowHeroHeader();

                Me.StartComponents();

                //Apps.AutoBind();

                Apps.Components.Helpers.PushHub.Subscriber().Publish('AppLoaded', true); //Notify app finished loading

            });
        },
        ////AppLink: function (linkDestination) {
        ////    switch (linkDestination) {
        ////        case 'workflow_steps':

        ////            let links = Enumerable.From(Me.AppLinks).Where(l => l.Name == linkDestination).ToArray();
        ////            if (links.length == 1) {
        ////            //    $.each(links[0].Links, function (i, l) {
        ////            //        //setTimeout(eval(l), 10000);

        ////                //    });
        ////                eval(links[0].Links[1]);
        ////            }
        ////            break;
        ////    }
        ////},
        ////AppLinks: [
        ////    {
        ////        Name: 'workflow_steps',
        ////        Links: [
        ////            'Apps.Components.BPL.Areas.Show()',
        ////            'Apps.Grids.ShowChildren(\'Workflows\', \'AreaID\', \'AreaName\', arguments[1], arguments[2], Apps.Components.BPL.Areas.SetWorkflows)'
        ////        ]
        ////    }
        ////],
        ShowHeroHeader: function () {
            $.each($('.HeaderHeroHtml'), function (i, h) {
                let headerHtml = Me.Admin.Configs.GetConfigValue('HeaderHeroHtml');
                $(h).html(headerHtml);
            });
            Apps.BindElement('CurrentBPLConnection', Me);
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

        Model: {
            Users: [],
            LoggedInAs: 0
        },
        Controls: {
            LoggedInAs: {
                Bound: function () {
                    //this.Selector.html('Nobody');
                }
            },
            CurrentBPLConnection: {
                Defaults: function () {
                    let that = this;
                    Apps.Data.Execute('GetBPLConnectionString', [], function (result) {

                        that.Selector.text('Environment: ' + result.Data[0].ConnectionName);

                    });

                }
            }
        }

    };
    return Me;
})