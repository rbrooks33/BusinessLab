
using Newtonsoft.Json;

namespace BusinessLab
{
    public class Actions
    {
        public class Action
        {
            public string? ActionName { get; set; }
            public int ActionID { get; set; }
            public string? EditorType { get; set; }
            public string? Code { get; set; }
            public string? VariableDelimiter { get; set; }
            public string? Sql { get ; set; }
            public string? UniqueID { get; set; }
            public bool IsJob { get; set; }
            public int SuccessActionID { get; set; }
            public int FailActionID { get; set;}
        }
        public static void RunAction(int actionId, ref Result result)
        {
            result.Success = false; //reset

            string actionName = "[no name]";

            var action = Data.GetAction(actionId, ref result);

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
                                    public string Product(ref BusinessLab.Result result)
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
                                //common.AddLog(iLogAppId, LogSeverities.Exception, officeId, $"Action run exception for #{actiontypeid}: {ex.ToString()}", "", hub);
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

                            var parameters = new List<Microsoft.Data.Sqlite.SqliteParameter>();

                            foreach (var p in result.Params)
                            {
                                var param = new Microsoft.Data.Sqlite.SqliteParameter(action.VariableDelimiter + p.Name.ToString(), p.Value.ToString());
                                parameters.Add(param);
                            }

                            Data.Execute(sql, ref result, parameters.ToArray());

                            result.Success = true;
                        }
                        else result.FailMessages.Add("Arg Code null or empty.");

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

        public static void TestCode(WorkflowScheduler scheduler, ref Result result)
        {
            if (result.Data != null)
            {
                var action = JsonConvert.DeserializeObject<Actions.Action>(result.Data.ToString());

                if (!String.IsNullOrEmpty(action.Code))
                {
                    dynamic script = CSScriptLib.CSScript.Evaluator.LoadMethod(
                    $@"
                    
                    public string Product(BusinessLab.Actions.Action action, BusinessLab.WorkflowScheduler scheduler, BusinessLab.Result result)
                    {{
                        {action.Code}           
                    }}      
                ");

                    result.Data = script.Product(action, scheduler, result);
                    result.Success = true;
                }
                else
                    result.FailMessages.Add("Arg sCode empty.");

            }
            else
                result.FailMessages.Add("Data obj is null");

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
                Data.Execute(sql, ref result, parameters.ToArray());
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
            Data.Execute(updatesql, ref result);

            result.Success = true;
        }
        public static void SaveAction(dynamic props, ref Result result)
        {

            if (int.TryParse(props.ActionID.ToString(), out int actionid))
            {
                string updatesql = $@"

                    update actions set 
                    actionname = '{props.ActionName}' ,
                    actiondescription = '{props.ActionDescription}',
                    variabledelimiter = '{props.VariableDelimiter}'
                
                    where actionid = {actionid}
                    
                    ";
                Data.Execute(updatesql, ref result);
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
                Data.Execute(updatesql, ref result);
                result.Success = true;
            }
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
