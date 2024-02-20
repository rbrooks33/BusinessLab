Apps.Define([], function () {

    let Me = {
        Root: Apps.Components.BPL,
        Initialize: function (callback) {
            callback();
        },
        //Show: function (relationshipName) {
        //    Me.Root.Areas.PopulateAreaModels(function () {

        //        //Apps.OpenDialog(Me, 'StepRelationshipsDialog', 'Edit ' + relationshipName + ' Steps');
        //        //Apps.BindElement('')
        //    });
        //},
        Model: {
            AppStepRelationships: ''
        },
        Controls: {
            AppStepRelationships: {
                Bound: function () {

                    let that = this;

                    let appId = this.Selector.attr('data-bind-uniqueid');

                    Apps.Data.Execute('GetAppSteps', [{ Name: 'AppID', Value: appId.toString() }], function (steps) {

                        let stepsHtml = '';
                        $.each(steps.Data, function (i, s) {
                            stepsHtml += s.StepName
                        });

                        let html = Me.UI.Templates.StepRelationships_Template.HTML(['Apps', stepsHtml]);
                        that.Selector.html(html);
                    });

                }
            },
            StepRelationshipWorkflows: {
                Bound: function () {

                }
            }
        }
    };
    return Me;
});