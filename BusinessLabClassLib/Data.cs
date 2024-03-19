using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using System.Data;
using System.Data.Common;

namespace BusinessLabClassLib
{
	public class Data
    {

		public enum ConnectionType
		{
			DevAtecApi = 1,
			DevAtecApiData = 2,
			LiveAtecApi = 3,
			LiveAtecApiData = 4,
			DevKentico = 5,
			StagingKentico = 6,
			LiveKentico = 7
		}
		public class ParamSet
		{
			public ParamSet(string sqliteSql, string sqlServerSql) { 
				SqliteSql = sqliteSql;
				SqlServerSql = sqlServerSql;
			}
            public string SqliteSql  { get; set; }
			public string SqlServerSql { get; set; }
            public List<SqlParameter> SqlParams { get; set; } = new List<SqlParameter>();
            public List<SqliteParameter> SqliteParams { get; set; } = new List<SqliteParameter>();
        }
		//public static ParamSet CreateParams(List<Result.Param> resultParams)
		//{
		//	var paramSet = new ParamSet("", "");

		//	foreach(var resultParam in resultParams)
		//	{
		//		paramSet.SqlParams.Add(new SqlParameter("@" + resultParam.Name, resultParam.Value));
		//		paramSet.SqliteParams.Add(new SqliteParameter("@" + resultParam.Name, resultParam.Value));
		//	}

		//	return paramSet;
		//}
		public static ParamSet CreateParams(string sqliteSql, string sqlServerSql, List<Result.Param> resultParams)
		{
			var paramSet = new ParamSet(sqliteSql, sqlServerSql);

			foreach (var resultParam in resultParams)
			{
				paramSet.SqlParams.Add(new SqlParameter("@" + resultParam.Name, resultParam.Value));
				paramSet.SqliteParams.Add(new SqliteParameter("@" + resultParam.Name, resultParam.Value));
			}

			return paramSet;
		}

		//public static T Execute<T>(string sql, ref Result result, DbParameter[]? parameters = null)
		//{
		//	result.Success = false;
		//	T returnObj = default(T);

		//	string cs = "Data Source=Data\businesslab.db";
		//	using (var db = new SqliteConnection(cs))
		//	{
		//		db.Open();
		//		var command = db.CreateCommand();
		//		command.CommandText = sql;

		//		if (parameters != null)
		//		{
		//			command.Parameters.AddRange(parameters);
		//		}
		//		//command.Parameters.AddWithValue("$id", id);

		//		using (var reader = command.ExecuteReader())
		//		{
		//			var dt = new DataTable();
		//			dt.Load(reader);

		//			result.Data = JsonConvert.SerializeObject(dt);
		//			returnObj = JsonConvert.DeserializeObject<T>(result.Data.ToString()); // (T)Convert.ChangeType(result.Data, typeof(T));
		//			result.Success = true;
		//		}
		//	}
		//	return returnObj;
		//}
		//public static DataTable Execute(FormattableString sql, bool UseSqlite = false)
		//{
		//	string sqlString = sql.Format;

		//	var parameters = new List<SqliteParameter>();
		//	var args = sql.GetArguments();

		//	for (int x = 0; x < args.Count(); x++)
		//	{
		//		sqlString = sqlString.Replace("{" + x + "}", "@arg" + x);
		//		parameters.Add(new SqliteParameter($"@arg{x}", args[x]));
		//	}
		//	return Execute(sqlString, parameters.ToArray(), UseSqlite);
		//}

		public static DataTable ExecuteSqlite(string sql, DbParameter[]? parameters, bool UseSqlite = false)
		{
			var dt = new DataTable();

			string cs = "Data Source=Data\\businesslab.db";

			using (var conn = new SqliteConnection(cs))
			{
				conn.Open();
				var cmd = new SqliteCommand(sql, conn);

				if (parameters != null)
					cmd.Parameters.AddRange(parameters);

				var reader = cmd.ExecuteReader();
				dt.Load(reader);
				conn.Close();
			}
			return dt;
		}
		public static DataTable ExecuteSqlServer(string sql, string cs, SqlParameter[]? parameters)
		{
			var dt = new DataTable();

			using (var conn = new SqlConnection(cs))
			{
				conn.Open();
				var cmd = new SqlCommand(sql, conn);

				if (parameters != null)
					cmd.Parameters.AddRange(parameters);

				var reader = cmd.ExecuteReader();
				dt.Load(reader);
				conn.Close();
			}

			return dt;
		}

