{
    "Components": [
       
        {
            "Name": "BPL",
            "Load": true,
            "Initialize": true,
            "UI":true,
            "Components": [
                {
                    "Name": "Actions",
                    "Load": true,
                    "Initialize": true,
                    "UI": true
                },
                {
                    "Name": "Admin",
                    "Load": true,
                    "Initialize": true,
                    "UI": true
                },
                {
                    "Name": "Apps",
                    "Load": true,
                    "Initialize": true,
                    "UI": true
                },
                {
                    "Name": "Areas",
                    "Load": true,
                    "Initialize": true,
                    "UI": true,
                    "Start":true,
                    "Components": [
                        {
                            "Name": "Workflows",
                            "Load": true,
                            "Initialize": true,
                            "Components": [
                                {
                                    "Name": "Steps",
                                    "Load": true,
                                    "Initialize": true,
                                    "UI":true
                                }
                            ]
                        }
                    ]
                },
                {
                    "Name": "Dashboard",
                    "Load": true,
                    "Initialize": true,
                    "UI": true
                },
                {
                    "Name": "Jobs",
                    "Load": true,
                    "Initialize": true,
                    "UI":true
                },
                {
                    "Name": "Logs",
                    "Load": true,
                    "Initialize": true,
                    "UI": true
                },
                {
                    "Name": "Notes",
                    "Load": true,
                    "Initialize": true,
                    "UI": true
                },
                {
                    "Name": "Projects",
                    "Load": true,
                    "Initialize": true,
                    "UI": true,
                    "Start": true,
                    "Components": [
                        {
                            "Name": "ProjectTable",
                            "Load": true,
                            "Initialize": false
                        }
                    ]
                },
                {
                    "Name": "Tasks",
                    "Load": true,
                    "Initialize": true,
                    "UI": true,
                    "Components": [
                        {
                            "Name": "TaskTable",
                            "Load": true,
                            "Initialize": false
                        }
                    ]
                },
                {
                    "Name": "Visuals",
                    "Load": true,
                    "Initialize": true,
                    "UI": true
                }

            ]
        },
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

                    "Name": "UserSettings",
                    "Load": false,
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
                    "Load": false,
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
                    "Name": "Dashboard",
                    "Load": false,
                    "Initialize": true
                },
                {
                    "Name": "Tasks",
                    "Load": false,
                    "Initialize": true
                },
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
                    "Load": false,
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
                    "Load": false,
                    "UI": true,
                    "Initialize": true,
                    "Components": [
                        {
                            "Name": "Runs",
                            "Load": true,
                            "Initialize": true,
                            "UI": true
                        },
                        {
                            "Name": "TestPlans",
                            "Load": true,
                            "Initialize": true,
                            "UI": true,
                            "Components": [
                                {
                                    "Name": "Tests",
                                    "Load": false,
                                    "Initialize": true,
                                    "UI": false,
                                    "Components": [
                                        {
                                            "Name": "Steps",
                                            "Load": true,
                                            "Initialize": true,
                                            "UI": false,
                                            "Components": [
                                                {
                                                    "Name": "EditTest",
                                                    "Load": true,
                                                    "Initialize": true,
                                                    "UI": true
                                                }
                                            ]
                                        },
                                        {
                                            "Name": "TestGrid",
                                            "Load": true,
                                            "Initialize": true,
                                            "UI": false
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "Name": "Publish",
                    "Load": false,
                    "UI": true,
                    "Initialize": true
                },
                {
                    "Name": "Track",
                    "Load": false,
                    "UI": true,
                    "Initialize": true
                }

            ]
        }

    ]
}