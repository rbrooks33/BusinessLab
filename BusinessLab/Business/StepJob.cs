using Quartz;
using Quartz.Impl;

namespace BusinessLab
{
	public class StepJob: IJob
	{
			Task IJob.Execute(IJobExecutionContext context)
			{
			//Check for quotes and order and update
			//var service = new AteCorp.DynamicsCrmApi.CrmApi();
			//var contacts = service.GetAllContacts();


			return Task.CompletedTask;
			}
	}
}
