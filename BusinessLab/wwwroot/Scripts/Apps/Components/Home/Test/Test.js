define([], function () {
    var Me = {
        Initialize: function (callback) {

            callback();
        },
        Show: function () {

            Me.UI.Show();
            Me.PutOnTop();
        },
        PutOnTop: function () {

            $('.Stage_Container').css('z-index', '100');

            $('.Test_Container').css('z-index', '200');
            $('.HeadsUp_StageButtons').children().removeClass('active');
            $('.StageButtons_Test').addClass('active');
        }
    };
    return Me;
})