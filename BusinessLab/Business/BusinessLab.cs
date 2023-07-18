using Quartz;
using Quartz.Impl;
using Quartz.Simpl;
using static Quartz.Logging.OperationName;

namespace BusinessLab
{
    public class Business
    {
        Quartz.IScheduler _scheduler;

		public Business(Quartz.IScheduler scheduler) {
            _scheduler = scheduler;
        }
        public static void GetAreas(ref Result result)
        {
            string sql = "SELECT * FROM Areas";
            Data.Execute(sql, null, ref result);
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

                _scheduler.ScheduleJob(apjob, aptrigger);
            }
        }
    }
}
