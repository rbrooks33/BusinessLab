Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Show: function () {
            Me.UI.HideAll(); //Hides all but me
            //Apps.BindHTML(Me.UI.Selector, Me.DashboardControls, true);
            Me.Root.ShowHeroHeader();
            //setInterval(Me.RefreshLogTotals, 5000);

            Apps.BindElement('AreaContainerHTML', Me);

        },
        Model: {
            Areas: [],
            AreaContainerHTML: ''
        },
        Controls: {
            AreaContainerHTML: {
                Bound: function () {

                    let that = this;
                    Me.Root.Areas.Get(function (data) {


                        Me.Model.Areas = data.Data;

                        let html = '';

                        $.each(Me.Model.Areas, function (i, a) {
                            html += Me.UI.Templates.Dashboard_Area_Template.HTML([a.AreaID, a.AreaName]);    
                        });

                        that.Selector.html(html);
                        
                    });
                }
            } 
        }
    };
    return Me;
});