define([], function () {
    var Me = {
        Workflows: [],
        Post: null,
        Initialize: function (callback) {

            if (callback)
                callback();
        },
        GetData: function (result) {

            Me.Post = Apps.Components.Common.Data.Posts.Main;
            //Workflows
            //let workflowsArgs = {
            //    "Args": [
            //        { "Value": { "ArgName": "RequestCommand", "ArgValue": "GetAllWorkflows" } }
            //    ]
            //};

            let request = {
                Params: [
                    {
                        Name: "RequestCommand", Value: "GetAllWorkflows"
                    }
                ]
            };

            Me.Post.Refresh(request, [], function () {

                if (Me.Post.Success) {
                    result.AddSuccess('Workflows post success.');
                    Me.Workflows = Me.Post.Data;
                }
                else
                    result.AddFail('Workflows post fail.', JSON.stringify(Me.Post.Result));
            });

        },
        GetHTML: function (areaId, result) {

            Me.Post = Apps.Components.Common.Data.Posts.Main;

            let areaWorkflowData = Enumerable.From(Me.Workflows).Where(function (w) { return w.AreaID == areaId; }).ToArray();
            let areaWorkflowsHtml = '';
            areaWorkflowsHtml += '<table>';
            $.each(areaWorkflowData, function (index, aw) {

                //Workflows
                areaWorkflowsHtml += '<div style="font-weight:400;">';
                areaWorkflowsHtml += '#' + aw.WorkflowID + ' ' + aw.WorkflowName;

                areaWorkflowsHtml += '<div>';

                //Steps
                areaWorkflowsHtml += '<div style="margin-bottom:10px;font-size:x-small;display: flex; flex-direction: row; flex-wrap: wrap;">';
                $.each(aw.Steps, function (index, s) {
                    areaWorkflowsHtml += '<div class="MySpecialty_Step_Container">'
                    areaWorkflowsHtml += '<div style="font-weight:bold;">' + s.StepName + '</div>';
                    areaWorkflowsHtml += '<div>' + s.StepDescription + '</div>';
                    areaWorkflowsHtml += '</div>'
                });
                areaWorkflowsHtml += '</div>';

                //Actions
                areaWorkflowsHtml += '</div>';


            });
            areaWorkflowsHtml += '</table>';
            areaWorkflowsHtml += '</div>';

            return areaWorkflowsHtml;
        }
    };
    return Me;
});