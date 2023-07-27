define([], function () {
    var Me = {
        Initialize: function (callback) {

            callback();
        },
        Show: function () {

		let html = Me.UI.Templates.Apply_Main.HTML();
		//$('#Kentico_Apply_Container').html(html);
        }

    };
    return Me;
})