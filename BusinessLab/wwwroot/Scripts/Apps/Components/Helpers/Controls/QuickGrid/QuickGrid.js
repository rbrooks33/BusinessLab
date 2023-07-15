define([], function () {
    var Me = {
        Initialize: function (callback) {
            callback();
        },
        Scaffold: function (tableName, table, keyColumn) {

        //    UPDATE
        //    Transactions
        //    SET

        //    Amount = @@Amount
        //    WHERE
        //    TransactionID = @@TransactionID

            if (table && table.length > 0) {
                let scaffold = '';

                scaffold += 'UPDATE \n';
                scaffold += '\t' + tableName + '\n';
                scaffold += 'SET \n'

                let columns = Object.keys(table[0]);

                $.each(columns, function (index, c) {

                    scaffold += '\t' + c + ' = @@' + c + ', \n';

                });

                scaffold = scaffold.substring(0, scaffold.length - 3) + '\n';
                scaffold += 'WHERE \n';
                scaffold += '\t' + keyColumn + ' =  @@' + keyColumn;

                console.info(scaffold);
            }
            else
                Apps.Notify('warning', 'Scaffold table is null or has no rows.');
        },
        Create: function (settings, tableid, title, collection, savecallback, tableactions, rowbuttons) {

            //Fields
            var fields = [];
            var columns = [];

            $.each(Object.keys(collection[0]), function (index, key) {
                let fieldSettings = Enumerable.From(settings).Where(function (fs) { return fs.FieldName == key; }).ToArray();
                if (fieldSettings.length == 1) {
                    let fs = fieldSettings[0];

                    if (fs.Visible) {

                        //field
                        let field = Me.GetField(key);

                        fields.push(field);

                        //column
                        let column = Me.GetColumn(key);
                        if (fs.Text)
                            column.text = fs.Text;
                        columns.push(column);
                    }
                }
                else {
                    fields.push(Me.GetField(key));
                    columns.push(Me.GetColumn(key));
                }
            });

            var settings =
            {
                id: tableid,
                data: collection,
                title: title,
                tablestyle: " ",
                savecallback: savecallback,
                tableactions: tableactions,
                rowbuttons: rowbuttons,
                fields: fields,
                columns: columns
            };

            return Apps.Grids.GetTable(settings);
        },
        GetField: function (name) {

            save = function (td, obj, editcontrol, viewcontrol, savecallback, fieldname) {
                $(viewcontrol).text($(editcontrol).val()); //Save to view
                obj[fieldname] = $(editcontrol).val(); //Save to obj 
                savecallback(obj);
            };

            return {
                name: name,
                editclick: function () { },
                saveclick: save
            }
        },
        GetColumn: function (fieldname, text) {
            if (!text)
                text = fieldname;

            return { fieldname: fieldname, text: text };
        },
    };
    return Me;
})