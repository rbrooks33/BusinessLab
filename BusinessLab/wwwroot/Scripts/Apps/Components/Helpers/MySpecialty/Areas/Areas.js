define([], function () {
    var Me = {
        Post: null,
        Areas: [],
        Initialize: function (callback) {


            if (callback)
                callback();
        },
        GetData: function (result) {

             Me.Post = Apps.Components.Common.Data.Posts.Main;
           ////Areas
            //let areasArgs = {
            //    "Args": [
            //        { "Value": { "ArgName": "Method", "ArgValue": "GetAreas" } }
            //    ]
            //};
            let request = {
                Params: [
                    {
                        Name: "RequestCommand", Value: "GetAllAreas"
                    }
                ]
            };

            Me.Post.Refresh(request, [], function () {

                if (Me.Post.Success) {

                    result.AddSuccess('Areas post successful.');
                    Me.Areas = Me.Post.Data;
                }
                else
                    result.AddFail('Areas post failed.', JSON.stringify(Me.Post.Result));
            });
        }
    };
    return Me;
});