Apps.Define([], function () {
    var Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Model: {
            Actions: [],
            ActionTriggerTypes: [
                {
                    Name: 'JS',
                    Code: '',
                    Run: ''
                },
                {
                    Name: 'SQL',
                    Code: '',
                    RunButton: ''
                }
            ],
            BPLActionsHomePage: '',
            EditorTypes: [
                'SQL',
                'CSharp',
                'CMD',
                'PS'
            ],
            EditedAction: {
                UniqueID: '',
                PSEditor: null,
                CMDEditor: null
            },
            SQLEditor: '',
            SampleAction: {
                "ActionID": 1,
                "ActionName": "jlkjl",
                "ActionDescription": "@arg1",
                "EditorType": "csharp",
                "Code": "var tester = 1;",
                "CodeCMD": '',
                "CodePS": '',
                "Sql": "@arg2",
                "VariableDelimiter": "@arg4",
                "UniqueID": "@arg5",
                "IsJob": 1,
                "SuccessActionID": 2,
                "FailActionID": 3,
                "SuccessActionDescription": "@arg8",
                "FailActionDescription": "@arg7",
                "RepeatQuantity": 2,
                "RepeatIntervalSeconds": 5,
                "CronSchedule": "@arg11"
            }
        }

    };
    return Me;
});