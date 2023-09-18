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
				FormattableString sql = $@"

					INSERT INTO Logs (StepID, Title, Description, LogSeverity, UniqueID) 
					VALUES ({stepId}, '{title.Replace("'", "''")}', '{description.Replace("'", "''")}', {(int)severity}, '{uniqueId.Replace("'", "''")}')";

				Data.Execute(sql);
			}
			catch (Exception ex) { 
				result.FailMessages.Add(ex.ToString());
			}
		}
	}
}
