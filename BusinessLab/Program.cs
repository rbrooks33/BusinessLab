using BusinessLab;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using Quartz;
using System.Linq;
using System.Collections.Generic;
using System.Reflection.PortableExecutable;
using BusinessLab.Code;
using BusinessLabClassLib;
using IT_Admin.Code;

var builder = WebApplication.CreateBuilder(args);

//app.MapGet("/", () => "Hello World!");
//Workflow.Start();

builder.Services.AddHttpClient("HttpClientWithSSLUntrusted").ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
	ClientCertificateOptions = ClientCertificateOption.Manual,
	ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
			
}); ;


//QUARTX
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

//SIGNALR
builder.Services.AddSignalR();

//CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
	options.AddPolicy(name: MyAllowSpecificOrigins,
					  policy =>
					  {
						  policy.WithOrigins("https://localhost:44381").AllowAnyHeader();
					  });
});
builder.Services.AddApplicationInsightsTelemetry();

var app = builder.Build();
//app.Use(async (context, next) =>
//{
//	context.Response.Headers.Add("X-Frame-Options", "ALLOW");
//	await next();
//});

app.UseHttpsRedirection();
app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "index.html" } });
app.UseStaticFiles();
app.MapHub<PushHub>("/pushhub");
app.UseCors(MyAllowSpecificOrigins);

app.Urls.Add("https://localhost:54322/");

