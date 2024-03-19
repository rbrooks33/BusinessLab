using BusinessLabClassLib;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.FileProviders.Composite;
using Newtonsoft.Json;
using Quartz;
using Quartz.Impl;
using Quartz.Simpl;
using System.Data;
using System.IO.Compression;
using System.Net;
using static Quartz.Logging.OperationName;

namespace BusinessLab
{
    public class Business
    {
        //WorkflowScheduler _scheduler;

        //public Business(WorkflowScheduler scheduler) {
        //    _scheduler = scheduler;
        //}


        //Databases
        //public static void GetDatabases(ref Result result)
        //{
        //    result.Data = Data.Execute(Data.CreateParams($"SELECT * FROM Databases", $"SELECT * FROM Databases", result.Params));
        //    result.Success = true;
        //}

  //      public static void UpsertDatabase(ref Result result)
  //      {
  //          result.ValidateData();
  //          result.SqliteParams.Clear();

  //          if (result.ParamExists("DatabaseID", Result.ParamType.Int))
  //          {
  //              result.AddSqliteParam("@DatabaseID", (string)result.DynamicData.DatabaseID);

  //              var databases = Data.ExecuteSqlite($@" 
  //                  SELECT * FROM Databases 
  //                  WHERE DatabaseID = @DatabaseID
  //              ", result.GetSqliteParamArray());

  //              if (databases.Rows.Count == 1)
  //              {
  //                  //Update
  //                  result.SqliteParams.Clear();
  //                  result.AddSqliteParam("@DatabaseName", (string)result.DynamicData.DatabaseName);
  //                  result.AddSqliteParam("@ConnectionString", (string)result.DynamicData.ConnectionString);
  //                  result.AddSqliteParam("@DatabaseID", (string)result.DynamicData.DatabaseID);

  //                  Data.ExecuteSqlite($@"
  //                      UPDATE Databases 
  //                      SET DatabaseName = @DatabaseName, 
  //                      ConnectionString = @ConnectionString 
  //                      WHERE DatabaseID = @DatabaseID
  //                  ", result.GetSqliteParamArray());

  //                  result.Success = true;
  //              }
  //              else
  //              {
  //                  //Insert
  //                  result.SqliteParams.Clear();
  //                  result.AddSqliteParam("@DatabaseName", (string)result.DynamicData.DatabaseName);
  //                  result.AddSqliteParam("@ConnectionString", (string)result.DynamicData.ConnectionString);

  //                  Data.ExecuteSqlite($@"
  //                      INSERT INTO Databases 
  //                          (DatabaseName, ConnectionString) 
  //                      VALUES 
  //                          (@DatabaseName, @ConnectionString
  //                  ", result.GetSqliteParamArray());

  //                  result.Success = true;
  //              }
  //          }
  //      }
		//public static void DeleteDatabase(ref Result result)
		//{
		//	result.Data = Data.Execute($"SELECT * FROM Databases");
		//	result.Success = true;
		//}

		//public static void GetTemplates(ref Result result)
		//{
		//	result.Data = Data.Execute($"SELECT * FROM Templates");
		//	result.Success = true;
		//}
  //      public static void GetTemplate(ref Result result)
  //      {
  //          if (result.ParamExists("TemplateID"))
  //          {
  //              result.Data = Data.Execute($"SELECT * FROM Templates WHERE TemplateID = {result.GetParam("TemplateID")}");
  //              result.Success = true;
  //          }
            
  //      }

		//public static void GetAreas(ref Result result)
  //      {
		//	result.Data = Data.Execute($"SELECT * FROM Areas");
		//	result.Success = true;
		//}
  //      public static void UpsertArea(ref Result result)
  //      {
		//	result.ValidateData();
		//	result.SqliteParams.Clear();

		//	if (result.ParamExists("AreaID", Result.ParamType.Int))
		//	{
		//		result.AddSqliteParam("@AreaID", (string)result.DynamicData.AreaID);

		//		var databases = Data.Execute($@" 
  //                  SELECT * FROM Areas 
  //                  WHERE AreaID = @AreaID
  //              ", result.GetSqliteParamArray());

		//		if (databases.Rows.Count == 1)
		//		{
		//			//Update
		//			result.SqliteParams.Clear();
		//			result.AddSqliteParam("@AreaName", (string)result.DynamicData.AreaName);
		//			result.AddSqliteParam("@AreaID", (string)result.DynamicData.AreaID);

		//			Data.Execute($@"
  //                      UPDATE Areas 
  //                      SET AreaName = @AreaName
  //                      WHERE AreaID = @AreaID
  //                  ", result.GetSqliteParamArray());

		//			result.Success = true;
		//		}
		//		else
		//		{
		//			//Insert
		//			result.SqliteParams.Clear();
		//			result.AddSqliteParam("@AreaName", "[New Area]");

		//			Data.Execute($@"
  //                      INSERT INTO Areas 
  //                          (AreaName) 
  //                      VALUES 
  //                          (@AreaName)
  //                  ", result.GetSqliteParamArray());

		//			result.Success = true;
		//		}
		//	}
		//}
		//public static void GetTemplates(ref Result result)
		//{
		//    string sql = "SELECT * FROM Templates";
		//    Data.Execute(sql, ref result);
		//    result.Success = true;
		//}


		public static void GetActions(ref Result result)
		{
   //         var dt = new DataTable();

			//using (var conn = new SqliteConnection(Resource.SqliteConnectionString))
			//{
			//	conn.Open();
			//	var cmd = new SqliteCommand("SELECT * FROM Actions", conn);
			//	var reader = cmd.ExecuteReader();
			//	dt.Load(reader);
			//	conn.Close();
			//}

            result.Data = Data.ExecuteSqlite($"SELECT * FROM Actions", null);
            result.Success = true;
		}
        public static void GetPreview(ref Result result)
        {
            if (result.ParamExists("URL"))
            {
                var url = result.GetParam("URL"); // "http://www.morningstar.com/";
                var httpClient = new HttpClient();

                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "text/html,application/xhtml+xml,application/xml");
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Accept-Encoding", "gzip, deflate");
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:19.0) Gecko/20100101 Firefox/19.0");
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Accept-Charset", "ISO-8859-1");

                var response = httpClient.GetAsync(new Uri(url)).Result;
                response.EnsureSuccessStatusCode();
                using (var responseStream = response.Content.ReadAsStreamAsync().Result)
                using (var decompressedStream = new GZipStream(responseStream, CompressionMode.Decompress))
                using (var streamReader = new StreamReader(decompressedStream))
                {
                    result.Data = streamReader.ReadToEnd();
                }
            }
		}
        public static async Task<string> PostATECApi(Result result)
        {
			string myJson = JsonConvert.SerializeObject(result);

			using (var client = new System.Net.Http.HttpClient())
			{
				//log
				var response = await client.PostAsync("https://crm2016uat.atecorp.com:8099/api/main", new System.Net.Http.StringContent(myJson, System.Text.Encoding.UTF8, "application/json"));
                var contents = await response.Content.ReadAsStringAsync();
                
                return contents;
			}
            
		}
	}
}
