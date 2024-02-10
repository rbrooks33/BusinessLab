using Microsoft.AspNetCore.SignalR;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Newtonsoft.Json;
using Quartz;
using Quartz.Impl;
using System.Net.Mail;
using System.Threading.Tasks;

namespace BusinessLab
{
    public class StepJob : IJob
    {
        //WorkflowScheduler _scheduler;

        //public StepJob(WorkflowScheduler scheduler)
        //{
        //    _scheduler = scheduler;
        //}

        Task IJob.Execute(IJobExecutionContext context)
        {
            var result = new Result();

            //string group = context.JobDetail.Key.Group;
            string name = context.JobDetail.Key.Name;

            try
            {
                result = (Result)context.Trigger.JobDataMap.Where(jm => jm.Key == "result").FirstOrDefault().Value;
                
                Business.SendJobTraceMessage($"Executing Action #{name}.");

                //Get job action and run
                var action = Actions.GetAction(name, ref result);

                if (action.ActionID > 0)
                {
                    Actions.RunAction(action.ActionID, ref result);

                    if (!result.Success)
                    {
                        //Run fail action
                        Business.SendJobTraceMessage($"Failed executing Action #{name}. Checking for Fail Action...");

                        if (action.FailActionID > 0)
                        {
                            Business.SendJobTraceMessage($"Found action #{ action.FailActionID.ToString()}");

                            var failJob = JobBuilder.Create<StepJob>().WithIdentity(action.FailActionID.ToString(), "group3").Build();
                            
                            var failTrigger = TriggerBuilder.Create().WithIdentity(action.FailActionID.ToString(), "group3").StartNow().Build();

                            failTrigger.JobDataMap.Add("result", result); 

                            context.Scheduler.ScheduleJob(failJob, failTrigger);
                        }
                        else
                            Business.SendJobTraceMessage($"No fail action for #{action.ActionID}");
                    }
                    else
                    {
                        //Run success action
                        Business.SendJobTraceMessage($"Success running Action #{name}! Checking for Success Action...");
                        
                        if (action.SuccessActionID > 0)
                        {
							Business.SendJobTraceMessage($"Found action #{action.SuccessActionID.ToString()}");

							var successJob = JobBuilder.Create<StepJob>().WithIdentity(action.SuccessActionID.ToString(), "group3").Build();
							
                            var successTrigger = TriggerBuilder.Create().WithIdentity(action.SuccessActionID.ToString(), "group3").StartNow().Build();

							successTrigger.JobDataMap.Add("result", result); // Newtonsoft.Json.JsonConvert.SerializeObject(result));

							context.Scheduler.ScheduleJob(successJob, successTrigger);
						}
					}
				}
            }
            catch (Exception ex)
            {
                string failMessage = $"Action #{name} exception: {ex}.";
				Business.SendJobTraceMessage(failMessage);
				throw new JobExecutionException(failMessage);
            }
            return Task.CompletedTask;
        }
  //      private int GetStepID(Result result)
  //      {
		//	int stepId = 0;

		//	var stepParam = result.Params.Where(p => p.Name != null && p.Name.ToLower() == "stepid").FirstOrDefault();
		//	if (stepParam != null)
		//	{
		//		int.TryParse(stepParam.Value, out stepId);

		//		if (stepId == 0)
		//			result.FailMessages.Add("StepID was not numeric.");
		//	}
		//	else
		//		result.FailMessages.Add("No StepID param to log");

  //          return stepId;
		//}
	}
    
    public class StepListener : ITriggerListener
    {
		//IHubContext<PushHub> _hub;

		//public StepListener(IHubContext<PushHub> hub)
		//{
		//	_hub = hub;
		//}
		
        public string Name => "StepTriggerListener";

        public Task TriggerComplete(ITrigger trigger, IJobExecutionContext context, SchedulerInstruction triggerInstructionCode, CancellationToken cancellationToken = default)
        {
    //        var result = new Result();

    //        try
    //        {
    //            //throw new NotImplementedException();
    //            result = (Result)context.Trigger.JobDataMap.Where(jm => jm.Key == "result").FirstOrDefault().Value; //new Result();

    //            //Get the job action from the name (actionid) and see if it fires an action on success
    //            var action = Data.GetAction(trigger.JobKey.Name, ref result);

    //            if (action.ActionID > 0 && action.SuccessActionID > 0)
    //            {
    //                var successAction = Data.GetAction(action.SuccessActionID, ref result);

    //                Actions.RunAction(successAction.ActionID, ref result);

    //                //TODO: Log
    //                string message = $"Triggered action #{successAction.ActionID} '{successAction.ActionName}' successful.";
				//	Business.SendJobTraceMessage(message);
				//	result.SuccessMessages.Add(message);

    //                int stepId = 0;

    //                var stepParam = result.Params.Where(p => p.Name.ToLower() == "stepid").FirstOrDefault();
    //                if (stepParam != null)
    //                {
    //                    int.TryParse(stepParam.Value, out stepId);
                        
    //                    if (stepId == 0)
    //                        result.FailMessages.Add("StepID was not numeric.");
    //                }
    //                else
    //                    result.FailMessages.Add("No StepID param to log");

				//	Business.SendJobTraceMessage($"Trigger for job {successAction.ActionName}, step {stepId} successfull.");
				//	Logs.Add(stepId, "Trigger Successful", Newtonsoft.Json.JsonConvert.SerializeObject(result), ref result, Logs.LogSeverity.Info);
    //            }
    //            else
    //            {
    //                //TODO: Log
    //            }
    //        }
    //        catch (Exception ex)
    //        {
				////TODO: Log
				//Business.SendJobTraceMessage($"Trigger {context.Trigger.JobKey.Name} exception: {ex.ToString()}");
				//Logs.Add(0, "Trigger Complete Exception", ex.ToString(), ref result, Logs.LogSeverity.Exception);
    //        }
            return Task.CompletedTask;
        }

        public Task TriggerFired(ITrigger trigger, IJobExecutionContext context, CancellationToken cancellationToken = default)
        {
            //throw new NotImplementedException();

            //if (_hub != null)
            //{
            //    var result = new Result();
            //    result.Params.Add(new Param { Name = "TracePushName", Value = "TestJob" });
            //    PushHub.SendMessage(_hub, result, $"Trigger '{trigger.JobKey.Name}' fired.");
            //}
			return Task.CompletedTask;
        }

        public Task TriggerMisfired(ITrigger trigger, CancellationToken cancellationToken = default)
        {
            //throw new NotImplementedException();
            return Task.CompletedTask;
        }

        public Task<bool> VetoJobExecution(ITrigger trigger, IJobExecutionContext context, CancellationToken cancellationToken = default)
        {
            //try
            //{
            //    throw new NotImplementedException();
            //}
            //catch (Exception ex)
            //{

            //}
            //var m_task = new Task<bool>;
            return Task.FromResult(false); // Task.CompletedTask.IsCompleted;
        }
    }
}
