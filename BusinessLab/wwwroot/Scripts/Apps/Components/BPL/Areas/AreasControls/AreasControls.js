Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            callback();
        },
        
        Model: {
            AreasTable: '',
            SelectedAreaID: 0,
            Areas: [],
            Workflows: [],
            Steps: [],
            SelectedConnectionID: 0
        },
        Controls: {
            AreasTable: {
                Bound: function () {
                    this.Refresh();
                },
                Refresh: function () {

                    let that = this;

                    var settings =
                    {
                        id: "Plan_Areas_Table",
                        data: Me.Parent.Model.Areas,
                        title: "Areas",
                        tablestyle: "padding-left:50px;padding-right:50px;",
                        savecallback: function (obj, fieldName) {

                            let args = {
                                Params: [
                                    { Name: 'RequestName', Value: 'UpsertArea' },
                                    { Name: 'AreaID', Value: obj.AreaID.toString() }
                                ],
                                Data: obj
                            };

                            let root = Apps.Components.BPL;
                            let me = root.Areas;
                            let selector = me.Controls.Areas.Selector;
                            let mypost = Apps.Components.BPL.Data.Posts.Main;
                            mypost.Refresh(args, [], function () {

                                if (mypost.Success) {
                                    //Find row and update
                                    let row = Enumerable.From(me.Model.Areas).Where(d => d.AreaID == obj.AreaID).ToArray();
                                    if (row.length == 1) {
                                        row[0] = obj;
                                        me.Controls.Areas.Refresh();
                                        Apps.Notify('success', fieldName + ' updated.');
                                    }
                                    else
                                        Apps.Notify('warning', 'Unable to update ' + fieldName);
                                }
                                else {
                                    root.HandleError(mypost.Result);
                                }
                            });

                            //Apps.Notify('info', 'Saved ' + fieldName);
                        },
                        tableactions: [
                            {
                                text: 'Add Area',
                                actionclick: function () {
                                    Apps.Components.BPL.Areas.Add();
                                }
                            }
                        ],
                        rowbuttons: [
                            {
                                text: 'Workflows',
                                buttonclick: function () {
                                    //Pass in distinct table name and field name of parent's unique id
                                    Apps.Grids.ShowChildren('Workflows', 'AreaID', 'AreaName', arguments[1], arguments[2], Apps.Components.BPL.Areas.SetWorkflows);
                                }
                            }
                        ],
                        fields: [
                            Apps.Grids.GetField('AreaID'),
                            Apps.Grids.GetField('AreaName'),
                            Apps.Grids.GetField('WorkflowCount')
                        ],
                        columns: [
                            Apps.Grids.GetColumn('AreaID', 'ID', function (area) {
                                return '#' + area.AreaID;
                            }),
                            Apps.Grids.GetColumn("AreaName", "Area Name"),
                            Apps.Grids.GetColumn("WorkflowCount", "Workflows")
                        ]
                    };

                    let tableHtml = Apps.Grids.GetTable(settings);

                    that.Selector.html(tableHtml);
                    // });
                }
            }
        }
    };
    return Me;
});