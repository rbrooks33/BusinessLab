using Quartz.Spi;
using Quartz;
using Quartz.Logging;
using Quartz.Impl;
using System.Collections.Specialized;
using System.Runtime.CompilerServices;

namespace BusinessLab
{
	public class WorkflowScheduler
	{
		public WorkflowScheduler()
		{
			this.Start();
		}

		public void Start()
		{

			//LogProvider.SetCurrentLogProvider(new ConsoleLogProvider());

			var properties = new NameValueCollection();

			_scheduler = SchedulerBuilder.Create(properties)
				// default max concurrency is 10
				.UseDefaultThreadPool(x => x.MaxConcurrency = 5)
				// this is the default 
				// .WithMisfireThreshold(TimeSpan.FromSeconds(60))
				.UsePersistentStore(x =>
				{
					x.UseProperties = false;
					x.PerformSchemaValidation = false;
					x.UseMicrosoftSQLite("Data Source=businesslab.db");
					x.UseJsonSerializer();
				})
				.BuildScheduler().Result;

			_scheduler.Start();

			
			//Set up jobs
			//var apjob = JobBuilder.Create<StepJob>().WithIdentity("ap1", "group3").Build();


		}
		private IScheduler _scheduler;

		public IScheduler Scheduler
		{
			get { return _scheduler; }
	
		}
	}
	public class JobFactory : IJobFactory
	{
		protected readonly IServiceProvider Container;

		public JobFactory(IServiceProvider container)
		{
			Container = container;
		}

		public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
		{
			return Container.GetService(bundle.JobDetail.JobType) as IJob;
		}

		public void ReturnJob(IJob job)
		{
			// i couldn't find a way to release services with your preferred DI, 
			// its up to you to google such things
		}
	}
}
