namespace BusinessLab
{
	using Microsoft.AspNetCore.SignalR;
	using System.Net;
	using System.Threading.Tasks;

	public class PushHub : Hub
	{
		public async static Task SendMessage(IHubContext<PushHub> hub, Result result, string message = "")
		{
			await hub.Clients.All.SendAsync("ReceiveMessage", result, message);
		}
		public async static Task SendMessageByService(Result result)
		{
			using (WebClient client = new WebClient())
			{

				string url = "https://localhost:54322/api";
				string contextjson = Newtonsoft.Json.JsonConvert.SerializeObject(result); // context.PrimaryEntityName + context.PrimaryEntityId.ToString() + "," + context.MessageName + "," + context.Mode.ToString() + Newtonsoft.Json.JsonConvert.SerializeObject(context.PostEntityImages) + "," + context.InitiatingUserId.ToString(); // + context.ParentContext. Newtonsoft.Json.JsonConvert.SerializeObject(context.);
				client.UseDefaultCredentials = true;
				client.Headers[HttpRequestHeader.ContentType] = "application/json";
				string response = client.UploadString(new Uri(url), "POST", contextjson);
				//string response = Encoding.UTF8.GetString(responseBytes);

				Logs.Add(1, "Push Message By Service Sent", result.Message ?? "blank message", ref result, Logs.LogSeverity.Info, "SendMessageByService");
			}

		}
	}
}
