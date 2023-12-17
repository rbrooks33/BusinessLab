Apps.Define([], function () {
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

            $('.Track_Container').css('z-index', '200');

            //Set to active
            $('.HeadsUp_StageButtons').children().removeClass('active');
            $('.StageButtons_Track').addClass('active');
        }
    };
    return Me;
})