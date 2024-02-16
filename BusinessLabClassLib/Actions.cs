using Microsoft.Data.SqlClient;
using System.Data;

namespace BusinessLabClassLib
{
    public class Actions
    {
        public class Action
        {
            public Action() {
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
            public string CodeCMD {  get; set; } = String.Empty;
            public string CodePS {  get; set; } = String.Empty;
            public string VariableDelimiter { get; set; } = string.Empty;
            public string Sql { get; set; } = string.Empty;
            public string UniqueID { get; set; } = string.Empty;
            public bool IsJob { get; set; }
            public int SuccessActionID { get; set; }
            public int FailActionID { get; set;}
            public string SuccessActionDescription { get; set; } = string.Empty;
            public string FailActionDescription { get; set; } = string.Empty;
            public int RepeatQuantity { get; set; } = int.MinValue;
            public int RepeatIntervalSeconds { get; set; } = int.MinValue;
            public string CronSchedule { get; set; } = string.Empty;
            public int ConnectionID { get; set; } = 0;
        }
        public static string _myusings = @"
            using BusinessLab;
            using System.Linq;
            using System.Collections.Generic;
            using Newtonsoft.Json;
        ";
		public static Actions.Action GetAction(string actionIdString, ref Result result)
		{
			var resultAction = new Actions.Action();

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

		public static Actions.Action GetAction(int actionId, ref Result result)
		{
			var resultAction = new Actions.Action();

            var dt = Data.ExecuteCSSqlite($"SELECT * FROM Actions WHERE ActionID = {actionId}", null);

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

		public static void RunAction(ref Result result)
        {
            //End point call
            if(result.ParamExists("ActionID", Result.ParamType.Int))
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

                    if (editorType == "csharp")
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
                                Logs.Add(0, $"Action run exception for #{action.ActionID.ToString()}", ex.ToString(), ref result, Logs.LogSeverity.Exception,"actionrun");
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

                            if(action.ConnectionID > 0)
                            {
                                string sqlConnections = "SELECT ConnectionString FROM BPLConnections WHERE ConnectionID = " + action.ConnectionID.ToString();
                                var dtConnection = Data.ExecuteCSSqlite(sqlConnections, null);
                                string cs = dtConnection.Rows[0][0].ToString();

								var parameters = new List<SqlParameter>();

								foreach (var p in result.Params)
								{
									if (p.Name != "RequestName" && p.Name != "ActionID")
									{
										var param = new SqlParameter(action.VariableDelimiter + p.Name.ToString(), p.Value.ToString());
										parameters.Add(param);
									}
								}

								result.Data = Data.ExecuteCSSqlServer(sql, cs, parameters.ToArray());
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
                                result.Data = Data.Execute(sql, parameters.ToArray());

                            }

                            //}
                            result.Success = true;
                        }
                        else result.FailMessages.Add("Either Sql or Variable Delimiter empty.");

                    }
                    else if(editorType == "cmd")
                    {
                        //TODO: Find a way to handle "file name"
                        //Command.Exec(action.CodeCMD, ref result); 
                        //result.Success = true;
                    }
                    else if(editorType == "ps")
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

		public static void TestCode(ref Result result)
        {
            if(result.ParamExists("ActionID", Result.ParamType.Int))
                Actions.RunAction(Convert.ToInt32(result.GetParam("ActionID")), ref result);

        }

        public static void TestSql(dynamic props, ref Result result)
        {
            if (!String.IsNullOrEmpty(props.Sql.ToString().Trim())
                && !String.IsNullOrEmpty(props.VariableDelimiter.ToString().Trim()))
            {
                string sql = props.Sql;

                var parameters = new List<Microsoft.Data.Sqlite.SqliteParameter>();

                //foreach (var arg in action.Args)
                //{
                //    if (arg.Value.ArgName.ToLower() != "method")
                //    {
                //        var param = new Microsoft.Data.SqlClient.SqlParameter("@" + arg.Value.ArgName, arg.Value.ArgValue);
                //        parameters.Add(param);
                //    }
                //}

                sql = (String.IsNullOrEmpty(sql) ? "select 'empty sql'" : sql);
                result.Data = Data.Execute(System.Runtime.CompilerServices.FormattableStringFactory.Create(sql, parameters.ToArray()));
                result.Success = true;
            }
            else result.FailMessages.Add("Arg sCode null or empty.");

        }
        public static void AddAction(ref Result result)
        {
            string updatesql = $@"

                INSERT INTO Actions 
                    (ActionName, ActionDescription)
                VALUES
                    ('New Action', 'Description')
                    
                    ";
            result.Data = Data.Execute(System.Runtime.CompilerServices.FormattableStringFactory.Create(updatesql, new List<Microsoft.Data.Sqlite.SqliteParameter>().ToArray()));

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
                result.Data = Data.Execute(System.Runtime.CompilerServices.FormattableStringFactory.Create(updatesql, new List<Microsoft.Data.Sqlite.SqliteParameter>().ToArray()));
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
                result.Data = Data.Execute(System.Runtime.CompilerServices.FormattableStringFactory.Create(updatesql, new List<Microsoft.Data.Sqlite.SqliteParameter>().ToArray()));
                result.Success = true;
            }
        }
        public static void GetWorkflowActions(ref Result result)
        {
            result.Data = Data.ExecuteCSSqlite(@"
                SELECT DISTINCT Actions.ActionID, Actions.ActionName, Workflows.AreaID FROM Actions
                INNER JOIN Actions_Steps ON Actions_Steps.ActionID = Actions.ActionID
                INNER JOIN Steps ON Steps.StepID = Actions_Steps.StepID
                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
            ", null);
            result.Success = true;
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
