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
            $(Me.UI.Selector).css('z-index', '200');
        }

    };
    return Me;
})