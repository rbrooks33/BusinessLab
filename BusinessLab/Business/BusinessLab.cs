﻿using Newtonsoft.Json;
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
        }

		public static void GetActions(ref Result result)
		{
			string sql = "SELECT * FROM Actions";
			Data.Execute(sql, ref result);
		}
        
        public static void SaveAction(ref Result result)
        {
            if (result.Data != null)
            {
                var action = JsonConvert.DeserializeObject<Actions.Action>(result.Data.ToString());

                string sql = $"UPDATE Actions SET Sql = '{action.Sql}', Code = '{action.Code}', VariableDelimiter = '{action.VariableDelimiter}', UniqueID = '{action.UniqueID}', EditorType = '{action.EditorType}' WHERE ActionID = {action.ActionID}";

                Data.Execute(sql, ref result);
            }
            else
                result.FailMessages.Add("Data obj is null");
        }

		public void TriggerStepJob(ref Result result)
        {
            var jobName = result.Params.Where(p => p.Name == "JobName").SingleOrDefault();
            var jobGroup = result.Params.Where(p => p.Name == "JobGroup").SingleOrDefault();
            var stepId = result.Params.Where(p => p.Name == "StepID").SingleOrDefault();

            if (jobName != null && jobGroup != null && stepId != null)
            {


                var apjob = JobBuilder.Create<StepJob>().WithIdentity("ap1", "group3").Build();

                var aptrigger = TriggerBuilder.Create().WithIdentity("ap1", "group3").StartNow().Build();

                
                //StdSchedulerFactory factory = new StdSchedulerFactory();
                //IScheduler scheduler = _scheduler..NewJob().GetScheduler().Result;

                _scheduler.Scheduler.ScheduleJob(apjob, aptrigger);
            }
        }
    }
}
