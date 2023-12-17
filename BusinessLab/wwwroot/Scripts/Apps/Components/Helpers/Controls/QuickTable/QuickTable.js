Apps.Define([], function () {
    var Me = {
        Initialize: function (callback) {

            callback();
        },
        Create: function (collectionDataSource, selectorDropLocation, thead, row) {

            selectorDropLocation.empty();
            let table = Me.GetTable(collectionDataSource, thead, row);
            //let table = Apps.Bind.GetTable({
            //    data: collectionDataSource,
            //    tableid: 'tablewithnoid',
            //    theadbinding: function (firstRow) {
            //        let th = '';
            //        $.each(Object.keys(firstRow), function (i, column) {
            //            th += '<th>' + column + '</th>';
            //        });
            //        return th;
            //    },
            //    rowbinding: function (row) {
            //        let td = '<tr>';
            //        $.each(Object.keys(row), function (i, column) {
            //            td += '<td>' + row[column] + '</td>';
            //        });
            //        td += '</tr>';
            //        return td;
            //    }

            //});

            selectorDropLocation.append(table);
        },
        GetTable: function (collection, thead, row) {

            let settings = {
                data: collection,
                tableid: 'tablewithnoid'
            };

            if (thead)
                settings.theadbinding = thead;
            else {
                settings.theadbinding = function (firstRow) {
                    let th = '';
                    $.each(Object.keys(firstRow), function (i, column) {
                        th += '<th>' + column + '</th>';
                    });
                    return th;
                }
            }

            if (row)
                settings.rowbinding = row;
            else {
                settings.rowbinding = function (row) {
                    let td = '<tr>';
                    $.each(Object.keys(row), function (i, column) {
                        td += '<td>' + row[column] + '</td>';
                    });
                    td += '</tr>';
                    return td;
                }
            };

            return Apps.Bind.GetTable(settings)[0].outerHTML;

        }
    };
    return Me;
})