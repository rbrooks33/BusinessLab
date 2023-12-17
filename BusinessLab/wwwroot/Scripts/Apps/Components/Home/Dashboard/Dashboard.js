Apps.Define([], function () {
    let Me = {
        Initialize: function () {

        },
        Model: {
            AreaHTML: '',
            //Will look for Areas
            Areas: [
                {
                    AreaID: 1, AreaName: 'area one', Workflows: [
                        { WorkflowID: 1, WorkflowName: 'workflow one' },
                        { WorkflowID: 2, WorkflowName: 'workflow two' }
                    ]
                },
                {
                    AreaID: 2, AreaName: 'area two', Workflows: [
                        { WorkflowID: 3, WorkflowName: 'workflow three' },
                        { WorkflowID: 4, WorkflowName: 'workflow four' }
                    ]
                }
            ]
        },
        Controls: {
            AreaHTML: {
                Bound: function () {
                    let areaHtml =  ''
                }
            }
        }
    };
    return Me;
});