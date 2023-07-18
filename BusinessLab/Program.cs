using BusinessLab;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Quartz;

var builder = WebApplication.CreateBuilder(args);

//app.MapGet("/", () => "Hello World!");
//Workflow.Start();


builder.Services.AddQuartz(q =>
{
	q.SchedulerId = "JobScheduler";
	q.SchedulerName = "Job Scheduler";
	q.UseMicrosoftDependencyInjectionJobFactory();
	
});

builder.Services.AddSingleton<ISchedulerFactory, SchedulerFactory>();
//builder.Services.AddQuartzServer(options =>
//{
//	options.WaitForJobsToComplete = true;
//});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "index.html" } });
app.UseStaticFiles();

app.Urls.Add("https://localhost:54322/");


app.MapPost("/api", ([FromServices] Quartz.IScheduler scheduler, [FromBody] Result result) =>
{
    try
    {
        var business = new Business(scheduler);

        var requestName = result.Params.Where(p => p.Name == "RequestName");

        if(requestName.Count() == 1)
        {
            if(requestName.Single().Value == "TriggerStepJob")
            {
                business.TriggerStepJob(ref result);
            }
        }
        //Business.GetAreas(ref result);
    }
    catch (System.Exception ex)
    {
        
    }

    return result;

});

app.Run();
