﻿using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using Quartz;
using System.Data;

namespace BusinessLabClassLib
{
	public class Action
	{
		public Action()
		{
			RepeatIntervalSeconds = 0;
			RepeatQuantity = 0;
			FailActionID = 0;
			SuccessActionID = 0;
		}
		public string ActionName { get; set; } = string.Empty;
		public string ActionDescription { get; set; } = "&nbsp;&nbsp;&nbsp;";
		public int ActionID { get; set; }
		public string EditorType { get; set; } = string.Empty;
		public string Code { get; set; } = String.Empty;
		public string CodeCMD { get; set; } = String.Empty;
		public string CodePS { get; set; } = String.Empty;
		public string VariableDelimiter { get; set; } = string.Empty;
		public string Sql { get; set; } = string.Empty;
		public string UniqueID { get; set; } = string.Empty;
		public bool IsJob { get; set; }
		public int SuccessActionID { get; set; }
		public int FailActionID { get; set; }
		public string SuccessActionDescription { get; set; } = string.Empty;
		public string FailActionDescription { get; set; } = string.Empty;
		public int RepeatQuantity { get; set; } = int.MinValue;
		public int RepeatIntervalSeconds { get; set; } = int.MinValue;
		public string CronSchedule { get; set; } = string.Empty;
		public int ConnectionID { get; set; } = 0;
	}
	public class Actions
	{
		WorkflowScheduler _scheduler;

		public Actions(WorkflowScheduler scheduler)
		{
			_scheduler = scheduler;
		}

		public static string _myusings = @"
            using BusinessLabClassLib;
            using System.Linq;
            using System.Collections.Generic;
            using Newtonsoft.Json;
        ";
		public static Action GetAction(string actionIdString, ref Result result)
		{
			var resultAction = new Action();

			if (int.TryParse(actionIdString, out int actionId))
			{
				resultAction = GetAction(actionId, ref result);
			}
			else
			{
				result.FailMessages.Add("Unable to parse action string " + actionIdString);
			}
			return resultAction;
		}

		public static Action GetAction(int actionId, ref Result result)
		{
			var resultAction = new Action();
			string sql = $"SELECT * FROM Actions WHERE ActionID = {actionId}";
			var dt = Data.Execute(Data.CreateParams(sql, sql, result.Params));

			//using (var db = new SqliteConnection(Resource.SqliteConnectionString))
			//{
			//	db.Open();
			//	var command = db.CreateCommand();
			//	command.CommandText = $"SELECT * FROM Actions WHERE ActionID = {actionId}";

			//	using (var reader = command.ExecuteReader())
			//	{
			//		var dt = new DataTable();
			//		dt.Load(reader);

			int.TryParse(dt.Rows[0]["SuccessActionID"].ToString(), out int successActionId);
			int.TryParse(dt.Rows[0]["FailActionID"].ToString(), out int failActionId);
			int.TryParse(dt.Rows[0]["RepeatIntervalSeconds"].ToString(), out int repeatIntervalSeconds);
			int.TryParse(dt.Rows[0]["RepeatQuantity"].ToString(), out int repeatQuantity);

			resultAction.Code = dt.Rows[0]["Code"].ToString();
			resultAction.CodeCMD = dt.Rows[0]["CodeCMD"].ToString();
			resultAction.CodePS = dt.Rows[0]["CodePS"].ToString();
			resultAction.UniqueID = dt.Rows[0]["UniqueID"].ToString();
			resultAction.ActionName = dt.Rows[0]["ActionName"].ToString();
			resultAction.ActionID = actionId;
			resultAction.ActionDescription = dt.Rows[0]["ActionDescription"].ToString();
			resultAction.CronSchedule = dt.Rows[0]["CronSchedule"].ToString();
			resultAction.EditorType = dt.Rows[0]["EditorType"].ToString();
			resultAction.FailActionDescription = dt.Rows[0]["FailActionDescription"].ToString();
			resultAction.SuccessActionDescription = dt.Rows[0]["SuccessActionDescription"].ToString();
			resultAction.SuccessActionID = successActionId; // dt.Rows[0]["SuccessActionID"].ToString();
			resultAction.FailActionID = failActionId; // dt.Rows[0]["FailActionID"].ToString();
			resultAction.RepeatIntervalSeconds = repeatIntervalSeconds; // dt.Rows[0]["RepeatIntervalSeconds"].ToString();
			resultAction.RepeatQuantity = repeatQuantity; // repeat dt.Rows[0]["RepeatQuantity"].ToString();
			resultAction.Sql = dt.Rows[0]["Sql"].ToString();
			resultAction.VariableDelimiter = dt.Rows[0]["VariableDelimiter"].ToString();
			resultAction.ConnectionID = Convert.ToInt32(dt.Rows[0]["ConnectionID"]);

			//result.Data = JsonConvert.SerializeObject(dt.Rows[0]);
			//resultAction = JsonConvert.DeserializeObject<BusinessLab.Actions.Action>(result.Data.ToString()); // (T)Convert.ChangeType(result.Data, typeof(T));
			result.Success = true;
			//	}
			//}

			return resultAction;
		}

