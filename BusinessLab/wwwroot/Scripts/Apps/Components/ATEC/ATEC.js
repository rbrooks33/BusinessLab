Apps.Define([], function () {
    let Me = {
        Initialize: function (callback) {
            Me.UI.HideAll();
            callback();
        },
        Show: function () {
            // $('.SelectEnvironment').val(1);
        },
        SelectEnvironment: function (html) {

            Apps.BindElement('ATECUtilities', Me);

            Me.OrderViewer.GetOrderLogsTable(function (data) {
                Me.Data.Logs = data.Logs;
                Me.Controls.ATECUtilities.Selector.html(data.HTML);
                Apps.BindElement('AppStepsGrid', Me);
            });
        },
        ViewOrder(orderHtml) {
            let escaped = unescape(orderHtml);
            let result = JSON.parse(escaped);

            //Codes
            let codes = '<table class="table">';
            if (result.Codes && result.Codes.length > 0) {
                $.each(codes, function (i, c) {
                    codes += '<tr>';
                    codes += '  <td>' + c.ID + '</td>';
                    codes += '  <td>' + c.Description + '</td>';
                    codes += '</tr>';
                });
                codes += '</table>';
            }

            //Data
            let data = result.Data;

            //PropertyValidations
            let propertyValidations = ''; //TODO

            //Dynamic Data
            let dynamicData = JSON.stringify(result.DynamicData);

            //Fail Messages
            let fails = '<table class="table">';
            $.each(result.FailMessages, function (i, f) {
                fails += '<tr>';
                fails += '  <td>' + f + '</td>';
                fails += '<tr>';
            });
            fails += '</table>';

            //Params
            let params = '<table class="table">';
            $.each(result.Params, function (i, p) {
                params += '<tr>';
                params += '  <td>' + p.Name + '</td>';
                params += '  <td>' + p.Value + '</td>';
                params += '<tr>';
            });
            params += '</table>';

            //Success Messages
            let successes = '<table class="table">';
            $.each(result.SuccessMessages, function (i, s) {
                successes += '<tr>';
                successes += '  <td>' + s + '</td>';
                successes += '<tr>';
            });
            successes += '</table>';


            Apps.OpenDialog(Me, 'ViewOrderDialog', 'Order Viewer', Me.UI.Templates.OrderResult_Template.HTML([
                codes,
                data,
                propertyValidations,
                dynamicData,
                fails,
                result.Message,
                params,
                result.Success,
                successes
            ]));

            Me.Model.JSONEditor = ace.edit('JSONEditorViewer', {
                autoScrollEditorIntoView: false,
                selectionStyle: "text"
            });
            Me.Model.JSONEditor.setTheme("ace/theme/terminal");
            mode = ace.require("ace/mode/json").Mode;
            Me.Model.JSONEditor.session.setMode(new mode());

        },
        ViewSessions: function (customerId) {

            let environment = $('.SelectEnvironment').val();

            Apps.Data.Execute("External.GetSessions", [
                { Name: 'Environment', Value: environment },
                { Name: 'CustomerID', Value: customerId.toString() }],
                function (data) {

                    let sorted = Enumerable.From(data.Data).OrderByDescending(d => d.Updated).ToArray();
                    let html = Me.OrderViewer.GetDataTable(sorted);

                    Apps.OpenDialog(Me, 'ViewSessionsDialog', 'Customer Sessions', html);
                });
        },
        Last24Hours: function (stepId) {
            //let logs = [];
            //$.each(Me.Data.Logs, function (i, l) {
            //    let elapsed = Apps.Util.TimeElapsed2(new Date(l.Created));
            //    if (elapsed.Hours <= 24)
            //        logs.push(l);
            //});
            let logs = Enumerable.From(Me.Data.Logs).Where(l => l.StepID == stepId && Apps.Util.TimeElapsed2(new Date(l.Created)).Hours <= 24).ToArray();
            let html = Me.OrderViewer.GetDataTable(logs);
            Apps.OpenDialog(Me, 'Last24HoursDialog', 'Last 24 Hours', html);
        },
        Last7Days: function (stepId) {
            //let logs = [];
            //$.each(Me.Data.Logs, function (i, l) {
            //    let elapsed = Apps.Util.TimeElapsed2(new Date(l.Created));
            //    if (elapsed.Hours <= 24)
            //        logs.push(l);
            //});
            let logs = Enumerable.From(Me.Data.Logs).Where(l => l.StepID == stepId && Apps.Util.TimeElapsed2(new Date(l.Created)).Days <= 7).ToArray();
            let html = Me.OrderViewer.GetDataTable(logs);
            Apps.OpenDialog(Me, 'Last7DaysDialog', 'Last 7 Days', html);
        },
        AllSessions: function () {

        },
        Model: {
            JSONEditor: {}
        },
        Data: {
            DevLogs: {},
            DevCustomers: []
        },
        Controls: {
            ATECUtilities: {
                Bound: function () {
                    //this.Refresh();
                }
            },
            AppStepsGrid: {
                Bound: function () {

                    let that = this;
                    let environment = $('.SelectEnvironment').val();

                    Apps.Data.Execute("External.GetSalesWizardSteps", [{ Name: 'Environment', Value: environment }],
                        function (data) {

                            let html = '<table class="table">';
                            html += '<th>Step ID</th><th>Step</th><th>Workflow ID</th><th>Workflow</th><th>Last 24 Hours</th><th>Last 7 Days</th>'
                            $.each(data.Data, function (i, s) {
                                let stepLogsLast24 = Enumerable.From(Me.Data.Logs).Where(l => l.StepID == s.StepID && Apps.Util.TimeElapsed2(new Date(l.Created)).Hours <= 24).ToArray();
                                let stepLogsLast7Days = Enumerable.From(Me.Data.Logs).Where(l => l.StepID == s.StepID && Apps.Util.TimeElapsed2(new Date(l.Created)).Days <= 7).ToArray();

                                html += Me.UI.Templates.AppStepGrid_Row_Template.HTML([s.StepID, s.StepName, s.WorkflowID, s.WorkflowName, stepLogsLast24.length, stepLogsLast7Days.length]);
                            });
                            html == '</table>';

                            that.Selector.html(html);
                        });

                }
            }
        }
    };
    return Me;
});