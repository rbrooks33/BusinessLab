Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            callback();
        },
        Get: function () {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetCloudQueue"), function (data) {
                Me.Model.CloudQueue = data;
            });

        },
        Upsert: function () {
            let params = [
                { Name: 'Receiver', Value: '' },
                { Name: 'Contents', Value: '' }
            ]
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("UpsertCloudQueue"), function (data) {
                Me.Model.CloudQueue = data;
            }, params);

        },
        Model: {
            CloudQueue: []
        }
    };
    return Me;
})