app.MapPost("/api", ([FromServices] WorkflowScheduler scheduler, [FromServices]IHubContext <PushHub> hub, [FromBody] Result result) =>
{
    try
    {
		//var client = new HttpClient();
		//var response = client.GetAsync("https://www.atecorp.com:7099/api/main?severityid=1&title=tester&description=testeruni&uniqueid=rodney&appuniqueid=saleswizard&stepuniqueid=crm");
		//var responseText = response.GetAwaiter().GetResult();

		//new HttpClient().GetAsync("https://www.atecorp.com:7099/api/main?severityid=1&title=tester&description=testeruni&uniqueid=rodney&appuniqueid=saleswizard&stepuniqueid=crm");

		//hub.Clients.All.SendAsync(JsonConvert.SerializeObject(result));
		//PushHub.SendMessage(hub, result);

		var business = new Business(scheduler);
		if (1 == 1) //BusinessLab.Passwordless.ValidatePasswordlessToken(ref result))
		{
			var requestName = result.Params.Where(p => p.Name == "RequestName");

			if (requestName.Count() == 1)
			{
				switch (requestName.Single().Value)
				{
					//Common
					case "AddLog": Logs.Add(ref result); PushHub.SendMessage(hub, result, "New Log"); break;
					case "GetLogs": Logs.GetLogs(ref result); break;

					//Apps
					case "GetWorkflowApps": Apps.GetWorkflowApps(ref result); break;
					case "GetAllApps": Apps.GetAllApps(ref result); break;
                    case "GetAllAppLogs": Apps.GetAllAppLogs(ref result); break;
					case "GetAppSteps": Apps.GetAppSteps(ref result); break;
					case "AddStepToApp": Apps.AddStepToApp(ref result); break;
                    case "RemoveStepFromApp": Apps.RemoveStepFromApp(ref result); break;

                    //Areas
                    case "GetAreas": Areas.GetAreas(ref result); break;
					case "UpsertArea": Areas.UpsertArea(ref result); break;
					case "GetAllAreaLogs": Areas.GetAllAreaLogs(ref result); break;
					case "GetAreaLogDetail": Areas.GetAreaLogDetail(ref result); break;

					//Workflows
					case "GetWorkflows": Workflows.GetWorkflows(ref result); break;
					case "SaveWorkflow": Workflows.SaveWorkflow(ref result); break;
					case "AddWorkflow": Workflows.AddWorkflow(ref result); break;
                    case "GetAllWorkflows": Apps.GetAllApps(ref result); break;
                    case "GetAllWorkflowLogs": Workflows.GetAllWorkflowLogs(ref result); break;
					case "GetWorkflowLogDetail": Workflows.GetWorkflowLogDetail(ref result); break;

                    //Steps
                    case "GetSteps": Steps.GetSteps(ref result); break;
					case "SaveStep": Steps.SaveStep(ref result); break;
					case "AddStep": Steps.AddStep(ref result); break;

					case "GetPreview": Business.GetPreview(ref result); break;

					//Actions
					case "GetActions": Business.GetActions(ref result); break;
					case "GetTemplates": Business.GetTemplates(ref result); break;
					case "SaveAction": Business.SaveAction(ref result); break;
					case "AddAction": Business.AddAction(ref result); break;
					case "RunAction": Actions.RunAction(ref result); break;
					case "TestActionCode": Actions.TestCode(ref result); break;
					case "GetWorkflowActions": Actions.GetWorkflowActions(ref result); break;
					//case "GetAreaActions": Actions.
                    case "GetAllActions": Actions.GetAllActions(ref result); break;
                    case "GetAllActionLogs": Actions.GetAllActionLogs(ref result); break;

                    case "TriggerJob": business.TriggerJob(ref result); break;
					case "SendMessage": PushHub.SendMessage(hub, result, result.Message); break;


					case "GetDatabases": Business.GetDatabases(ref result); break;
					case "UpsertDatabase": Business.UpsertDatabase(ref result); break;

					//case "GetTemplates": Business.GetTemplates(ref result); break;
					case "GetTemplate": Business.GetTemplates(ref result); break;

					//Projects
					case "GetProjects": Business.GetProjects(ref result); break;
					case "UpsertProject": Business.UpdateProject(ref result); break;
					case "DeleteProject": Business.DeleteProject(ref result); break;
					case "AddProject": Business.AddProject(ref result); break;

					//Tasks
					case "GetTasks": Business.GetTasks(ref result); break;
					case "UpdateTask": Business.UpdateTask(ref result); break;
					case "DeleteTask": Business.DeleteTask(ref result); break;
					case "AddTask": Business.AddTask(ref result); break;

					//Software
					case "OpenFolder": Software.OpenFolder(ref result);break;
					case "AddSoftware": Software.Add(ref result);break;
					case "GetSoftware": Software.GetSoftware(ref result); break;
					case "UpdateSoftware": Software.UpdateSoftware(ref result); break;
					case "DeleteSoftware": Software.DeleteSoftware(ref result); break;
					case "AddBPLServer": Software.AddBPLServer(ref result); break;
					case "GetContent": Editors.GetContent(ref result); break;

					case "GetConfigs": result.Data = Data.Execute("SELECT * FROM Configs", null, true); result.Success = true; break;

					case "GetCloudQueue": CloudQueue.GetCloudQueue(ref result); break;
					case "UpsertCloudQueue": CloudQueue.UpsertCloudQueue(ref result); break;

					//External
					case "External.GetOrderLogs": External.GetOrderLogs(ref result); break;
					case "External.GetCustomers": External.GetCustomers(ref result); break;
					case "External.GetSalesWizardSteps": External.GetSalesWizardSteps(ref result); break;
					case "External.GetWorkflowApps": External.GetWorkflowApps(ref result); break;
					case "External.GetWorkflowActions": External.GetWorkflowActions(ref result); break;

					default:
						result.FailMessages.Add("No handler for requestname value " + requestName.Single().Value);
						break;
				}
			}
			else
				result.FailMessages.Add("RequestName param not found.");
		}
		else
			result.FailMessages.Add("Token not valid.");
    }
    catch (System.Exception ex)
    {
        result.FailMessages.Add("api exception: " + ex.Message + ". See exception logs for more information.");
        Logs.Add(0, "API Exception", ex.ToString(), ref result, 4);

    }

    return Newtonsoft.Json.JsonConvert.SerializeObject(result);

});

app.MapPost("/Upload", async (HttpContext context) =>
{
	var result = new Result();


	try
	{


			var fileStream = File.Create(Environment.CurrentDirectory + "\\tester1.pdf");

			await context.Request.Body.CopyToAsync(fileStream);
			fileStream.Close();

	}
	catch (Exception ex)
	{
		result.FailMessages.Add(ex.ToString());

	}
	return JsonConvert.SerializeObject(result); ;

});
app.Run();
