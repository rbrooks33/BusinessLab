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

builder.Services.AddSingleton<WorkflowScheduler, WorkflowScheduler>();
//builder.Services.AddQuartzServer(options =>
//{
//	options.WaitForJobsToComplete = true;
//});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "index.html" } });
app.UseStaticFiles();

app.Urls.Add("https://localhost:54322/");


app.MapPost("/api", ([FromServices] WorkflowScheduler scheduler, [FromBody] Result result) =>
{
    try
    {
        var business = new Business(scheduler);

        var requestName = result.Params.Where(p => p.Name == "RequestName");

        if(requestName.Count() == 1)
        {
            switch (requestName.Single().Value)
            {
                case "TriggerStepJob":  business.TriggerStepJob(ref result); break;
                case "GetActions": Business.GetActions(ref result); break;
                case "SaveAction": Business.SaveAction(ref result); break;
            }
        }
    }
    catch (System.Exception ex)
    {
        result.FailMessages.Add("api exception: " + ex.ToString());
    }

    return Newtonsoft.Json.JsonConvert.SerializeObject(result);

});

app.Run();
