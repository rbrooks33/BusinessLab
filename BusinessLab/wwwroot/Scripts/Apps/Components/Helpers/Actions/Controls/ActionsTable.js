﻿define([], function () {
    var Me = {
        Create: function (actions) {

            var settings =
            {
                id: "Admin_Editor_ActionsTable",
                data: actions,
                title: "Actions",
                tablestyle: "padding-left:50px;padding-right:50px;",
                savecallback: function () {
                    Apps.Components.Helpers.Actions.ActionsTable.Save(arguments[0]);
                },
                tableactions: [
                    {
                        text: 'Add Action',
                        actionclick: function () {
                            Apps.Components.Helpers.Actions.ActionsTable.Add(arguments);
                        }
                    }
                ],
                rowbuttons: [
                    {
                        text: 'Edit',
                        buttonclick: function () {
                            Apps.Components.Helpers.Actions.Edit(arguments);
                        }
                    }
                ],
                fields: [
                    Me.GetField('ActionID'),
                    Me.GetField('ActionName'),
                    Me.GetField('ActionDescription'),
                    Me.GetField('UniqueID')
                ],
                columns: [
                    Me.GetColumn("ActionID", "ID"),
                    Me.GetColumn("ActionName", "Action"),
                    Me.GetColumn("ActionDescription", "Description"),
                    Me.GetColumn("UniqueID", "Tag")
                ]
            };

            return Apps.Grids.GetTable(settings);
        },
        GetField: function (name) {

            //var callback = objCallback;
            //var save = null;
            //if (callback) {
                save = function () {
                    //let mycallback = callback;
                    arguments[1][arguments[5]] = $(arguments[2]).val(); //save to obj property
                    arguments[4](arguments[1]);
                };
            //}
            return {
                name: name,
                editclick: function () { },
                saveclick: save
            }
        },
        GetColumn: function (fieldname, text) {
            return { fieldname: fieldname, text: text };
        },
        Add: function (args) {

            let post = Apps.Components.Home.Main;

            let myargs = {
                Method:"AddAction"

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

            let myargs = {
                Method: "SaveAction",
                ActionID: action.ActionID,
                ActionName: action.ActionName,
                ActionDescription: action.ActionDescription,
                VariableDelimiter: action.VariableDelimiter
            };

            post.Refresh(myargs, [], function () {

                if (post.Success) {
                    Apps.Notify('success', 'Action Saved!');
                    Apps.Components.Helpers.Actions.GetActions();
                }
                else {
                    Apps.Components.Home.HandleError(post.Result);
                }
            });

        }
    };
    return Me;
})