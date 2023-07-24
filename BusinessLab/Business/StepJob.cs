using Microsoft.CodeAnalysis.CSharp.Syntax;
using Quartz;
using Quartz.Impl;
using System.Threading.Tasks;

namespace BusinessLab
{
    public class StepJob : IJob
    {
        Task IJob.Execute(IJobExecutionContext context)
        {
            var result = new Result();

            string group = context.JobDetail.Key.Group;
            string name = context.JobDetail.Key.Name;

            try
            {
                result = (Result)context.Trigger.JobDataMap.Where(jm => jm.Key == "result").FirstOrDefault().Value;
                //var result = Newtonsoft.Json.JsonConvert.DeserializeObject<Result>(resultString.Value.ToString());
                //Get job action and run
                var action = Data.GetAction(name, ref result);

                if (action.ActionID > 0)
                {
                    Actions.RunAction(action.ActionID, ref result);

                    if (!result.Success)
                    {
                        throw new JobExecutionException($"Job for action {action.ActionID} failed. Result: {Newtonsoft.Json.JsonConvert.SerializeObject(result)}");
                    }
                }

            }
            catch (Exception ex)
            {
                //TODO: log via web service & text file as backup
                result.FailMessages.Add(ex.ToString());

                throw new JobExecutionException($"Job for action name {name} exception. Result: {Newtonsoft.Json.JsonConvert.SerializeObject(result)}");
            }
            return Task.CompletedTask;
        }
    }
    public class StepListener : ITriggerListener
    {
        public string Name => "StepTriggerListener";

        public Task TriggerComplete(ITrigger trigger, IJobExecutionContext context, SchedulerInstruction triggerInstructionCode, CancellationToken cancellationToken = default)
        {
            var result = new Result();

            try
            {
                //throw new NotImplementedException();
                result = (Result)context.Trigger.JobDataMap.Where(jm => jm.Key == "result").FirstOrDefault().Value; //new Result();

                //Get the job action from the name (actionid) and see if it fires an action on success
                var action = Data.GetAction(trigger.JobKey.Name, ref result);

                if (action.ActionID > 0 && action.SuccessActionID > 0)
                {
                    var successAction = Data.GetAction(action.SuccessActionID, ref result);

                    Actions.RunAction(successAction.ActionID, ref result);

                    //TODO: Log
                    result.SuccessMessages.Add($"Triggered action #{successAction.ActionID} '{successAction.ActionName}' successful.");

                    int stepId = 0;

                    var stepParam = result.Params.Where(p => p.Name.ToLower() == "stepid").FirstOrDefault();
                    if (stepParam != null)
                    {
                        int.TryParse(stepParam.Value, out stepId);
                        
                        if (stepId == 0)
                            result.FailMessages.Add("StepID was not numeric.");
                    }
                    else
                        result.FailMessages.Add("No StepID param to log");

                    Logs.Add(stepId, "Trigger Successful", Newtonsoft.Json.JsonConvert.SerializeObject(result), ref result, Logs.LogSeverity.Info);
                }
                else
                {
                    //TODO: Log
                }
            }
            catch (Exception ex)
            {
                //TODO: Log
                Logs.Add(0, "Trigger Complete Exception", ex.ToString(), ref result, Logs.LogSeverity.Exception);
            }
            return Task.CompletedTask;
        }

        public Task TriggerFired(ITrigger trigger, IJobExecutionContext context, CancellationToken cancellationToken = default)
        {
            //throw new NotImplementedException();
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
