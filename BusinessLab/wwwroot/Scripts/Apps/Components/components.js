{
    "Components": [
       
      
        {
            "Name": "Helpers",
            "Load": true,
            "UI": false,
            "Initialize": true,
            "Components": [
                {

                    "Name": "Dialogs",
                    "Load": true,
                    "UI": true,
                    "Initialize": true
                },
                {

                    "Name": "Debug",
                    "Load": false,
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
            "Name": "Main",
            "Load": true,
            "UI": true,
            "Initialize": true
        }

    ]
}