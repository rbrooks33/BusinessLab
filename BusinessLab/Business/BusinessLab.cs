using Microsoft.AspNetCore.SignalR;
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

                string sql = @$"
                
                UPDATE Actions SET 
                    ActionName = '{action.ActionName}',
                    ActionDescription = '{action.ActionDescription}',
                    Sql = '{action.Sql.Replace("'", "''")}', 
                    Code = '{action.Code.Replace("'", "''")}', 
                    VariableDelimiter = '{action.VariableDelimiter}', 
                    UniqueID = '{action.UniqueID}', 
                    EditorType = '{action.EditorType}',
                    FailActionDescription = '{action.FailActionDescription}',
                    SuccessActionDescription = '{action.SuccessActionDescription}',
                    RepeatQuantity = {action.RepeatQuantity},
                    RepeatIntervalSeconds = {action.RepeatIntervalSeconds},
                    CronSchedule = {action.CronSchedule}

                WHERE 
                    ActionID = {action.ActionID}";

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
                
                apJob = JobBuilder.Create<StepJob>().WithIdentity(actionId.Value, "group3").Build();

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
						apTrigger = TriggerBuilder.Create().WithIdentity(actionId.Value, "group3")
                            .StartNow()
                            .Build();
                    }
                }
                else
                {
					//Use Cron
					SendJobTraceMessage($"Configuring Action #{action.ActionID} with the Cron schedule:{action.CronSchedule}.");
					apTrigger = TriggerBuilder.Create().WithIdentity(actionId.Value, "group3")
                        .WithCronSchedule(action.CronSchedule)
                        .Build();
                }

                if (apJob != null && apTrigger != null)
                {
                    apTrigger.JobDataMap.Add("result", result); //append data
                    
                    _scheduler.Scheduler.ScheduleJob(apJob, apTrigger);

                    SendJobTraceMessage($"Action #{actionId.Value} created and scheduled.");
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
    }
}
