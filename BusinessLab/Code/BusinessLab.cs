using BusinessLabClassLib;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.FileProviders.Composite;
using Newtonsoft.Json;
using Quartz;
using Quartz.Impl;
using Quartz.Simpl;
using System.Data;
using System.IO.Compression;
using System.Net;
using static Quartz.Logging.OperationName;

namespace BusinessLab
{
    public class Business
    {
        WorkflowScheduler _scheduler;

        public Business(WorkflowScheduler scheduler) {
            _scheduler = scheduler;
        }


        //Databases
        public static void GetDatabases(ref Result result)
        {
            result.Data = Data.Execute($"SELECT * FROM Databases");
            result.Success = true;
        }

        public static void UpsertDatabase(ref Result result)
        {
            result.ValidateData();
            result.SqliteParams.Clear();

            if (result.ParamExists("DatabaseID", Result.ParamType.Int))
            {
                result.AddSqliteParam("@DatabaseID", (string)result.DynamicData.DatabaseID);

                var databases = Data.Execute($@" 
                    SELECT * FROM Databases 
                    WHERE DatabaseID = @DatabaseID
                ", result.GetSqliteParamArray());

                if (databases.Rows.Count == 1)
                {
                    //Update
                    result.SqliteParams.Clear();
                    result.AddSqliteParam("@DatabaseName", (string)result.DynamicData.DatabaseName);
                    result.AddSqliteParam("@ConnectionString", (string)result.DynamicData.ConnectionString);
                    result.AddSqliteParam("@DatabaseID", (string)result.DynamicData.DatabaseID);

                    Data.Execute($@"
                        UPDATE Databases 
                        SET DatabaseName = @DatabaseName, 
                        ConnectionString = @ConnectionString 
                        WHERE DatabaseID = @DatabaseID
                    ", result.GetSqliteParamArray());

                    result.Success = true;
                }
                else
                {
                    //Insert
                    result.SqliteParams.Clear();
                    result.AddSqliteParam("@DatabaseName", (string)result.DynamicData.DatabaseName);
                    result.AddSqliteParam("@ConnectionString", (string)result.DynamicData.ConnectionString);

                    Data.Execute($@"
                        INSERT INTO Databases 
                            (DatabaseName, ConnectionString) 
                        VALUES 
                            (@DatabaseName, @ConnectionString
                    ", result.GetSqliteParamArray());

                    result.Success = true;
                }
            }
        }
		public static void DeleteDatabase(ref Result result)
		{
			result.Data = Data.Execute($"SELECT * FROM Databases");
			result.Success = true;
		}

		public static void GetTemplates(ref Result result)
		{
			result.Data = Data.Execute($"SELECT * FROM Templates");
			result.Success = true;
		}
        public static void GetTemplate(ref Result result)
        {
            if (result.ParamExists("TemplateID"))
            {
                result.Data = Data.Execute($"SELECT * FROM Templates WHERE TemplateID = {result.GetParam("TemplateID")}");
                result.Success = true;
            }

        }

		//public static void GetAreas(ref Result result)
  //      {
		//	result.Data = Data.Execute($"SELECT * FROM Areas");
		//	result.Success = true;
		//}
  //      public static void UpsertArea(ref Result result)
  //      {
		//	result.ValidateData();
		//	result.SqliteParams.Clear();

		//	if (result.ParamExists("AreaID", Result.ParamType.Int))
		//	{
		//		result.AddSqliteParam("@AreaID", (string)result.DynamicData.AreaID);

		//		var databases = Data.Execute($@" 
  //                  SELECT * FROM Areas 
  //                  WHERE AreaID = @AreaID
  //              ", result.GetSqliteParamArray());

		//		if (databases.Rows.Count == 1)
		//		{
		//			//Update
		//			result.SqliteParams.Clear();
		//			result.AddSqliteParam("@AreaName", (string)result.DynamicData.AreaName);
		//			result.AddSqliteParam("@AreaID", (string)result.DynamicData.AreaID);

		//			Data.Execute($@"
  //                      UPDATE Areas 
  //                      SET AreaName = @AreaName
  //                      WHERE AreaID = @AreaID
  //                  ", result.GetSqliteParamArray());

		//			result.Success = true;
		//		}
		//		else
		//		{
		//			//Insert
		//			result.SqliteParams.Clear();
		//			result.AddSqliteParam("@AreaName", "[New Area]");

		//			Data.Execute($@"
  //                      INSERT INTO Areas 
  //                          (AreaName) 
  //                      VALUES 
  //                          (@AreaName)
  //                  ", result.GetSqliteParamArray());

		//			result.Success = true;
		//		}
		//	}
		//}
		//public static void GetTemplates(ref Result result)
		//{
		//    string sql = "SELECT * FROM Templates";
		//    Data.Execute(sql, ref result);
		//    result.Success = true;
		//}

		public static void GetWorkflows(ref Result result)
		{
			result.Data = Data.Execute($"SELECT * FROM Workflows", null);
			result.Success = true;
		}
		public static void GetSteps(ref Result result)
		{
			result.Data = Data.Execute($"SELECT * FROM Steps ORDER BY StepOrder");
			result.Success = true;
		}

		public static void GetActions(ref Result result)
		{
   //         var dt = new DataTable();

			//using (var conn = new SqliteConnection(Resource.SqliteConnectionString))
			//{
			//	conn.Open();
			//	var cmd = new SqliteCommand("SELECT * FROM Actions", conn);
			//	var reader = cmd.ExecuteReader();
			//	dt.Load(reader);
			//	conn.Close();
			//}

            result.Data = Data.Execute($"SELECT * FROM Actions", null);
            result.Success = true;
		}
        public static void GetPreview(ref Result result)
        {
            if (result.ParamExists("URL"))
            {
                var url = result.GetParam("URL"); // "http://www.morningstar.com/";
                var httpClient = new HttpClient();

                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "text/html,application/xhtml+xml,application/xml");
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Accept-Encoding", "gzip, deflate");
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:19.0) Gecko/20100101 Firefox/19.0");
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Accept-Charset", "ISO-8859-1");

                var response = httpClient.GetAsync(new Uri(url)).Result;
                response.EnsureSuccessStatusCode();
                using (var responseStream = response.Content.ReadAsStreamAsync().Result)
                using (var decompressedStream = new GZipStream(responseStream, CompressionMode.Decompress))
                using (var streamReader = new StreamReader(decompressedStream))
                {
                    result.Data = streamReader.ReadToEnd();
                }
            }
		}
        public static void SaveAction(ref Result result)
        {
            if (result.ParamExists("ActionID", Result.ParamType.Int))
            {

                if (result.Data != null)
                {
                    var action = JsonConvert.DeserializeObject<Actions.Action>(result.Data.ToString());

                    //if (action.Sql != null)
                    //    action.Sql = action.Sql.Replace("'", "''");

                    if (action.Code != null)
                        action.Code = action.Code.Replace("'", "''");

                    FormattableString sql = $@"
                


                UPDATE Actions SET 
                    ActionName = {action.ActionName ?? "" },
                    ActionDescription = {action.ActionDescription ?? ""},
                    Sql = {action.Sql ?? ""}, 
                    Code = {action.Code ?? ""}, 
                    VariableDelimiter = {action.VariableDelimiter ?? ""}, 
                    UniqueID = {action.UniqueID ?? ""}, 
                    EditorType = {action.EditorType ?? ""},
                    FailActionDescription = {action.FailActionDescription ?? ""},
                    SuccessActionDescription = {action.SuccessActionDescription ?? ""},
                    RepeatQuantity = {action.RepeatQuantity},
                    RepeatIntervalSeconds = {action.RepeatIntervalSeconds},
                    CronSchedule = {action.CronSchedule ?? ""},
                    CodeCMD = {action.CodeCMD ?? ""},
                    CodePS = {action.CodePS ?? ""}

                WHERE 
                    ActionID = {result.GetParam("ActionID")}";

                    result.Data = Data.Execute(sql, true);
                    result.Success = true;
                }
                else
                    result.FailMessages.Add("Data obj is null");
            }
        }
		public static void SaveWorkflow(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			var workflow = JsonConvert.DeserializeObject<dynamic>(result.Data.ToString());

				FormattableString sql = @$"
                
                UPDATE Workflows SET 
                    WorkflowName = {workflow.WorkflowName.Value},
                    WorkflowDescription = {workflow.WorkflowDescription.Value}
                WHERE 
                    WorkflowID = {workflow.WorkflowID.Value}";

				result.Data = Data.Execute(sql);
				result.Success = true;
		}
        /// <summary>
        /// df sdf sdf sdfsdf
        /// <para name="result"></para>
        /// <see href="https://www.google.com">google</see>
        /// </summary>
        /// 
		public static void SaveStep(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("StepID", Result.ParamType.Int))
			{
				result.AddSqliteParam("@StepID", (string)result.DynamicData.StepID);
				result.AddSqliteParam("@StepName", (string)result.DynamicData.StepName);
				result.AddSqliteParam("@StepDescription", (string)result.DynamicData.StepDescription);
				result.AddSqliteParam("@FunctionalSpecs", (string)result.DynamicData.FunctionalSpecs);
				result.AddSqliteParam("@StepOrder", (string)result.DynamicData.StepOrder);
				result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

				Data.Execute($@"
                        UPDATE Steps 
                        SET StepName = @StepName, 
                        StepDescription = @StepDescription,
                        FunctionalSpecs = @FunctionalSpecs,
                        StepOrder = @StepOrder,
                        Archived = @Archived
                        WHERE StepID = @StepID
                    ", result.GetSqliteParamArray());

				result.Success = true;
			}
		}

		public static void AddAction(ref Result result)
        {
            FormattableString sql = $"INSERT INTO Actions (ActionName) VALUES ('new action')";
            result.Data = Data.Execute(sql);
			result.Success = true;
		}

		public static void AddWorkflow(ref Result result)
		{
			var areaIdParam = result.Params.Where(p => p.Name == "AreaID").SingleOrDefault();

            if (areaIdParam != null)
            {
                FormattableString sql = $"INSERT INTO Workflows (WorkflowName, WorkflowDescription, AreaID) VALUES ('new workflow', '@nbsp;@nbsp;@nbsp;', {areaIdParam.Value})";
                result.Data = Data.Execute(sql);
                result.Success = true;
            }
            else
                result.FailMessages.Add("AreaID was not included in parasm.");
		}
		public static void AddStep(ref Result result)
		{
            var workflowId = result.Params.Where(p => p.Name == "WorkflowID").SingleOrDefault();

            if (workflowId != null)
            {
                FormattableString sql = $"INSERT INTO Steps (StepName, WorkflowID) VALUES ('new step', {workflowId.Value})";
                result.Data = Data.Execute(sql);
                result.Success = true;
            }
            else
                result.FailMessages.Add("No workflow id provided.");
		}
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

                result.Params.Add(new Result.Param {  Name = "CorrelationID", Value = correlationId });

                var action = Actions.GetAction(actionId.Value, ref result);
                
                apJob = JobBuilder.Create<StepJob>().WithIdentity(actionId.Value, correlationId).Build();

                if (String.IsNullOrEmpty(action.CronSchedule))
                {
                    if(action.RepeatQuantity > 0)
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
                    apTrigger.JobDataMap.Add("result", result); //append data
                    
                    _scheduler.Scheduler.ScheduleJob(apJob, apTrigger);

                    SendJobTraceMessage($"Action #{actionId.Value} created and scheduled.");

					result.Success = true;
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
            PushHub.SendMessageByService(messageResult);
           
        }
        public static async Task<string> PostATECApi(Result result)
        {
			string myJson = JsonConvert.SerializeObject(result);

			using (var client = new System.Net.Http.HttpClient())
			{
				//log
				var response = await client.PostAsync("https://crm2016uat.atecorp.com:8099/api/main", new System.Net.Http.StringContent(myJson, System.Text.Encoding.UTF8, "application/json"));
                var contents = await response.Content.ReadAsStringAsync();
                
                return contents;
			}
            
		}
        public static void GetProjects(ref Result result) {
            result.Data = Data.Execute("SELECT * FROM Projects", null);
            result.Success = true;
        }
		public static void AddProject(ref Result result)
		{
            Data.Execute("INSERT INTO Projects (ProjectName, ProjectDescription) VALUES ('[New Project]', '[Project Description]')", null);
            result.Success = true;
		}
        public static void UpdateProject(ref Result result)
        {
            result.ValidateData();
            result.SqliteParams.Clear();

            if (result.ParamExists("ProjectID", Result.ParamType.Int))
            {
                result.AddSqliteParam("@ProjectID", (string)result.DynamicData.ProjectID);
                result.AddSqliteParam("@ProjectName", (string)result.DynamicData.ProjectName);
                result.AddSqliteParam("@ProjectDescription", (string)result.DynamicData.ProjectDescription);
                result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

                Data.Execute($@"
                        UPDATE Projects 
                        SET ProjectName = @ProjectName, 
                        ProjectDescription = @ProjectDescription,
                        Archived = @Archived
                        WHERE ProjectID = @ProjectID
                    ", result.GetSqliteParamArray());

                result.Success = true;
            }
        }
		public static void DeleteProject(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

            if (result.ParamExists("ProjectID", Result.ParamType.Int))
            {
                result.SqliteParams.Clear();
                result.AddSqliteParam("@ProjectID", (string)result.DynamicData.ProjectID);
                Data.Execute("UPDATE Projects SET Archived = 1 WHERE ProjectID = @ProjectID", null);
                result.Success = true;
            }
		}
		//Tasks
		public static void GetTasks(ref Result result)
		{
			result.Data = Data.Execute("SELECT * FROM Tasks", null);
			result.Success = true;
		}
		public static void AddTask(ref Result result)
		{
			Data.Execute("INSERT INTO Tasks (TaskName, TaskDescription) VALUES ('[New Task]', '[Task Description]')", null);
			result.Success = true;
		}
		public static void UpdateTask(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("TaskID", Result.ParamType.Int))
			{
				result.AddSqliteParam("@TaskID", (string)result.DynamicData.TaskID);
				result.AddSqliteParam("@TaskName", (string)result.DynamicData.TaskName);
				result.AddSqliteParam("@TaskDescription", (string)result.DynamicData.TaskDescription);
				result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

				Data.Execute($@"
                        UPDATE Tasks 
                        SET TaskName = @TaskName, 
                        TaskDescription = @TaskDescription,
                        Archived = @Archived
                        WHERE TaskID = @TaskID
                    ", result.GetSqliteParamArray());

				result.Success = true;
			}
		}
		public static void DeleteTask(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("TaskID", Result.ParamType.Int))
			{
				result.SqliteParams.Clear();
				result.AddSqliteParam("@TaskID", (string)result.DynamicData.TaskID);
				Data.Execute("UPDATE Tasks SET Archived = 1 WHERE TaskID = @TaskID", null);
				result.Success = true;
			}
		}
		//Software
	}
}
