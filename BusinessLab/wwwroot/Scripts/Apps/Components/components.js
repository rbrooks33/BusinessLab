{
    "Components": [
       
     
        {
            "Name": "Helpers",
            "Load": true,
            "UI": false,
            "Initialize": true,
            "Components": [
                {

                    "Name": "PushHub",
                    "Load": true,
                    "UI": false,
                    "Initialize": true
                },
                {

                    "Name": "Actions",
                    "Load": true,
                    "UI": true,
                    "Initialize": true
                },
               {

                    "Name": "Dialogs",
                    "Load": true,
                    "UI": true,
                    "Initialize": true
                },
                {

                    "Name": "Debug",
                    "Load": true,
                    "UI": true,
                    "Initialize": true
                },
                {

                    "Name": "Auth",
                    "Load": true,
                    "UI": true,
                    "Initialize": true,
                    "Components": [
                        {
                            "Name": "Google",
                            "Load": false,
                            "Initialize": true,
                            "UI": true
                        },
                        {
                            "Name": "Microsoft",
                            "Load": false,
                            "Initialize": true,
                            "UI": true
                        },
                        {
                            "Name": "Passwordless",
                            "Load": true,
                            "Initialize": true,
                            "UI": true
                        }
                    ]
                },
                {
                    "Name": "Controls",
                    "Load": true,
                    "UI": false,
                    "Initialize": true,
                    "Components": [
                        {
                            "Name": "QuickTable",
                            "Load": true,
                            "UI": false,
                            "Initialize": true
                        },
                        {
                            "Name": "QuickGrid",
                            "Load": true,
                            "UI": false,
                            "Initialize": true
                        }

                    ]
                }

            ]
        },
        {
            "Name": "Home",
            "Load": true,
            "UI": true,
            "Initialize": true,
            "Components": [
                {
                    "Name": "Plan",
                    "Load": true,
                    "UI": true,
                    "Initialize": true,
                    "Components": [
                        {
                            "Name": "Areas",
                            "Load": true
                        },
                        {
                            "Name": "Workflows",
                            "Load": true
                        },
                        {
                            "Name": "Steps",
                            "Load": true,
                            "Initialize": true,
                            "UI":true
                        }

                    ]
                },
                {
                    "Name": "Create",
                    "Load": true,
                    "UI": true,
                    "Initialize": true,
                    "Components": [
                        {
                            "Name": "Templates",
                            "Load": false,
                            "Initialize": true,
                            "UI":true
                        }
                    ]
                },
                {
                    "Name": "Test",
                    "Load": true,
                    "UI": true,
                    "Initialize": true
                },
                {
                    "Name": "Publish",
                    "Load": true,
                    "UI": true,
                    "Initialize": true
                },
                {
                    "Name": "Track",
                    "Load": true,
                    "UI": true,
                    "Initialize": true
                }

            ]
        }

    ]
}