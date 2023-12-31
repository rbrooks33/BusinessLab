﻿Apps.Define([], function () {
    var Me = {
        Name: 'Home',
        Color: '#1961AE',
        Reports: null,
        Controls: null,
        Initialize: function (callback) {


            //Main: Used for internal methods
            Apps.Data.RegisterMyPOST(Me, 'Main', Apps.ActiveDeployment.WebRoot + '/api', [], true);
            Apps.Data.RegisterMyPOST(Me, 'MainAsync', Apps.ActiveDeployment.WebRoot + '/api', [], false);

            //Actions (universal actions)
            Apps.Data.RegisterMyPOST(Me, 'Actions', Apps.ActiveDeployment.WebRoot + '/ActionsEvent', [], true);
            Apps.Data.RegisterMyPOST(Me, 'ActionsAsync', Apps.ActiveDeployment.WebRoot + '/ActionsEvent', [], false);

            //Files
            //Apps.Data.RegisterMyUpload(Me, 'Files', base + '/FilesEvent', [], true);

            Me.Main = Me.Data.Posts.Main;
            Me.Actions = Me.Data.Posts.Actions;
            Me.Controls = Apps.Components.Helpers.Controls;
            Me.Files = Me.Data.Posts.Files;


            callback();

        },
        Show: function () {

            Apps.Components.Helpers.Debug.Trace(this);

            Me.UI.Show();
            Me.PutOnTop();
        },
        PutOnTop: function () {

            Apps.Components.Helpers.Debug.Trace(this);

            $('.Stage_Container').css('z-index', '100');

            $('.HomeContent_Container').css('z-index', '200');
            $('.HeadsUp_StageButtons').children().removeClass('active');
            $('.StageButtons_Home').addClass('active');
        },
        HandleError: function (result) {

            Apps.Components.Helpers.Debug.Trace(this, JSON.stringify(result));

            vNotify.error({ text: 'A problem ocurred on the server.', title: 'Server Error', sticky: false, showClose: true });
            let textDiv = $('body > div.vnotify-container.vn-top-right > div > div.vnotify-text');
            textDiv.append('<div class="btn btn-dark" style="margin-top:10px;" onclick="Apps.Components.Helpers.OpenResponse(\'' + escape(JSON.stringify(result)) + '\');">View Response</div>');

            Apps.Notify('danger', 'Problem getting report.');
            $('#Admin_Editor_EditSaveResult').text(JSON.stringify(result));

        },
        ShowBackground: function () {

            Apps.Components.Helpers.Debug.Trace(this);

            $('#Main_Modal_Background').show();
        },
        HideBackground: function () {

            Apps.Components.Helpers.Debug.Trace(this);

            $('#Main_Modal_Background').hide();
        }

    };
    return Me;
})