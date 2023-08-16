using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.FileProviders.Composite;
using Newtonsoft.Json;
using Quartz;
using Quartz.Impl;
using Quartz.Simpl;
using static Quartz.Logging.OperationName;

namespace BusinessLab
{
    public class Business
    {
        WorkflowScheduler _scheduler;

		public Business(WorkflowScheduler scheduler) {
            _scheduler = scheduler;
        }
        
        public static void GetAreas(ref Result result)
        {
            string sql = "SELECT * FROM Areas";
            Data.Execute(sql, ref result);
			result.Success = true;
		}

		public static void GetWorkflows(ref Result result)
		{
			string sql = "SELECT * FROM Workflows";
			Data.Execute(sql, ref result);
			result.Success = true;
		}
		public static void GetSteps(ref Result result)
		{
			string sql = "SELECT * FROM Steps";
			Data.Execute(sql, ref result);
			result.Success = true;
		}

		public static void GetActions(ref Result result)
		{
			string sql = "SELECT * FROM Actions";
			Data.Execute(sql, ref result);
            result.Success = true;
		}
        
        public static void SaveAction(ref Result result)
        {
            if (result.Data != null)
            {
                var action = JsonConvert.DeserializeObject<Actions.Action>(result.Data.ToString());

                if (action.Sql != null)
                    action.Sql = action.Sql.Replace("'", "''");

                if (action.Code != null)
                    action.Code = action.Code.Replace("'", "''");

                string sql = @$"
                


                UPDATE Actions SET 
                    ActionName = '{action.ActionName}',
                    ActionDescription = '{action.ActionDescription}',
                    Sql = '{action.Sql}', 
                    Code = '{action.Code}', 
                    VariableDelimiter = '{action.VariableDelimiter}', 
                    UniqueID = '{action.UniqueID}', 
                    EditorType = '{action.EditorType}',
                    FailActionDescription = '{action.FailActionDescription}',
                    SuccessActionDescription = '{action.SuccessActionDescription}',
                    RepeatQuantity = {action.RepeatQuantity},
                    RepeatIntervalSeconds = {action.RepeatIntervalSeconds},
                    CronSchedule = '{action.CronSchedule}'

                WHERE 
                    ActionID = {action.ActionID}";

                Data.Execute(sql, ref result);
				result.Success = true;
			}
            else
                result.FailMessages.Add("Data obj is null");
        }
		public static void SaveWorkflow(ref Result result)
		{
			if (result.Data != null)
			{
				var workflow = JsonConvert.DeserializeObject<dynamic>(result.Data.ToString());

				string sql = @$"
                
                UPDATE Workflows SET 
                    WorkflowName = '{workflow.WorkflowName.Value}'
                WHERE 
                    WorkflowID = {workflow.WorkflowID.Value}";

				Data.Execute(sql, ref result);
				result.Success = true;
			}
			else
				result.FailMessages.Add("Data obj is null");
		}
        /// <summary>
        /// df sdf sdf sdfsdf
        /// <para name="result"></para>
        /// <see href="https://www.google.com">google</see>
        /// </summary>
        /// 
		public static void SaveStep(ref Result result)
		{
			if (result.Data != null)
			{
				var step = JsonConvert.DeserializeObject<dynamic>(result.Data.ToString());

				string sql = @$"
                
                UPDATE Steps SET 
                    StepName = '{step.StepName.Value}',
                    StepDescription = '{step.StepDescription.Value}',
                    FunctionalSpecs = '{step.FunctionalSpecs}'
                WHERE 
                    StepID = {step.StepID.Value}";

				Data.Execute(sql, ref result);
				result.Success = true;
			}
			else
				result.FailMessages.Add("Data obj is null");
		}

		public static void AddAction(ref Result result)
        {
            string sql = $"INSERT INTO Actions (ActionName) VALUES ('new action')";
            Data.Execute(sql, ref result);
			result.Success = true;
		}

		public static void AddWorkflow(ref Result result)
		{
			var areaIdParam = result.Params.Where(p => p.Name == "AreaID").SingleOrDefault();

            if (areaIdParam != null)
            {
                string sql = $"INSERT INTO Workflows (WorkflowName, WorkflowDescription, AreaID) VALUES ('new workflow', '@nbsp;@nbsp;@nbsp;', {areaIdParam.Value})";
                Data.Execute(sql, ref result);
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
                string sql = $"INSERT INTO Steps (StepName, WorkflowID) VALUES ('new step', {workflowId.Value})";
                Data.Execute(sql, ref result);
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

                result.Params.Add(new Param {  Name = "CorrelationID", Value = correlationId });

                var action = Data.GetAction(actionId.Value, ref result);
                
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
            messageResult.Params.Add(new Param { Name = "PushName", Value = "TestJob" });
            messageResult.Params.Add(new Param { Name = "RequestName", Value = "SendMessage" });
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
    }
}
