using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
	public class Connections
	{
		public static void GetConnections(ref Result result)
		{
			string sql = @"
				SELECT * FROM Connections c 
				INNER JOIN 
					ConnectionTypes ct ON ct.ConnectionTypeID = c.ConnectionTypeID";

			result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
			result.Success = true;
		}
		public static void GetConnectionString(ref Result result)
		{
			if (result.ParamExists("ConnectionID"))
			{
				var p = new List<SqliteParameter>
				{
					new SqliteParameter { ParameterName = "@ConnectionID", Value = result.GetParam("ConnectionID") }
				};

				var dtConnections = Data.ExecuteSqlite("SELECT * FROM Connections WHERE ConnectionID = @ConnectionID", p.ToArray());

				if (dtConnections.Rows.Count == 1)
				{
					result.Data = dtConnections.Rows[0]["ConnectionString"];
					result.Success = true;
				}
			}
		}
		public static void GetBPLConnectionString(ref Result result)
		{

			result.Data = Data.ExecuteSqlite("SELECT * FROM BPLConnections WHERE Active = 1 LIMIT 1", null);
			result.Success = true;

		}
	}
}
