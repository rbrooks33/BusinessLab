using BusinessLabClassLib;
using Microsoft.Data.SqlClient;
using System.Data;
using static IT_Admin.Code.External;

namespace IT_Admin.Code
{
	public class External
	{
		public static void GetCustomers(ref Result result)
		{
			if (result.ParamExists("Environment", Result.ParamType.Int) 
				&& result.ParamExists("CustomerIDs"))
			{
				int envInt = Convert.ToInt32(result.GetParam("Environment"));

				var environment = (ExternalData.ConnectionType)envInt;

				string sql = "select c.customerid, c.CustomerFirstName + ' ' + c.CustomerLastName from com_customer c where c.customerid in (" + result.GetParam("CustomerIDs") + ")";

				result.Data = ExternalData.Execute(sql, environment, null);
				result.Success = true;
			}
		}
		public class OrderLogs
		{
			public DataTable Logs { get; set; }
			public DataTable ExceptionLogs { get; set; }
			public DataTable Orders { get; set; }
			public DataTable Sessions { get; set; }
		}
		public static void GetOrderLogs(ref Result result)
		{
			if(result.ParamExists("Environment", Result.ParamType.Int))
			{
				int envInt = Convert.ToInt32(result.GetParam("Environment"));

				var environment = (ExternalData.ConnectionType)envInt;

				var orderLogs = new OrderLogs();

				//Logs
				string sql = @"
					SELECT 
						l.LogID,
						l.LogSeverity,
						StepID = (SELECT TOP 1 StepID FROM ATECApi.dbo.Steps WHERE StepID =  l.StepID OR UniqueID = l.StepUniqueID),
						l.UniqueID,
						l.Title,
						l.Description,
						l.Created,
						l.AppID,
						l.UserFullName,
						l.StepUniqueID,
						l.AppUniqueID
					FROM 
						ATECApi.dbo.Logs l
					WHERE
						StepID IN (
							SELECT s.StepID FROM Apps a
							INNER JOIN Apps_Steps ss ON a.AppID = ss.AppID
							INNER JOIN Steps s ON s.StepID = ss.StepID
							INNER JOIN Workflows w ON w.WorkflowID = s.WorkflowID
							WHERE a.AppID = 9
						)
						OR
						StepUniqueID IN (
							SELECT s.UniqueID FROM ATECApi.dbo.Apps a
							INNER JOIN ATECApi.dbo.Apps_Steps ss ON a.AppID = ss.AppID
							INNER JOIN ATECApi.dbo.Steps s ON s.StepID = ss.StepID
							INNER JOIN Workflows w ON w.WorkflowID = s.WorkflowID
							WHERE a.AppID = 9

						)
				";
				orderLogs.Logs = ExternalData.Execute(sql, environment, null);

				//Exceptions
				sql = "select top 100 * from ATECApi.dbo.Logs where LogSeverity = 4 order by Created desc";
				orderLogs.ExceptionLogs = ExternalData.Execute(sql, environment, null);

				//Orders
				sql = "select top 100 * from ATECApiData.dbo.SalesWizard_OrderHistory order by Created desc";
				orderLogs.Orders = ExternalData.Execute(sql, environment, null);

				//Sessions
				sql = "select top 500 * from ATECApiData.dbo.ATECSessions order by updated desc";
				orderLogs.Sessions = ExternalData.Execute(sql, environment, null);

				result.Data = orderLogs;
				result.Success = true;
			}
		}
		public static void GetSalesWizardSteps(ref Result result)
		{
			if (result.ParamExists("Environment", Result.ParamType.Int))
			{
				int envInt = Convert.ToInt32(result.GetParam("Environment"));
				var environment = (ExternalData.ConnectionType)envInt;

				int appId = 0;
				if (environment == ExternalData.ConnectionType.DevAtecApi)
					appId = 9;
				else if(environment == ExternalData.ConnectionType.LiveAtecApi)
					appId = 9;

				string sql = @"
				SELECT s.StepID, s.StepName, s.WorkflowID, w.WorkflowName 
				FROM Apps a
				INNER JOIN Apps_Steps ss ON a.AppID = ss.AppID
				INNER JOIN Steps s ON s.StepID = ss.StepID
				INNER JOIN Workflows w ON w.WorkflowID = s.WorkflowID
				WHERE a.AppID = " + appId.ToString();

				result.Data = ExternalData.Execute(sql, environment);
				result.Success = true;

			}
		}
		public static void GetWorkflowApps(ref Result result)
		{
			if (result.ParamExists("Environment", Result.ParamType.Int))
			{
				int envInt = Convert.ToInt32(result.GetParam("Environment"));

				var environment = (ExternalData.ConnectionType)envInt;


				result.Data = ExternalData.Execute(@"
                SELECT DISTINCT Apps.AppID, Apps.AppName, Workflows.AreaID FROM Apps
                INNER JOIN Apps_Steps ON Apps_Steps.AppID = Apps.AppID
                INNER JOIN Steps ON Steps.StepID = Apps_Steps.StepID
                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
            ", environment);
				
				result.Success = true;
			}
		}
		public static void GetWorkflowActions(ref Result result)
		{
			if (result.ParamExists("Environment", Result.ParamType.Int))
			{
				int envInt = Convert.ToInt32(result.GetParam("Environment"));

				var environment = (ExternalData.ConnectionType)envInt;

				result.Data = ExternalData.Execute(@"
                SELECT DISTINCT Actions.ActionID, Actions.ActionName, Workflows.AreaID FROM Actions
                INNER JOIN Actions_Steps ON Actions_Steps.ActionID = Actions.ActionID
                INNER JOIN Steps ON Steps.StepID = Actions_Steps.StepID
                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
            ", environment);

				result.Success = true;
			}
		}
		public static void GetSessions(ref Result result)
		{
			if(result.ParamExists("Environment") && result.ParamExists("CustomerID"))
			{
				int envInt = Convert.ToInt32(result.GetParam("Environment"));

				var environment = (ExternalData.ConnectionType)envInt;

				var connectionType = ExternalData.ConnectionType.DevAtecApiData;
				if (environment == ExternalData.ConnectionType.LiveAtecApi)
					connectionType = ExternalData.ConnectionType.LiveAtecApiData;

					string sql = @"

					SELECT * FROM ATECSessions WHERE KenticoCustomerID = @CustomerID
				";

				var p = new List<SqlParameter>() { new SqlParameter() { ParameterName = "@CustomerID", Value = result.GetParam("CustomerID") } };
				result.Data = ExternalData.Execute(sql, connectionType, p.ToArray());
				result.Success = true;
			}
		}

	}
}
