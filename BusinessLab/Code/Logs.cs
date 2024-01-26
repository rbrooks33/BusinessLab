namespace BusinessLab
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

		public static void Add(int stepId, string title, string description, ref Result result, LogSeverity severity = LogSeverity.Info, string uniqueId = "")
		{
			try
			{
				result.SqliteParams.Clear();
				result.AddSqliteParam("@StepID", stepId.ToString());
				result.AddSqliteParam("@Title", title.Replace("'","''"));
				result.AddSqliteParam("@Description", description.Replace("'","''"));
				result.AddSqliteParam("@UniqueID", uniqueId.Replace("'", "''"));
				result.AddSqliteParam("@LogSeverity", severity.ToString());

				string sql = $@"

					INSERT INTO Logs (StepID, Title, Description, LogSeverity, UniqueID) 
					VALUES (@StepID, @Title, @Description, @LogSeverity, @UniqueID)";

				Code.Data.Execute(sql, result.GetSqliteParamArray());
			}
			catch (Exception ex) { 
				result.FailMessages.Add(ex.ToString());
			}
		}
	}
}
