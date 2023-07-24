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
			try
			{
				string group = context.JobDetail.Key.Group;
				string name = context.JobDetail.Key.Name;


			}
			catch(Exception ex) {
				//TODO: log via web service & text file as backup
			}
			return Task.CompletedTask;
		}
	}
    public class StepListener : ITriggerListener
    {
        public string Name => "StepTriggerListener";

        public Task TriggerComplete(ITrigger trigger, IJobExecutionContext context, SchedulerInstruction triggerInstructionCode, CancellationToken cancellationToken = default)
        {
            //throw new NotImplementedException();
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
            var m_task = new Task<bool>;
        }
    }
}