		public static void RunActionTest(ref Result result)
		{
			if (result.ParamExists("ActionID", Result.ParamType.Int))
				Actions.RunAction(Convert.ToInt32(result.GetParam("ActionID")), ref result);

		}
		public static void RunAction(ref Result result)
		{
			//End point call
			if (result.ParamExists("ActionID", Result.ParamType.Int))
			{
				RunAction(Convert.ToInt32(result.GetParam("ActionID")), ref result);
			}
		}
		public static void RunAction(int actionId, ref Result result)
		{
			System.Collections.Generic.List<Result.Param> params2 = result.Params.Where(p => p.Name == "FirstName").ToList();

			result.Success = false; //reset

			string actionName = "[no name]";

			var action = GetAction(actionId, ref result);

			if (result.Success)
			{

				if (action != null)
				{
					actionName = action.ActionName;

					string editorType = action.EditorType.Trim().ToLower();

					if (editorType == "cs")
					{
						if (!String.IsNullOrEmpty(action.Code.Trim())
							&& !String.IsNullOrEmpty(action.VariableDelimiter.Trim()))
						{
							string code = action.Code;

							try
							{
								result.Success = false; //reset

								dynamic script = CSScriptLib.CSScript.Evaluator.LoadMethod(
								$@"
                                    {_myusings}

                                    public string Product(ref BusinessLabClassLib.Result result)
                                    {{
                                        {code}           
                                    }}      
                                ");
								//Action is a placeholder for back compat. and deprecated
								result.Data = script.Product(ref result);
								result.SuccessMessages.Add($"Action run success for #{actionId}. Result: {Newtonsoft.Json.JsonConvert.SerializeObject(result)}");
								//common.AddLog(iLogAppId, LogSeverities.Information, officeId, $"Action run success for #{actiontypeid}. Result: {Newtonsoft.Json.JsonConvert.SerializeObject(result)} code: " + code, "", hub);
								result.Success = true;
							}
							catch (Exception ex)
							{
								result.FailMessages.Add($"Action run for #{actionId} exception: {ex}");
								Logs.Add(0, $"Action run exception for #{action.ActionID.ToString()}", ex.ToString(), ref result, 4, "actionrun");
							}
						}
						else result.FailMessages.Add("Arg sCode null or empty.");
					}
					else if (editorType == "sql")
					{
						if (!String.IsNullOrEmpty(action.Sql.Trim())
							&& !String.IsNullOrEmpty(action.VariableDelimiter.Trim()))
						{
							string sql = action.Sql;

							if (action.ConnectionID > 0)
							{
								string sqlConnections = "SELECT ConnectionString FROM BPLConnections WHERE ConnectionID = " + action.ConnectionID.ToString();
								var dtConnection = Data.ExecuteSqlite(sqlConnections, null);
								string cs = dtConnection.Rows[0][0].ToString();

								var parameters = new List<SqlParameter>();

								foreach (var p in result.Params)
								{
									if (p.Name != "RequestName" && p.Name != "ActionID")
									{
										var param = new SqlParameter(action.VariableDelimiter + p.Name.ToString(), p.Value);
										parameters.Add(param);
									}
								}

								result.Data = Data.ExecuteSqlServer(sql, cs, parameters.ToArray());
							}
							else
							{
								var parameters = new List<Microsoft.Data.Sqlite.SqliteParameter>();

								foreach (var p in result.Params)
								{
									if (p.Name != "RequestName" && p.Name != "ActionID")
									{
										var param = new Microsoft.Data.Sqlite.SqliteParameter(action.VariableDelimiter + p.Name.ToString(), p.Value.ToString());
										parameters.Add(param);
									}
								}
								result.Data = Data.ExecuteSqlite(sql, parameters.ToArray());

							}

							//}
							result.Success = true;
						}
						else result.FailMessages.Add("Either Sql or Variable Delimiter empty.");

					}
					else if (editorType == "cmd")
					{
						//TODO: Find a way to handle "file name"
						//Command.Exec(action.CodeCMD, ref result); 
						//result.Success = true;
					}
					else if (editorType == "ps")
					{
						//BusinessLab.Command.Exec("git", "add", new Dictionary<string, string>() { { "-A", "" } }, workingFolder, ref result);
						Command.ExecuteCommand(action.CodePS, ref result);
						result.Success = true;
					}
					else
						result.FailMessages.Add("action type " + action.ActionName + " has no handler.");

				}
				else
					result.FailMessages.Add("Action not found for id " + actionId.ToString());
			}
			else
				result.FailMessages.Add("Getting action from db failed.");
		}


		//public static void TestSql(dynamic props, ref Result result)
		//{
		//	if (!String.IsNullOrEmpty(props.Sql.ToString().Trim())
		//		&& !String.IsNullOrEmpty(props.VariableDelimiter.ToString().Trim()))
		//	{
		//		string sql = props.Sql;

		//		var parameters = new List<Microsoft.Data.Sqlite.SqliteParameter>();

		//		//foreach (var arg in action.Args)
		//		//{
		//		//    if (arg.Value.ArgName.ToLower() != "method")
		//		//    {
		//		//        var param = new Microsoft.Data.SqlClient.SqlParameter("@" + arg.Value.ArgName, arg.Value.ArgValue);
		//		//        parameters.Add(param);
		//		//    }
		//		//}

		//		sql = (String.IsNullOrEmpty(sql) ? "select 'empty sql'" : sql);
		//		result.Data = Data.Execute(System.Runtime.CompilerServices.FormattableStringFactory.Create(sql, parameters.ToArray()));
		//		result.Success = true;
		//	}
		//	else result.FailMessages.Add("Arg sCode null or empty.");

		//}
		public static void AddAction(ref Result result)
		{
			string updatesql = $@"

                INSERT INTO Actions 
                    (ActionName, ActionDescription)
                VALUES
                    ('New Action', 'Description')
                    
                    ";
			result.Data = Data.Execute(Data.CreateParams(updatesql, updatesql, result.Params));

			result.Success = true;
		}
		public static void SaveAction(dynamic props, ref Result result)
		{

			if (int.TryParse(props.ActionID.ToString(), out int actionid))
			{
				if (props.RepeatInterval == null)
					props.RepeatInterval = 0;

				string updatesql = $@"

                    update actions set 
                    actionname = '{props.ActionName}' ,
                    actiondescription = '{props.ActionDescription}',
                    variabledelimiter = '{props.VariableDelimiter}',
                    repeatquantity = '{props.RepeatInterval}',
                    repeatintervalseconds = '{props.RepeatIntervalSeconds}'
                
                    where actionid = {actionid}
                    
                    ";
				result.Data = Data.Execute(Data.CreateParams(updatesql, updatesql, result.Params));
				result.Success = true;
			}


		}
		public static void SaveActionCode(dynamic props, ref Result result)
		{
			if (int.TryParse(props.ActionID.ToString(), out int actionid))
			{
				string updatesql = $@"

                    update actions set 
                    sql = '{props.Sql.ToString().Replace("'", "''")}' ,
                    Code = '{props.Code}',
                    EditorType = '{props.EditorType}',
                    UniqueID = '{props.UniqueID}',
                    VariableDelimiter = '{props.VariableDelimiter}'
                
                    where actionid = {actionid}
                    
                    ";
				result.Data = Data.Execute(Data.CreateParams(updatesql, updatesql, result.Params));
				result.Success = true;
			}
		}
		public static void GetWorkflowActions(ref Result result)
		{
			string sql = @"
                SELECT DISTINCT Actions.ActionID, Actions.ActionName, Workflows.AreaID FROM Actions
                INNER JOIN Actions_Steps ON Actions_Steps.ActionID = Actions.ActionID
                INNER JOIN Steps ON Steps.StepID = Actions_Steps.StepID
                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
            ";
			result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
			result.Success = true;
		}
		public static void GetAreaActions(ref Result result)
		{
			string sql = @"
                SELECT DISTINCT Actions.ActionID, Actions.ActionName, Workflows.AreaID FROM Actions
                INNER JOIN Actions_Steps ON Actions_Steps.ActionID = Actions.ActionID
                INNER JOIN Steps ON Steps.StepID = Actions_Steps.StepID
                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
            ";
			result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
			result.Success = true;
		}
		public static void GetAllActions(ref Result result)
		{
			string sql = @"SELECT * FROM Actions";
			result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
			result.Success = true;

		}
		public static void GetAllActionLogs(ref Result result)
		{
			if (result.ParamExists("ActionID"))
			{
				//var sqliteParams = new List<SqliteParameter>();
				//sqliteParams.Add(new SqliteParameter() { ParameterName = "@ActionID", Value = result.GetParam("ActionID") });
				string sqliteSql = @"
                    SELECT 
                    (SELECT count(*) from Logs INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 1) AS InfoCount,
                    (SELECT count(*) from Logs INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 2) AS GoodCount,
                    (SELECT count(*) from Logs INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 3) AS UglyCount,
                    (
                        SELECT count(*) from Logs 
                        INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID 
                        WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 4
                    ) 
                    AS BadCount,
                    (
                        SELECT 
	                    julianday('now') - julianday(Logs.Created)
                        FROM Logs 
                        INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID 
                        WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 4
                        ORDER BY Logs.Created DESC LIMIT 1
                    ) AS BadAge,

                    0 AS IssueCount
                ";

				string sqlServerSql = @"

                    SELECT 
                    (SELECT count(*) from Logs INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 1) AS InfoCount,
                    (SELECT count(*) from Logs INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 2) AS GoodCount,
                    (SELECT count(*) from Logs INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 3) AS UglyCount,
                    (SELECT count(*) from Logs INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 4) AS BadCount,
                    (
                        SELECT TOP 1
	                    Datediff(d,convert(datetime, Logs.Created) , getdate())
                        FROM Logs 
                        INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID 
                        WHERE Actions_Steps.ActionID = @ActionID AND Logs.LogSeverity = 4
                        ORDER BY Logs.Created DESC 
                    ) AS BadAge,

                    0 AS IssueCount
				";

				result.Data = Data.Execute(Data.CreateParams(sqliteSql, sqlServerSql, result.Params));
				result.Success = true;
			}
		}
		public static void GetActionLogDetail(ref Result result)
		{
			if (result.ParamExists("ActionID", Result.ParamType.Int)
				&& result.ParamExists("SeverityID", Result.ParamType.Int)
				&& result.ParamExists("AreaID"))
			{
				string sql = @"

	                SELECT 
                        Logs.LogID, 
                        Logs.LogSeverity, 
                        Logs.Created, 
                        Logs.Title, 
                        Logs.Description, 
                        Logs.UniqueID, 
                        Logs.AppID, 
                        Logs.AppUniqueID, 
                        Logs.StepID, 
                        Logs.StepUniqueID 
                    FROM Logs 
					WHERE 
					(
						Logs.StepID IN (SELECT StepID FROM Actions_Steps WHERE Actions_Steps.ActionID = @ActionID)
					OR
						Logs.StepID IN (SELECT StepID FROM Steps WHERE Steps.WorkflowID IN (SELECT WorkflowID FROM Workflows WHERE AreaID = @AreaID))
					)
					AND
						Logs.LogSeverity = 1
                ";
				result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
				result.Success = true;

			}
		}

		public static void SaveAction(ref Result result)
		{
			if (result.ParamExists("ActionID", Result.ParamType.Int))
			{

				if (result.Data != null)
				{
					var action = JsonConvert.DeserializeObject<Action>(result.Data.ToString());

					//if (action.Sql != null)
					//    action.Sql = action.Sql.Replace("'", "''");

					if (action.Code != null)
						action.Code = action.Code.Replace("'", "''");

					string sql = $@"

						UPDATE Actions SET 
							ActionName = @ActionName,
							ActionDescription = @ActionDescription,
							Sql = @Sql,
							Code = @Code,
							VariableDelimiter = @VariableDelimiter,
							UniqueID = @UniqueID,
							EditorType = @EditorType,
							FailActionDescription = @FailActionDescription,
							SuccessActionDescription = @SuccessActionDescription,
							RepeatQuantity = @RepeatQuantity,
							RepeatIntervalSeconds = @RepeatIntervalSeconds,
							CronSchedule = @CronSchedule,
							CodeCMD = @CodeCMD,
							CodePS = @CodePS

						WHERE 
							ActionID = @ActionID
					";

					result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
					result.Success = true;
				}
				else
					result.FailMessages.Add("Data obj is null");
			}
		}
		/// <summary>
		/// df sdf sdf sdfsdf
		/// <para name="result"></para>
		/// <see href="https://www.google.com">google</see>
		/// </summary>
		/// 

		//Trigger simple, start now
		public void TriggerJob(ref Result result)
		{
			var actionId = result.Params.Where(p => p.Name == "ActionID").SingleOrDefault();

			IJobDetail? apJob = null;
			ITrigger? apTrigger = null;

			if (actionId != null)
			{

				SendJobTraceMessage($"Creating and scheduling Action #{actionId.Value}");

				string correlationId = Guid.NewGuid().ToString();

				result.Params.Add(new Result.Param { Name = "CorrelationID", Value = correlationId });

				var action = Actions.GetAction(actionId.Value, ref result);

				apJob = JobBuilder.Create<StepJob>().WithIdentity(actionId.Value, correlationId).Build();

				if (String.IsNullOrEmpty(action.CronSchedule))
				{
					if (action.RepeatQuantity > 0)
					{
						//Simple, with intervaled repeat
						SendJobTraceMessage($"Configuring Action #{action.ActionID} to repeat {action.RepeatQuantity} times every {action.RepeatIntervalSeconds} seconds.");
						apTrigger = TriggerBuilder.Create().WithSimpleSchedule(t =>
						{
							t.WithRepeatCount(action.RepeatQuantity)
							.WithInterval(TimeSpan.FromSeconds(action.RepeatIntervalSeconds));

						}).Build();
					}
					else
					{
						//Simple, immediate
						SendJobTraceMessage($"Configuring Action #{action.ActionID} for a single, immediate execution.");
						apTrigger = TriggerBuilder.Create().WithIdentity(actionId.Value, correlationId)
							.StartNow()
							.Build();
					}
				}
				else
				{
					//Use Cron
					SendJobTraceMessage($"Configuring Action #{action.ActionID} with the Cron schedule:{action.CronSchedule}.");
					apTrigger = TriggerBuilder.Create().WithIdentity(actionId.Value, correlationId)
						.WithCronSchedule(action.CronSchedule)
						.Build();
				}

				if (apJob != null && apTrigger != null)
				{
					//apTrigger.JobDataMap.Add("result", result); //append data

					//IScheduler.Scheduler.ScheduleJob(apJob, apTrigger);

					//SendJobTraceMessage($"Action #{actionId.Value} created and scheduled.");

					//result.Success = true;
				}
				else
					result.FailMessages.Add($"Either job or trigger was null for job #{actionId}");
			}
		}
		public static void SendJobTraceMessage(string message)
		{
			var messageResult = new Result();
			messageResult.Params.Add(new Result.Param { Name = "PushName", Value = "TestJob" });
			messageResult.Params.Add(new Result.Param { Name = "RequestName", Value = "SendMessage" });
			messageResult.Message = message; // $"Starting to execute job {actionId}";
											 //BusinessLabClassLib.PushHub.SendMessageByService(messageResult);

		}


		//public static void RunAction(string actionUniqueId, MiniApps.Models.Action action, MiniAppsContext db, ref Result result)
		//{
		//    result.Success = false; //reset

		//    //Get action type id
		//    var actionType = db.Actions.Where(at => at.UniqueID == actionUniqueId).SingleOrDefault();

		//    if (actionType != null)
		//    {
		//        //action.Args.AddRange(new List<ActionArgValue>()
		//        //{
		//        //    new ActionArgValue() { Value = new ActionArg() { ArgName = "iActionTypeID", ArgValue = actionType.ActionTypeID.ToString() } },
		//        //    new ActionArgValue() { Value = new ActionArg() { ArgName = "Email", ArgValue = "sdfsdf" } },
		//        //    new ActionArgValue() { Value = new ActionArg() { ArgName = "OfficeID", ArgValue = "sdfeeeef" } }
		//        //});

		//        //RunAction(action, db, ref result);
		//    }
		//    else
		//    {
		//        result.FailMessages.Add($"Action type unique id '{actionUniqueId}' not found in action types.");
		//    }

		//    //var severity = result.FailMessages.Count > 0 ? LogSeverities.Exception : LogSeverities.Information;

		//    //common.AddLog(29, severity, "11111111-1111-1111-1111-111111111111", "RunAction by action id result", "RunActionByUniqueID", hub);
		//}
		//public static void RunAction(MiniApps.Models.Action action, MiniAppsContext db, ref Result result)
		//{


		//    //If provided, associate with a log app
		//    int.TryParse(Main.GetArgValue(action, "LogAppID", ref result), out int iLogAppId);
		//    //string officeId = common.ArgValue(action, "OfficeID", ref result);  
		//    //string email = common.ArgValue(action, "Email", ref result);

		//    //var user = common.GetUserFromOfficeID(officeId, ref result);

		//    if (int.TryParse(Main.GetArgValue(action, "ActionTypeID", ref result), out int actiontypeid))
		//    {
		//        var actionType = db.Actions.Where(at => at.ActionID == actiontypeid).SingleOrDefault();
		//        if (actionType != null)
		//        {
		//            string editorType = actionType.EditorType.Trim().ToLower();

		//            if (editorType == "csharp")
		//            {
		//                if (!String.IsNullOrEmpty(actionType.Code.Trim())
		//                    && !String.IsNullOrEmpty(actionType.VariableDelimiter.Trim()))
		//                {
		//                    string code = actionType.Code;

		//                    //foreach (var arg in action.Args)
		//                    //{
		//                    //    if (arg.Value.ArgName.ToLower() != "method"
		//                    //        && arg.Value.ArgName.ToLower() != "actiontypeid"
		//                    //        && arg.Value.ArgName.ToLower() != "email"
		//                    //        && arg.Value.ArgName.ToLower() != "officeid")
		//                    //    {
		//                    //        code = code.Replace(actionType.VariableDelimiter.Trim() + arg.Value.ArgName, arg.Value.ArgValue);
		//                    //    }
		//                    //}

		//                    try
		//                    {

		//                        dynamic script = CSScriptLib.CSScript.Evaluator.LoadMethod(
		//                        $@"
		//                            public string Product(WebApplication1.Classes.BBContext db, WebApplication1.Models.Action action, ref CommonClassLib.Models.Common.Result result)
		//                            {{
		//                                {code}           
		//                            }}      
		//                        ");

		//                        result.Data = script.Product(db, action, ref result);
		//                        result.SuccessMessages.Add($"Action run success for #{actiontypeid}. Result: {Newtonsoft.Json.JsonConvert.SerializeObject(result)}");
		//                        //common.AddLog(iLogAppId, LogSeverities.Information, officeId, $"Action run success for #{actiontypeid}. Result: {Newtonsoft.Json.JsonConvert.SerializeObject(result)} code: " + code, "", hub);
		//                        result.Success = true;
		//                    }
		//                    catch (Exception ex)
		//                    {
		//                        result.FailMessages.Add($"Action run for #{actiontypeid} exception: {ex.ToString()}");
		//                        //common.AddLog(iLogAppId, LogSeverities.Exception, officeId, $"Action run exception for #{actiontypeid}: {ex.ToString()}", "", hub);
		//                    }
		//                }
		//                else result.FailMessages.Add("Arg sCode null or empty.");
		//            }
		//            else if (editorType == "sql")
		//            {
		//                if (!String.IsNullOrEmpty(actionType.Sql.Trim())
		//                    && !String.IsNullOrEmpty(actionType.VariableDelimiter.Trim()))
		//                {
		//                    string sql = actionType.Sql;

		//                    var parameters = new List<Microsoft.Data.SqlClient.SqlParameter>();

		//                    //foreach (var arg in action.Args)
		//                    //{
		//                    //    if (arg.Value.ArgName.ToLower() != "method")
		//                    //    {
		//                    //        var param = new Microsoft.Data.SqlClient.SqlParameter("@" + arg.Value.ArgName, arg.Value.ArgValue);
		//                    //        parameters.Add(param);
		//                    //    }
		//                    //}

		//                    sql = (String.IsNullOrEmpty(sql) ? "select 'empty sql'" : sql);
		//                    result.Data = DB.Execute(sql, db, parameters.ToArray());
		//                    result.Success = true;
		//                }
		//                else result.FailMessages.Add("Arg sCode null or empty.");

		//            }
		//            else
		//                result.FailMessages.Add("action type " + actionType.ActionName + " has no handler.");

		//            //common.AddLog(iLogAppId, LogSeverities.Information, officeId, "Action:" + actionType.sActionType + ": " + Newtonsoft.Json.JsonConvert.SerializeObject(result), "SuccessfullActionTest", hub);

		//        }
		//        else
		//            result.FailMessages.Add("ActionType not found for id " + actiontypeid.ToString());

		//    }
		//    else
		//        result.FailMessages.Add("iActionTypeID not found in args.");

		//    if (result.FailMessages.Count > 0)
		//    {
		//        //if (result.Success)
		//        //    common.AddLog(iLogAppId, LogSeverities.Warning, officeId, "Action Fails: " + Newtonsoft.Json.JsonConvert.SerializeObject(result), "ActionSuccessWithFails", hub);
		//        //else
		//        //    common.AddLog(iLogAppId, LogSeverities.Exception, officeId, "Action Fails: " + Newtonsoft.Json.JsonConvert.SerializeObject(result), "ActionFail", hub);
		//    }
		//}

	}
}
