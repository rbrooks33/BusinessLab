Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
            //Fires after all components are loaded but before root app fully loaded
            //Apps.Components.Helpers.PushHub.Subscriber().Subscribe('AppLoaded', Me.AppLoaded);

        },
        //AppLoaded: function () {
        //    Apps.BindHTML()
        //},
        Click: function (connectionId) {
            let params = [{ Name: 'ConnectionID', Value: connectionId.toString() }];
            Me.Root.Actions.Run(29, function (data) {

                let linkProp = Enumerable.From(data).Where(l => l.ConnectionTypePropertyID == 5).ToArray();
                let link = linkProp[0].Value;
                let popupProp = Enumerable.From(data).Where(l => l.ConnectionTypePropertyID == 7).ToArray();

                window.open(link,'_blank', 'popup=1,width=800,height=800');

            },params);
        },
        Model: {
            QuickLinksHTML: '',
            QuickLinksContents: ''
        },
        Controls: {
            QuickLinksHTML: {
                Bound: function () {
                    this.Selector.html(Me.UI.Templates.QuickLinksHTML_Template.HTML());
                    //Apps.BindHTML(this.Selector, Me);
                    Apps.BindElement('QuickLinksContents', Me);
                }
            },
            QuickLinksContents: {
                Bound: function () {
                    let that = this;
                    Me.Root.Actions.Run(28, function (data) {

                        let html = '';
                        $.each(data, function (i, q) {
                            html += Me.UI.Templates.QuickLinksRow_Template.HTML([q.ConnectionID, q.ConnectionName]);
                        });
                        that.Selector.html(html)

                    });

                }
            }
        }
    };
    return Me;
});