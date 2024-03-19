using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
	public class Tasks
	{
		public static void GetTasks(ref Result result)
		{
			result.Data = Data.Execute(Data.CreateParams("SELECT * FROM Tasks", "SELECT * FROM Tasks", result.Params));
			result.Success = true;
		}
		public static void AddTask(ref Result result)
		{
			Data.Execute(Data.CreateParams("INSERT INTO Tasks (TaskName, TaskDescription) VALUES ('[New Task]', '[Task Description]')", "INSERT INTO Tasks (TaskName, TaskDescription) VALUES ('[New Task]', '[Task Description]')", result.Params));
			result.Success = true;
		}
		public static void UpdateTask(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("TaskID", Result.ParamType.Int))
			{
				result.AddSqliteParam("@TaskID", (string)result.DynamicData.TaskID);
				result.AddSqliteParam("@TaskName", (string)result.DynamicData.TaskName);
				result.AddSqliteParam("@TaskDescription", (string)result.DynamicData.TaskDescription);
				result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

				Data.ExecuteSqlite($@"
                        UPDATE Tasks 
                        SET TaskName = @TaskName, 
                        TaskDescription = @TaskDescription,
                        Archived = @Archived
                        WHERE TaskID = @TaskID
                    ", result.GetSqliteParamArray());

				result.Success = true;
			}
		}
		public static void DeleteTask(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("TaskID", Result.ParamType.Int))
			{
				result.SqliteParams.Clear();
				result.AddSqliteParam("@TaskID", (string)result.DynamicData.TaskID);
				Data.Execute(Data.CreateParams("UPDATE Tasks SET Archived = 1 WHERE TaskID = @TaskID", "UPDATE Tasks SET Archived = 1 WHERE TaskID = @TaskID", result.Params));
				result.Success = true;
			}
		}

	}
}
