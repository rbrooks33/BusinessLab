Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            callback();
        },
        GetOrderLogsTable: function (callback) {

            let environment = $('.SelectEnvironment').val();
            let logsEnvironment = '0';
            let customerEnvironment = '0';

            if (environment == 1) {
                //Dev
                logsEnvironment = '1';
                customerEnvironment = '5';
            }
            else if (environment == 2) {
                //Staging
                logsEnvironment = '3';
                customerEnvironment = '6';
            }
            else if (environment == 3) {
                //Live
                logsEnvironment = '3';
                customerEnvironment = '7';
            }
            Apps.Data.Execute("External.GetOrderLogs", [{ Name: 'Environment', Value: logsEnvironment }], function (result) {

                let data = {
                    Logs: result.Data.Logs,
                    Orders: result.Data.Orders,
                    Customers: [],
                    HTML: ''
                };

                let distinctCustomers = Enumerable.From(data.Orders).Distinct(c => c.CustomerID).ToArray();

                let customerList = '';
                $.each(distinctCustomers, function (i, c) {
                    customerList += c.CustomerID + ',';
                });
                customerList += customerList.substring(0, customerList.length - 1);

                Apps.Data.Execute("External.GetCustomers", [
                    { Name: 'Environment', Value: customerEnvironment },
                    { Name: 'CustomerIDs', Value: customerList }
                ], function (result) {

                    data.Customers = result.Data;

                    let html = Apps.Bind.GetTable({
                        data: data.Orders,
                        tableid: 'tablewithnoid',
                        theadbinding: function (firstRow) {
                            let th = '';
                            $.each(Object.keys(firstRow), function (i, column) {
                                th += '<th>' + column + '</th>';
                            });
                            return th;
                        },
                        rowbinding: function (row) {
                            let td = '<tr>';
                            $.each(Object.keys(row), function (i, column) {
                                if (column == 'Order') {
                                    td += '<td>';
                                    td += '  <div class="btn-group">'
                                    td += '    <div class="btn btn-primary" onclick="Apps.Components.ATEC.ViewOrder(\'' + escape(row[column]) + '\');">View Order</div>';
                                    td += '    <div class="btn btn-primary" onclick="Apps.Components.ATEC.ViewSessions(' + row['CustomerID'] + ');">View Sessions</div>';
                                    td += '  </div>';
                                    td += '</td> ';
                                }
                                else if (column == 'Created') {
                                    td += '<td>' + Apps.Util.FormatDateTime2(row[column]);
                                    td += '<br/><span style="font-style:italic;font-size:smaller;">' + Apps.Util.TimeElapsed(new Date(row[column])) + '</span></td>';
                                }
                                else if (column == 'CustomerID') {
                                    let customer = Enumerable.From(data.Customers).Where(c => c.customerid == row[column]).ToArray();
                                    if (customer.length == 1) {
                                        td += '<td>' + customer[0].Column1 + ' (' + customer[0].customerid + ')</td>';
                                    }
                                    else
                                        td += '<td>not found</td>';
                                }
                                else {
                                    td += '<td>' + row[column] + '</td>';

                                }
                            });
                            td += '</tr>';
                            return td;
                        }

                    });

                    data.HTML = html[0].outerHTML;

                    callback(data);
                });
            });

        },
        GetDataTable: function (data) {

            let html = Apps.Bind.GetTable({
                data: data,
                tableid: 'tablewithnoid',
                theadbinding: function (firstRow) {
                    let th = '';
                    $.each(Object.keys(firstRow), function (i, column) {
                        th += '<th>' + column + '</th>';
                    });
                    return th;
                },
                rowbinding: function (row) {
                    let td = '<tr>';
                    $.each(Object.keys(row), function (i, column) {
                        td += '<td>' + row[column] + '</td>';
                    });
                    td += '</tr>';
                    return td;

                }
            });
        
            return html[0].outerHTML;
        }
    };
    return Me;
})