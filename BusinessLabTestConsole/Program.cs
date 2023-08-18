using BusinessLab;

namespace BusinessLabTestConsole
{
	internal class Program
	{
		static void Main(string[] args)
		{
			Console.WriteLine("Hello, World!");
		}
		//private static void Test_GetAbandonedCartLeads()
		//{
		//	try
		//	{
		//		//result
		//		/*
		//		string sql = $"SELECT * FROM Logs WHERE StepID = 7";
		//		Data.Execute(sql, ref result);
		//		var logs = (System.Data.DataTable)result.Data;
		//		result.SuccessMessages.Add("logs:" + logs.Rows.Count.ToString());
		//		*/

		//		var result = new Result();
		//		result.Params.Clear();
		//		result.Params.Add(new Param { Name = "RequestCommand", Value = "AbandonedCartLeads.GetAbandonedCartLeads" });


		//		System.Threading.Tasks.Task<string> carts = BusinessLab.Business.PostATECApi(result); //use "carts.Result" to produce a stringified Result object (our Result type)

		//		result.SuccessMessages.Add("carts Result: " + carts.Result);

		//		var cartobj = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(carts.Result); //Convert return string to JObject (in form of our Result type) 

		//		//Use to check success of post operation
		//		bool isSuccess = false;
		//		bool.TryParse(cartobj["Success"].ToString(), out isSuccess);

		//		result.SuccessMessages.Add("Getleads success: " + isSuccess.ToString());

		//		if (isSuccess)
		//		{
		//			/*
		//			var dtUsers = (System.Data.DataTable)result.Data;

		//			result.SuccessMessages.Add("found " + dtUsers.Rows.Count.ToString());

		//			foreach (System.Data.DataRow dr in dtUsers.Rows)
		//			{
		//				var lastCheck = Convert.ToDateTime(dr["LastCartCheck"]);
		//				var elapsed = DateTime.Now - lastCheck;
		//				if(elapsed.Days < 14)
		//				{
		//					result.SuccessMessages.Add(" under ");
		//				}
		//				else
		//				{
		//					result.SuccessMessages.Add(" over ");
		//				}
		//			}

		//*/

		//			var users = (Newtonsoft.Json.Linq.JArray)Newtonsoft.Json.JsonConvert.DeserializeObject(cartobj["Data"].ToString());

		//			result.SuccessMessages.Add("Got users: " + users.Count.ToString());

		//			foreach (var user in users)
		//			{
		//				string sql = "";


		//				//Check to create lead

		//				if (DateTime.TryParse(user["LastCartCheck"].ToString(), out DateTime lastcheck))
		//				{
		//					TimeSpan elapsed = DateTime.Now - lastcheck;
		//					if (elapsed.Days <= 14)
		//					{
		//						result.SuccessMessages.Add(" under ");

		//					}
		//					else
		//					{
		//						result.SuccessMessages.Add(" over ");
		//					}
		//				}
		//			}
		//		}

		//	}
		//	catch (System.Exception ex)
		//	{
		//		result.FailMessages.Add(ex.ToString());
		//	}
		//	return Newtonsoft.Json.JsonConvert.SerializeObject(result); // test; // lastcheck.ToString(); // carts.Result;
		//}
	}
}