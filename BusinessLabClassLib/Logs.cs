
namespace BusinessLabClassLib
{
	public class Logs
	{
		public enum LogSeverity
		{
			Info = 1,
			StepInfo = 2,
			Ugly = 3,
			Exception = 4
		}

		public static void Add(int stepId, string title, string description, ref Result result, int severity, string uniqueId = "")
		{
			try
			{ 
				if (severity == 4)
					description = System.Text.Encodings.Web.JavaScriptEncoder.Default.Encode(description);

				result.SqliteParams.Clear();
				result.AddSqliteParam("@StepID", stepId.ToString());
				result.AddSqliteParam("@Title", title.Replace("'","''"));
				result.AddSqliteParam("@Description", description.Replace("'","''"));
				result.AddSqliteParam("@UniqueID", uniqueId.Replace("'", "''"));
				result.AddSqliteParam("@LogSeverity", severity.ToString());

				string sql = $@"

					INSERT INTO Logs (StepID, Title, Description, LogSeverity, UniqueID) 
					VALUES (@StepID, @Title, @Description, @LogSeverity, @UniqueID)";

				Data.Execute(sql, result.GetSqliteParamArray());

				//SendMessageByServicde
			}
			catch (Exception ex) { 
				result.FailMessages.Add(ex.ToString());
			}
		}
		public static void Add(ref Result result)
		{
			if(result.ParamExists("StepID", Result.ParamType.Int)
				&& result.ParamExists("Title", Result.ParamType.String)
				&& result.ParamExists("Description", Result.ParamType.String)
				&& result.ParamExists("UniqueID", Result.ParamType.String)
				&& result.ParamExists("SeverityID", Result.ParamType.Int))
			{
				string description = result.GetParam("Description");
				if (result.GetParam("SeverityID") == "4")
					description = System.Text.Encodings.Web.JavaScriptEncoder.Default.Encode(description);
				
				result.SqliteParams.Clear();
                result.AddSqliteParam("@StepID", result.GetParam("StepID"));
                result.AddSqliteParam("@Title", result.GetParam("Title").Replace("'", "''"));
                result.AddSqliteParam("@Description", description.Replace("'", "''"));
                result.AddSqliteParam("@UniqueID", result.GetParam("UniqueID").Replace("'", "''"));
                result.AddSqliteParam("@SeverityID", result.GetParam("SeverityID"));

                string sql = $@"

					INSERT INTO Logs (StepID, Title, Description, LogSeverity, UniqueID) 
					VALUES (@StepID, @Title, @Description, @SeverityID, @UniqueID)";

                Data.Execute(sql, result.GetSqliteParamArray());
				result.Success = true;
            }
        }
		public static void GetLogs(ref Result result)
		{
			result.Data = Data.ExecuteCSSqlite("SELECT * FROM Logs", null);
			result.Success = true;
		}
	}
}