		//public static DataTable ExecuteCSSqlite(string sql, SqliteParameter[]? parameters)
		//{
		//	var dt = new DataTable();
		//	string cs = "Data Source=Data\\businesslab.db";

		//	using (var conn = new SqliteConnection(cs))
		//	{
		//		conn.Open();
		//		var cmd = new SqliteCommand(sql, conn);

		//		if (parameters != null)
		//			cmd.Parameters.AddRange(parameters);

		//		var reader = cmd.ExecuteReader();
		//		dt.Load(reader);
		//		conn.Close();
		//	}

		//	return dt;
		//}

		//internal static DataTable Execute(string sql, ParamSet paramSet)
		//{
		//	var dt = new DataTable();

		//	var dtBPLConnectinString = Data.ExecuteCSSqlite("SELECT * FROM BPLConnections WHERE Active = 1", null);
		//	if (dtBPLConnectinString.Rows.Count > 0)
		//	{
		//		bool isSqlite = Convert.ToBoolean(dtBPLConnectinString.Rows[0]["IsSqlite"]);
		//		string cs = dtBPLConnectinString.Rows[0]["ConnectionString"].ToString();

		//		if (isSqlite)
		//		{
		//			using (var conn = new SqliteConnection(cs))
		//			{
		//				conn.Open();
		//				var cmd = new SqliteCommand(sql, conn);

		//				if (paramSet.SqliteParams.Count > 0)
		//					cmd.Parameters.AddRange(paramSet.SqliteParams);

		//				var reader = cmd.ExecuteReader();
		//				dt.Load(reader);
		//				conn.Close();
		//			}
		//		}
		//		else
		//		{
		//			dt = Data.ExecuteSqlServer(sql, cs, paramSet.SqlParams.ToArray());
		//		}
		
		//	}
		//	else if(dtBPLConnectinString.Rows.Count > 1)
		//	{
		//		var result = new Result();
		//		Logs.Add(0, "More than one active BPL connection", "", ref result, 3, "Data Execute");
		//	}
  //          else
  //          {
		//		var result = new Result();
		//		Logs.Add(0, "No active BPL connections", "", ref result, 4, "Data Execute");
  //          }
  //          return dt;
		//}
		internal static DataTable Execute(ParamSet paramSet)
		{
			var dt = new DataTable();

			var dtBPLConnectinString = Data.ExecuteSqlite("SELECT * FROM BPLConnections WHERE Active = 1", null);
			if (dtBPLConnectinString.Rows.Count > 0)
			{
				bool isSqlite = Convert.ToBoolean(dtBPLConnectinString.Rows[0]["IsSqlite"]);
				string cs = dtBPLConnectinString.Rows[0]["ConnectionString"].ToString();

				if (isSqlite)
				{
					using (var conn = new SqliteConnection(cs))
					{
						conn.Open();
						var cmd = new SqliteCommand(paramSet.SqliteSql, conn);

						if (paramSet.SqliteParams.Count > 0)
							cmd.Parameters.AddRange(paramSet.SqliteParams);

						var reader = cmd.ExecuteReader();
						dt.Load(reader);
						conn.Close();
					}
				}
				else
				{
					//dt = Data.ExecuteSqlServer(paramSet.SqlServerSql, cs, paramSet.SqlParams.ToArray());
					using (var conn = new SqlConnection(cs))
					{
						conn.Open();
						var cmd = new SqlCommand(paramSet.SqlServerSql, conn);

						if (paramSet.SqlParams != null)
							cmd.Parameters.AddRange(paramSet.SqlParams.ToArray());

						var reader = cmd.ExecuteReader();
						dt.Load(reader);
						conn.Close();
					}

				}

			}
			else if (dtBPLConnectinString.Rows.Count > 1)
			{
				var result = new Result();
				Logs.Add(0, "More than one active BPL connection", "", ref result, 3, "Data Execute");
			}
			else
			{
				var result = new Result();
				Logs.Add(0, "No active BPL connections", "", ref result, 4, "Data Execute");
			}
			return dt;
		}


	}
}
