using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using System.Data;
using System.Data.Common;

namespace BusinessLab.Code
{
	public class Data
    {
		

		public static T Execute<T>(string sql, ref Result result, DbParameter[]? parameters = null)
		{
			result.Success = false;
			T returnObj = default(T);

			string cs = "Data Source=Data\businesslab.db";
			using (var db = new SqliteConnection(cs))
			{
				db.Open();
				var command = db.CreateCommand();
				command.CommandText = sql;

				if (parameters != null)
				{
					command.Parameters.AddRange(parameters);
				}
				//command.Parameters.AddWithValue("$id", id);

				using (var reader = command.ExecuteReader())
				{
					var dt = new DataTable();
					dt.Load(reader);

					result.Data = JsonConvert.SerializeObject(dt);
					returnObj = JsonConvert.DeserializeObject<T>(result.Data.ToString()); // (T)Convert.ChangeType(result.Data, typeof(T));
					result.Success = true;
				}
			}
			return returnObj;
		}
		public static DataTable Execute(FormattableString sql, bool UseSqlite = false)
		{
			string sqlString = sql.Format;

			var parameters = new List<SqliteParameter>();
			var args = sql.GetArguments();

			for (int x = 0; x < args.Count(); x++)
			{
				sqlString = sqlString.Replace("{" + x + "}", "@arg" + x);
				parameters.Add(new SqliteParameter($"@arg{x}", args[x]));
			}
			return Execute(sqlString, parameters.ToArray(), UseSqlite);
		}

		public static DataTable Execute(string sql, DbParameter[]? parameters, bool UseSqlite = false)
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
		internal static DataTable ExecuteCSSqlServer(string sql, string cs, SqlParameter[]? parameters)
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

		internal static DataTable ExecuteCSSqlite(string sql, SqliteParameter[]? parameters)
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

	}
}
