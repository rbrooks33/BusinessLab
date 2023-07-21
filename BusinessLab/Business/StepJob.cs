using Quartz;
using Quartz.Impl;

namespace BusinessLab
{
	public class StepJob : IJob
	{
		Task IJob.Execute(IJobExecutionContext context)
		{
			string group = context.JobDetail.Key.Group;
			string name = context.JobDetail.Key.Name;


			return Task.CompletedTask;
		}
	}
}
