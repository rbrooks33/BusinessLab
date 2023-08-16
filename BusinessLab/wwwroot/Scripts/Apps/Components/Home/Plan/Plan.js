define([], function () {
    var Me = {
        MouseX: 0,
        MouseY: 0,
        AreaList: [],
        WorkflowList: [],
        StepList: [],
        Initialize: function (callback) {

            callback();
        },
        Show: function () {

            Me.UI.Show();
            Me.PutOnTop();

            Me.GetCollectionHtml('GetAreas', function (list) {

                Me.AreaList = list;

                Me.GetCollectionHtml('GetWorkflows', function (list) {

                    Me.WorkflowList = list

                    Me.GetCollectionHtml('GetSteps', function (list) {

                        Me.StepList = list;

                        let html = Me.Areas.Create();

                        $('#Plan_Area_Container').html(html);

                    });
                });
            });
        },
        PutOnTop: function () {
            $('.Stage_Container').css('z-index', '100');
            $('.Plan_Container').css('z-index', '200');
            $('.HeadsUp_StageButtons').children().removeClass('active');
            $('.StageButtons_Plan').addClass('active');

        },
        GetCollectionHtml: function (requestName, callback) {

            let post = Apps.Components.Home.Main;

            let args = {
                "Params":
                    [
                        { "Name": "RequestName", "Value": requestName }
                    ]
            };

            post.Refresh(args, [], function () {

                if (post.Success) {
                    callback(post.Data);
                }
                else
                    Apps.Components.Home.HandleError(post.Result);
            });
        },
        OldWay: function () {
            $("body").mousemove(function (e) {
                Me.MouseX = e.pageX;
                Me.MouseY = e.pageY;
                $('#Plan_AreaContainer > div > div > div:nth-child(1) > h3').text(Me.MouseX + ', ' + Me.MouseY);
            })

            Me.UI.Show();
            Me.PutOnTop();

            $(document.body).append(Me.UI.Templates.Plan_Workflow_Thumbnail_Menu.HTML()) //Drop menu on body to show on top of all

            Me.GetCollectionHtml('GetWorkflows', function (list) {
                var workflows = list;

                Me.GetCollectionHtml('GetSteps', function (list) {
                    var steps = list;

                    Me.GetCollectionHtml('GetAreas', function (areas) {

                        var areaAccordions = '';
                        $.each(areas, function (index, a) {

                            let areaWorkflows = Enumerable.From(workflows).Where(w => w.AreaID == a.AreaID).ToArray();
                            areaWorkflowHtml = '';
                            $.each(areaWorkflows, function (index, w) {
                                areaWorkflowHtml += Me.UI.Templates.Plan_Workflow_Thumbnail.HTML([w.WorkflowID, w.WorkflowName]); // '<div class="Plan_Workflow_Thumbnail">' + w.WorkflowName + '</div> ';
                            });
                            if (areaWorkflows.length == 0)
                                areaWorkflowHtml = '[No ' + a.AreaName + ' workflows]';

                            let areaContent = Me.UI.Templates.Plan_Area_Content.HTML([a.AreaID, a.AreaName, areaWorkflowHtml]);
                            areaAccordions += Me.UI.Templates.Plan_Area_Accordion.HTML([a.AreaID, a.AreaName, areaContent]);

                        });

                        let areaAccordionWrapper = Me.UI.Templates.Plan_Area_AccordionWrapper.HTML([areaAccordions]);

                        $('#Plan_AreaContainer').html(areaAccordionWrapper);

                    });
                });
            });

        },
        ShowMenu: function () {

            $('.bodydropdown').css('left', (Me.MouseX - 400) + 'px');
            $('.bodydropdown').css('top', (Me.MouseY - 190) + 'px');
            $('.bodydropdown').show();

        },
        HideMenu: function () {
            $('.bodydropdown').hide();
        }

    };
    return Me;
})