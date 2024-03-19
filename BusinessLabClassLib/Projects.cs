using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
	public class Projects
	{
		public static void GetProjects(ref Result result)
		{
			string sql = "SELECT * FROM Projects";
			result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
			result.Success = true;
		}
		public static void AddProject(ref Result result)
		{
			string sql = "INSERT INTO Projects (ProjectName, ProjectDescription) VALUES ('[New Project]', '[Project Description]')";
			Data.Execute(Data.CreateParams(sql, sql, result.Params));
			result.Success = true;
		}
		public static void UpdateProject(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("ProjectID", Result.ParamType.Int))
			{
				result.AddSqliteParam("@ProjectID", (string)result.DynamicData.ProjectID);
				result.AddSqliteParam("@ProjectName", (string)result.DynamicData.ProjectName);
				result.AddSqliteParam("@ProjectDescription", (string)result.DynamicData.ProjectDescription);
				result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

				Data.ExecuteSqlite($@"
                        UPDATE Projects 
                        SET ProjectName = @ProjectName, 
                        ProjectDescription = @ProjectDescription,
                        Archived = @Archived
                        WHERE ProjectID = @ProjectID
                    ", result.GetSqliteParamArray());

				result.Success = true;
			}
		}
		public static void DeleteProject(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("ProjectID", Result.ParamType.Int))
			{
				string sql = "UPDATE Projects SET Archived = 1 WHERE ProjectID = @ProjectID";
				//result.SqliteParams.Clear();
				//result.AddSqliteParam("@ProjectID", (string)result.DynamicData.ProjectID);
				Data.Execute(Data.CreateParams(sql, sql, result.Params));
				result.Success = true;
			}
		}

	}
}
