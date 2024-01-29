using System.Net;

namespace BusinessLab.Code
{
	public class CloudQueue
	{
		public static string ClientID = "b524124a-4383-4687-8a9c-b68db2511b12"; //a.k.a. sender

		public static void GetCloudQueue(ref Result result)
		{
			using (WebClient client = new WebClient())
			{
				result.Params.Clear();
				result.AddParam("RequestName", "GetCloudQueue");
				result.AddParam("MyCloudQueueClientID", ClientID);

				string url = "https://brooksoft.azurewebsites.net/api";
				string contextjson = Newtonsoft.Json.JsonConvert.SerializeObject(result); // context.PrimaryEntityName + context.PrimaryEntityId.ToString() + "," + context.MessageName + "," + context.Mode.ToString() + Newtonsoft.Json.JsonConvert.SerializeObject(context.PostEntityImages) + "," + context.InitiatingUserId.ToString(); // + context.ParentContext. Newtonsoft.Json.JsonConvert.SerializeObject(context.);
				client.UseDefaultCredentials = true;
				client.Headers[HttpRequestHeader.ContentType] = "application/json";
				result.Data = client.UploadString(new Uri(url), "POST", contextjson);
				result.Success = true;
				//string response = Encoding.UTF8.GetString(responseBytes);

				//Logs.Add(1, "Push Message By Service Sent", result.Message ?? "blank message", ref result, Logs.LogSeverity.Info, "SendMessageByService");
			}

		}

		public static void UpsertCloudQueue(ref Result result)
		{
			if (result.ParamExists("Reciever") && result.ParamExists("Contents"))
			{
				string reciever = result.GetParam("Reciever");
				string contents = result.GetParam("Contents");

				using (WebClient client = new WebClient())
				{
					//result.Params.Clear();
					result.AddParam("RequestName", "UpsertCloudQueue");
					result.AddParam("Sender", ClientID);

					string url = "https://brooksoft.azurewebsites.net/api";
					string contextjson = Newtonsoft.Json.JsonConvert.SerializeObject(result); // context.PrimaryEntityName + context.PrimaryEntityId.ToString() + "," + context.MessageName + "," + context.Mode.ToString() + Newtonsoft.Json.JsonConvert.SerializeObject(context.PostEntityImages) + "," + context.InitiatingUserId.ToString(); // + context.ParentContext. Newtonsoft.Json.JsonConvert.SerializeObject(context.);
					client.UseDefaultCredentials = true;
					client.Headers[HttpRequestHeader.ContentType] = "application/json";
					result.Data = client.UploadString(new Uri(url), "POST", contextjson);
					result.Success = true;
					//string response = Encoding.UTF8.GetString(responseBytes);

					//Logs.Add(1, "Push Message By Service Sent", result.Message ?? "blank message", ref result, Logs.LogSeverity.Info, "SendMessageByService");
				}
			}
		}

	}
}
