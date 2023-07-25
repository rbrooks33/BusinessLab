define([], function () {
    var Me = {
        Connection: null,
        Initialize: function (callback) {

            //Message format:
            /*
                let args = {
                    "Args": [
                        { "Value": { "ArgName": "Method", "ArgValue": "SendHubMessage" } },
                        { "Value": { "ArgName": "MessageType", "ArgValue": "LogPushNotification" } }
                        //other params
                    ]
                };

             */

            //Used locally or non-PA (PA connects via typescript)
            //if(Apps.ActiveDeployment.Debug) //TODO: allow non-debug for non-PA applications
            //    Me.Connect();
            //UPDATE: Best to allow all clients to decide whether to connect

            if (callback)
                callback();
        },
        Connect: function () {

            let url = Apps.ActiveDeployment.WebRoot + '/pushhub';

            console.log("starting with url " + url);

            Me.Connection = new signalR.HubConnectionBuilder()
                .withUrl(url, {
                    skipNegotiation : true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .configureLogging(signalR.LogLevel.Debug)                
                .build();


            async function start() {
                try {
                    await Me.Connection.start();
                    console.log("SignalR Connected.");
                } catch (err) {
                    console.log(err);
                    //setTimeout(start, 5000);
                }
            };

            //Me.Connection.onclose(async () => {
            //    await start();
            //});

            Me.Connection.on('SendToUser', function (message)
            {
                Me.Receive(message);
            });

            start();
        },
        Subscriptions: {},
        Subscriber: function () {

            //var topics = {};
            //var hOP = topics.hasOwnProperty;
            var hasProp = Me.Subscriptions.hasOwnProperty;

            return {
                Subscribe: function (topic, listener) {
                    // Create the topic's object if not yet created
                    if (!hasProp.call(Me.Subscriptions, topic)) Me.Subscriptions[topic] = [];

                    // Add the listener to queue
                    var index = Me.Subscriptions[topic].push(listener) - 1;

                    // Provide handle back for removal of topic
                    return {
                        remove: function () {
                            delete Me.Subscriptions[topic][index];
                        }
                    };
                },
                Publish: function (topic, info) {
                    // If the topic doesn't exist, or there's no listeners in queue, just leave
                    if (!hasProp.call(Me.Subscriptions, topic)) return;

                    // Cycle through topics queue, fire!
                    Me.Subscriptions[topic].forEach(function (item) {
                        item(info != undefined ? info : {});
                    });
                }
            };
        },
        Receive: function (message) {

            console.log('received: ' + JSON.stringify(message));

            let messageResult = MessageValue(message, "MessageType");
            if (messageResult.Success) {

                //Look for log notifications
                let logAppID = Apps.Components.Common.PushNotification.MessageValue(message, 'iLogAppID');
                if (logAppID.Success) {

                    let logAppIdData = logAppID.Data;

                    //Get app name
                    let logApp = Enumerable.From(Apps.Components.Admin.MySpecialty.LogApps.Apps).Where(function (a) { return a.iLogAppID == logAppIdData; }).ToArray();

                    if (logApp.length == 1) {

                        let logSeverity = Apps.Components.Common.PushNotification.MessageValue(message, 'iSeverity');
                        if (logSeverity.Success) {

                            if (logSeverity.Data == "Information")
                                Apps.Notify('info', logApp[0].sLogAppName);
                            if (logSeverity.Data == "Warning")
                                Apps.Notify('success', logApp[0].sLogAppName);
                            if (logSeverity.Data == "Error")
                                Apps.Notify('warning', logApp[0].sLogAppName);
                            if (logSeverity.Data == "Exception")
                                Apps.Notify('error', logApp[0].sLogAppName);
                        }

                    }
                }
                //Publish using message type as topic
                Apps.Components.Common.PushNotification.Subscriber().Publish(messageResult.Data, message);

                //switch (messageResult.Data) {


                //    case 'LogPushNotification':

                //        //Expecting iLogAppID and sUniqueID
                //        let logappid = MessageValue(message, "iLogAppID").Data;
                //        let uniqueid = MessageValue(message, "sUniqueID").Data;
                //        let goodcount = MessageValue(message, 'GoodCount').Data;
                //        let badcount = MessageValue(message, 'BadCount').Data;
                //        let uglycount = MessageValue(message, 'UglyCount').Data;
                //        let issuecount = MessageValue(message, 'IssueCount').Data;

                //        Apps.Components.Admin.MySpecialty.LogPushNotification(logappid, uniqueid);

                //        break;
                //}
            }

        },
        Send: function (message) {

            let messageResult = Me.MessageValue(message, "MessageType");
            if (messageResult.Success) {

                Apps.Components.Common.PushNotification.Subscriber().Publish(messageResult.Data, message);

            }
        },
        MessageValue: function (message, messageName) {
            let result = new Apps.Result();
            let messages = Enumerable.From(message)
                .Where(function (m) { return m.value.argName == messageName; })
                .ToArray();

            if (messages.length == 1) {
                result.Data = messages[0].value.argValue;
                result.Success = true;
            }
            return result;
        },
        //Use non-camelcase
        Send2: function (message) {

            //Works only while hosted in PA
            try {
                if (Common)
                    if (Common.GetProductPCF._this._connection)
                        Common.GetProductPCF._this._connection.invoke('SendToUser', message);
            }
            catch (err) {
                console.log('Common (PA context) not present.');
            }
        //    let messageResult = Me.MessageValue2(message, "MessageType");
        //    if (messageResult.Success) {

        //        Apps.Components.Common.PushNotification.Subscriber().Publish(messageResult.Data, message);

        //    }
        },
        MessageValue2: function (message, messageName) {
            let result = new Apps.Result();
            let messages = Enumerable.From(message.Args)
                .Where(function (m) { return m.Value.ArgName == messageName; })
                .ToArray();

            if (messages.length == 1) {
                result.Data = messages[0].Value.ArgValue;
                result.Success = true;
            }
            return result;
        }

    };
    return Me;
});