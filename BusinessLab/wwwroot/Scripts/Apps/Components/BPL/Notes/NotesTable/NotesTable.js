Apps.Define([], function () {
    let Me = {
        Root: Apps.Components.BPL,
        Post: Apps.Components.BPL.Data.Posts.Main,
        Initialize: function (callback) {
            callback();
        },
        Refresh: function (callback) {

            Me.Root.Actions.Run(12, function (data) {

                var settings =
                {
                    id: "Notes_Table",
                    data: data,
                    title: "Notes",
                    tablestyle: "margin:50px;width:85%;",
                    savecallback: function (obj, fieldName) {
                        Apps.Components.BPL.Notes.NotesTable.Save(obj, fieldName);
                    },
                    tableactions: [
                        {
                            text: 'Add Note',
                            actionclick: function () {
                                Apps.Components.BPL.Notes.NotesTable.Add();
                            }
                        }
                    ],
                    fields: [
                        Apps.Grids.GetField('NoteID'),
                        Apps.Grids.GetField('NoteContent'),
                        Apps.Grids.GetField('EntityTypeID'),
                        Apps.Grids.GetField('CreatedBy'),
                        Apps.Grids.GetField('UpdatedBy'),
                        Apps.Grids.GetField('Created'),
                        Apps.Grids.GetField('Updated')
                    ],
                    columns: [
                        Apps.Grids.GetColumn("NoteID", "ID"),
                        Apps.Grids.GetColumn("NoteContent", "Note"),
                        Apps.Grids.GetColumn("EntityTypeID", "Entity Type"),
                        Apps.Grids.GetColumn("CreatedBy", "Created By"),
                        Apps.Grids.GetColumn("UpdatedBy", "Updated By"),
                        Apps.Grids.GetColumn("Created", "Created"),
                        Apps.Grids.GetColumn("Updated", "Last Updated")
                    ]
                };

                callback(Apps.Grids.GetTable(settings));

            });

        },
        Add: function () {
            let params = [{ Name: 'UserID', Value: Me.Root.Model.LoggedInAs.toString()}]
            Me.Root.Actions.Run(14, function () {
                Me.Parent.Controls.NotesHTML.Refresh();
            }, params);
        },
        Save: function (obj, changedFieldName) {

            let argParams = [
                { "Name": "NoteContent", "Value": obj.NoteContent },
                { "Name": "EntityContentID", "Value": obj.EntityTypeID.toString() },
                { "Name": "UpdatedBy", "Value": Me.Root.Model.LoggedInAs.toString() },
                { "Name": "NoteID", "Value": obj.NoteID.toString() }
            ];

            Me.Root.Actions.Run(13, function () {
                Me.Parent.Controls.NotesHTML.Refresh();
            }, argParams);
            //let args = {
            //    Params: [
            //        { Name: 'RequestName', Value: 'UpsertConnection' },
            //        { Name: 'ConnectionID', Value: obj.ConnectionID.toString() }
            //    ],
            //    Data: obj
            //};

            //let mypost = Apps.Components.BPL.Data.Posts.Main;
            //mypost.Refresh(args, [], function () {

            //    if (mypost.Success) {
            //        //Find row and update
            //        let row = Enumerable.From(me.Model.Connections).Where(d => d.ConnectionID == obj.ConnectionID).ToArray();
            //        if (row.length == 1) {
            //            row[0] = obj;
            //            me.CreateConnectionsTable(selector);
            //            Apps.Notify('success', 'Connection updated.');
            //        }
            //    }
            //    else {
            //        root.HandleError(mypost.Result);
            //    }
            //});

            Apps.Notify('info', 'Saved ' + changedFieldName);

        }
    };
    return Me;
});