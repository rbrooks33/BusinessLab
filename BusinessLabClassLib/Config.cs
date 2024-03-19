using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
	public class Config
	{
		public static void GetConfigs(ref Result result)
		{
			result.Data = Data.Execute(Data.CreateParams("SELECT * FROM Configs", "SELECT * FROM Configs", result.Params));
			result.Success = true;
		}
		public static void GetValue(string name, ref Result result)
		{
			result.Success = false; //reset

			var p = new List<SqliteParameter>();
			p.Add(new SqliteParameter("@Name", name));
			var dtConfig = Data.ExecuteSqlite("SELECT ConfigValue FROM Configs WHERE ConfigName = @Name", p.ToArray());
			if (dtConfig.Rows.Count == 1)
			{
				result.Data = dtConfig.Rows[0]["ConfigValue"].ToString();
				result.Success = true;
			}
			else
				result.FailMessages.Add("Config not found apparently.");
        }
	}
}
