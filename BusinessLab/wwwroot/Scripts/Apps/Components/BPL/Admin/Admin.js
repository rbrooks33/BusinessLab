Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            //Me.UI.Drop(); //This allows auto-binding to see me
            callback();
        },
        Show: function () {
            Me.UI.Drop();
            Me.UI.HideAll(); //Hides all but me
            Apps.BindHTML(Me.UI.Selector, Me, true);
        },
        Start: function () {

        },
        Model: {
            ConnectionsHTML: '',
            SoftwareHTML: ''
        },
        Controls: {
            ConnectionsHTML: {
                Bound: function () {
                    let thisSelector = this.Selector;
                    Me.Connections.ConnectionsTable.Refresh(function (tableHtml) {
                        thisSelector.html(tableHtml);
                    });

                }
            },
            SoftwareHTML: {
                Bound: function () {
                    var thisSelector = this.Selector;
                    Me.Software.GetTable(function (software) {
                        let softwareTableHTML = software;
                        thisSelector.html(softwareTableHTML); // Me.Software.UI.Templates.SoftwareTemplate.HTML([softwareTableHTML]));
                    });
                }
            }
        }
    };
    return Me;
});