﻿//JS
define([], function () {
    var Me = {
        Editor: null,
        Initialize: function (callback) {

                Me.UI.Drop(); //Use Drop to put hidden on dom

        //        Apps.Data.RegisterGET('RunFunctional', '/api/TestRun/RunFunctional?appId={0}&type={1}&uniqueId={2}');

            callback();
        },
        Show: function (step) {

            Apps.UI.EditTest.Show(400);
            //Apps.Notify('info', 'showing step ' + step.ID);
            //let dialog = Apps.Components.Helpers.Dialogs;
            //dialog.Content('Apps_Test_TestPlans_Tests_Steps_EditScript_Dialog', 'hiya');
            //dialog.Open('Apps_Test_TestPlans_Tests_Steps_EditScript_Dialog');

            //EditTest_Content_Container
            Me.Editor = ace.edit("EditTest_Content_Container");
            Me.Editor.setTheme("ace/theme/monokai");
            Me.Editor.session.setMode("ace/mode/xml");
            //Me.Editor.renderer.onResize(true);
            Me.Editor.setValue(step.Script ? step.Script : '');

            $('#EditTest_Content_Container').css('height', '37vh').css('margin-top', '48px');
        },
        Hide: function () {
            Apps.UI.EditTest.Hide(400);
        },
        Save: function (hide) {
            Apps.Data.Steps.Selected.Script = Me.Editor.getValue();
            Apps.Components.Apps.Test.TestPlans.Tests.Steps.UpsertStep();
            if(hide)
                Me.Hide();
        },
        Run: function () {
            Apps.Data.RunFunctional.Refresh([Apps.Data.App.Data[0].AppID, 3, Apps.Data.Steps.Selected.ID], function () {

            });
        }
    };
    return Me;
});
