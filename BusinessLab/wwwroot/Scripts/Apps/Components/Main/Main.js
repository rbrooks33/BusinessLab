define([], function () {
    var Me = {
        Reports: null,
        Controls: null,
        Initialize: function (callback) {

            //Main: Used for internal methods
            Apps.Data.RegisterMyPOST(Me, 'Main', Apps.ActiveDeployment.WebRoot + '/MainEvent', [], true);
            Apps.Data.RegisterMyPOST(Me, 'MainAsync', Apps.ActiveDeployment.WebRoot + '/MainEvent', [], false);

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

            Me.UI.Templates.Main_Template.Show();

        },
        HandleError: function (result) {

            vNotify.error({ text: 'A problem ocurred on the server.', title: 'Server Error', sticky: false, showClose: true });
            let textDiv = $('body > div.vnotify-container.vn-top-right > div > div.vnotify-text');
            textDiv.append('<div class="btn btn-dark" style="margin-top:10px;" onclick="Apps.Components.Helpers.OpenResponse(\'' + escape(JSON.stringify(result)) + '\');">View Response</div>');

            Apps.Notify('danger', 'Problem getting report.');
            $('#Admin_Editor_EditSaveResult').text(JSON.stringify(result));

        },
        ShowBackground: function () {
            $('#Main_Modal_Background').show();
        },
        HideBackground: function () {
            $('#Main_Modal_Background').hide();
        }

    };
    return Me;
})