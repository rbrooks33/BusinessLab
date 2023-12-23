Apps.Define([], function () {
    var Me = {
        Name: 'BPLHome',
        Color: '#1961AE',
        Reports: null,
        Controls: null,
        Initialize: function (callback) {

            Apps.Data.RegisterMyPOST(Me, 'Main', Apps.ActiveDeployment.WebRoot + '/api', [], true);
            Apps.Data.RegisterMyPOST(Me, 'MainAsync', Apps.ActiveDeployment.WebRoot + '/api', [], false);

            callback();

        },
        Show: function () {

            //Me.UI.HideAll();
            Me.Dashboard.Show();

            Me.StartComponents();

            Apps.AutoBind();

            Apps.Components.Helpers.PushHub.Subscriber().Publish('AppLoaded', true); //Notify app finished loading

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