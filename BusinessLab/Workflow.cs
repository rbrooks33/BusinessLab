﻿using Quartz.Spi;
using Quartz;
using Quartz.Logging;
using Quartz.Impl;
using System.Collections.Specialized;
using System.Runtime.CompilerServices;
using Quartz.Impl.Matchers;

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
			var result = new Result();
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
			var actions = Data.Execute<List<Actions.Action>>("SELECT * FROM Actions WHERE IsJob = 1", ref result);

			foreach (var action in actions)
			{
				var job = JobBuilder
					.Create<StepJob>()
					.WithIdentity(action.ActionID.ToString(), "group3")
					.Build();

				_scheduler.ListenerManager.AddTriggerListener(new BusinessLab.StepListener());
			}


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