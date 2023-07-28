using BusinessLab;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
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
builder.Services.AddSignalR();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "index.html" } });
app.UseStaticFiles();
app.MapHub<PushHub>("/pushhub");

app.Urls.Add("https://localhost:54322/");


app.MapPost("/api", ([FromServices] WorkflowScheduler scheduler, [FromServices]IHubContext <PushHub> hub, [FromBody] Result result) =>
{
    try
    {
        
        //hub.Clients.All.SendAsync(JsonConvert.SerializeObject(result));
        //PushHub.SendMessage(hub, result);

        var business = new Business(scheduler);

        var requestName = result.Params.Where(p => p.Name == "RequestName");

        if (requestName.Count() == 1)
        {
            switch (requestName.Single().Value)
            {
                case "TriggerJob": business.TriggerJob(ref result); break;
                case "GetActions": Business.GetActions(ref result); break;
                case "SaveAction": Business.SaveAction(ref result); break;
                case "TestActionCode": Actions.TestCode(scheduler, ref result); break;
                case "SendMessage": PushHub.SendMessage(hub, result, result.Message); break;

                    default: result.FailMessages.Add("No handler for requestname value " + requestName.Single().Value); 
                    break;
            }
        }
        else
            result.FailMessages.Add("RequestName param not found.");
    }
    catch (System.Exception ex)
    {
        result.FailMessages.Add("api exception: " + ex.ToString());
    }

    return Newtonsoft.Json.JsonConvert.SerializeObject(result);

});

app.Run();
