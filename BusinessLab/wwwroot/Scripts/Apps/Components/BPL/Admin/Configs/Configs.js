Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            callback();
            Apps.Components.Helpers.PushHub.Subscriber().Subscribe('AppLoaded', Me.AppStarted);
        },
        AppStarted: function () {
            Apps.Data.ExecutePostArgs(Apps.Data.GetPostArgs("GetConfigs"), function (data) {
                Me.Model.Configs = data;
            });
        },
        GetConfigValue: function (configName) {
            let ret = "";
            let configs = Enumerable.From(Me.Model.Configs).Where(c => c.ConfigName == configName).ToArray();
            if (configs.length > 0)
                ret = configs[0].ConfigValue;
            return ret;
        },

        Model: {
            Configs: [],
            SampleConfig: { "ConfigID": 1, "ConfigName": "SqlConnection", "ConfigValue": "1", "Created": "", "Updated": "" }
        }
    };
    return Me;
})