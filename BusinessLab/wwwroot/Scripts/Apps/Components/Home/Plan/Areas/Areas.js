Apps.Define([], function () {
    var Me = {
        SelectedAreaID: 0,
        Create: function () {

            var settings =
            {
                id: "Plan_Areas_Table",
                data: Me.Parent.AreaList,
                title: "Areas",
                tablestyle: "padding-left:50px;padding-right:50px;",
                savecallback: function (obj, fieldName) {
                    Apps.Components.BPL.Areas.Save(obj, fieldName);
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
                            Apps.Grids.ShowChildren('Workflows', 'AreaID', 'AreaName', arguments[1], arguments[2], Apps.Components.Home.Plan.Areas.SetWorkflows);
                        }
                    }
                ],
                fields: [
                    Apps.Grids.GetField('AreaID'),
                    Apps.Grids.GetField('AreaName')
                ],
                columns: [
                    Apps.Grids.GetColumn('AreaID', 'ID'),
                    Apps.Grids.GetColumn("AreaName", "Area Name")
                ]
            };

            return Apps.Grids.GetTable(settings);
        },
        Add: function () {

            let post = Apps.Components.Home.Main;

            let myargs = {
                Params: [
                    { Name: "RequestName", Value: "AddAction" }
                ]

            };

            post.Refresh(myargs, [], function () {

                if (post.Success) {
                    Apps.Components.Helpers.Actions.GetActions();
                    Apps.Notify('success', 'Action added!');
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });
        },
        Save: function (action) {
           
            let post = Apps.Components.Home.Main;

            action.ActionName = Apps.Components.Helpers.Actions.SelectedAction.ActionName;
            action.ActionDescription = Apps.Components.Helpers.Actions.SelectedAction.ActionDescription;
            action.UniqueID = Apps.Components.Helpers.Actions.SelectedAction.UniqueID;

            let args = {
                Params: [
                    { Name: 'RequestName', Value: 'SaveAction' }
                ],
                Data: action
            };

            post.Refresh(args, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Saved! Please refresh actions until Rodney implements two-way binding :)');
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });

        },
        //ShowChildren: function (childTableName, parentIdFieldName, parentNameFieldName, args) {

        //    //Uses callback since it might need to populate tests for first time show
        //    Me.GetChildren(childTableName, parentIdFieldName, parentNameFieldName, args[1], args[2], function (parent, parentIdFieldName, parentNameFieldName, childCellId) {


        //    });
        //},
        //ShowChildren: function (childTableName, parentIdFieldName, parentNameFieldName, parent, parentRow, setDataFunction) {

        //    //Look for row under Test Plan. If not there, create it. If there, detach it.
        //    let childRowId = childTableName + '_Row_' + parent[parentIdFieldName]; //create a unique row id
        //    let childRow = $('#' + childRowId);
        //    let childCellId = childRowId + '_Cell'; //Where the html goes

        //    //Insert row under parent if it's not there yet
        //    if (childRow.length == 0) {

        //        //insert child table below parent row (adjust col span as needed)
        //        childRow = $('<tr id="' + childRowId + '" style="display:none;"><td id="' + childCellId + '" colspan="6"></td></tr>');
        //        $(parentRow).after(childRow);
        //    }

        //    setDataFunction(parent, parentIdFieldName, parent[parentNameFieldName], childCellId);

        //    if (childRow.css('display') == 'none' || childRow.css('display') == undefined)
        //        childRow.show(500);
        //    else
        //        childRow.hide(500);
            
        //},
        SetWorkflows: function (parent, parentIdFieldName, parentNameFieldName, childCellId) {

            //CUSTOM CODE TO SET DATA TO CHILD CELL:
            Me.SelectedAreaID = parent[parentIdFieldName];

            let data = Enumerable.From(Me.Parent.WorkflowList).Where(w => w.AreaID == parent[parentIdFieldName]).ToArray();

            Me.Parent.Workflows.SetHTML(parentNameFieldName, data, $('#' + childCellId));
        }
    };
    return Me;
})