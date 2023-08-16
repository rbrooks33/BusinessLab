define([], function () {
    var Me = {
        Initialize: function (callback) {

            callback();
        },
        Show: function () {

            Me.UI.Show();
            Me.PutOnTop();

            Apps.Tabstrips.Initialize('tabstripCreateStage');
            Apps.Tabstrips.Select('tabstripCreateStage', 0);

            $('#templateTabActionsContent').addClass('Create_Tabstrip');
            $('#templateTabWorkflowsContent').addClass('Create_Tabstrip').css('margin-left', '-96px');
            $('#templateTabVisualsContent').addClass('Create_Tabstrip').css('margin-left', '-214px');

            Apps.Components.Helpers.Actions.GetActions($('#templateTabActionsContent'));
        },
        PutOnTop: function () {

            $('.Stage_Container').css('z-index', '100');
            $('.Create_Container').css('z-index', '200');
            let stageButtons = $('.HeadsUp_StageButtons').children().removeClass('active');
            $('.StageButtons_Create').addClass('active');
        }

    };
    return Me;
})