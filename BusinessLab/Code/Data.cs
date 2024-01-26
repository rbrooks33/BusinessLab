using BusinessLab.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data;
using System.Data.Common;

namespace BusinessLab.Code
{
    public class Data
    {
		
		private static UseDB _UsingDB;

		public static UseDB  UsingDB
		{
			get { return _UsingDB; }
			set { _UsingDB = value; }
		}

        public enum  UseDB
        {
            Local = 1,
			Dev = 2,
			Live = 3
        }
        public static Actions.Action GetAction(string actionIdString, ref Result result)
		{
			var resultAction = new Actions.Action();

			if (int.TryParse(actionIdString, out int actionId))
			{
				resultAction = GetAction(actionId, ref result);
			}
			else
			{
				result.FailMessages.Add("Unable to parse action string " + actionIdString);
			}
			return resultAction;
		}

		public static Actions.Action GetAction(int actionId, ref Result result)
		{
			var resultAction = new Actions.Action();

			//var actions = Data.Execute<List<Actions.Action>>($"SELECT * FROM Actions WHERE ActionID = {actionId}", ref result);
			//if (actions.Count() > 0)
			//	resultAction = actions[0];

			using (var db = new SqliteConnection(Resource.SqliteConnectionString))
			{
				db.Open();
				var command = db.CreateCommand();
				command.CommandText = $"SELECT * FROM Actions WHERE ActionID = {actionId}";

				using (var reader = command.ExecuteReader())
				{
					var dt = new DataTable();
					dt.Load(reader);

					int.TryParse(dt.Rows[0]["SuccessActionID"].ToString(), out int successActionId);
					int.TryParse(dt.Rows[0]["FailActionID"].ToString(), out int failActionId);
					int.TryParse(dt.Rows[0]["RepeatIntervalSeconds"].ToString(), out int repeatIntervalSeconds);
					int.TryParse(dt.Rows[0]["RepeatQuantity"].ToString(), out int repeatQuantity);

					resultAction.Code = dt.Rows[0]["Code"].ToString();
					resultAction.CodeCMD = dt.Rows[0]["CodeCMD"].ToString();
					resultAction.CodePS = dt.Rows[0]["CodePS"].ToString();
					resultAction.UniqueID = dt.Rows[0]["UniqueID"].ToString();
					resultAction.ActionName = dt.Rows[0]["ActionName"].ToString();
					resultAction.ActionID = actionId;
					resultAction.ActionDescription = dt.Rows[0]["ActionDescription"].ToString();
					resultAction.CronSchedule = dt.Rows[0]["CronSchedule"].ToString();
					resultAction.EditorType = dt.Rows[0]["EditorType"].ToString();
					resultAction.FailActionDescription = dt.Rows[0]["FailActionDescription"].ToString();
					resultAction.SuccessActionDescription = dt.Rows[0]["SuccessActionDescription"].ToString();
					resultAction.SuccessActionID = successActionId; // dt.Rows[0]["SuccessActionID"].ToString();
					resultAction.FailActionID = failActionId; // dt.Rows[0]["FailActionID"].ToString();
					resultAction.RepeatIntervalSeconds = repeatIntervalSeconds; // dt.Rows[0]["RepeatIntervalSeconds"].ToString();
					resultAction.RepeatQuantity = repeatQuantity; // repeat dt.Rows[0]["RepeatQuantity"].ToString();
					resultAction.Sql = dt.Rows[0]["Sql"].ToString();
					resultAction.VariableDelimiter = dt.Rows[0]["VariableDelimiter"].ToString();

					//result.Data = JsonConvert.SerializeObject(dt.Rows[0]);
					//resultAction = JsonConvert.DeserializeObject<BusinessLab.Actions.Action>(result.Data.ToString()); // (T)Convert.ChangeType(result.Data, typeof(T));
					result.Success = true;
				}
			}

			return resultAction;
		}

		public static T Execute<T>(string sql, ref Result result, DbParameter[]? parameters = null)
        {
            result.Success = false;
            T returnObj = default(T);

			string cs = Resource.SqlConnectionStringDev;
			if (Data.UsingDB == Data.UseDB.Live)
				cs = Resource.SqlConnectionStringStagingLive;

			if (Data.UsingDB == Data.UseDB.Dev || Data.UsingDB == Data.UseDB.Live)
			{
				using (var db = new SqlConnection(cs))
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
			}
			else
			{
				using (var db = new SqliteConnection(Resource.SqliteConnectionString))
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
			}
            return returnObj;
		}
		public static DataTable Execute(FormattableString sql, bool UseSqlite = false)
		{
			string sqlString = sql.Format;

			if (Data.UsingDB == Data.UseDB.Dev || Data.UsingDB == Data.UseDB.Live)
			{
				var parameters = new List<SqlParameter>();
				var args = sql.GetArguments();

				for (int x = 0; x < args.Count(); x++)
				{
					sqlString = sqlString.Replace("{" + x + "}", "@arg" + x);
					parameters.Add(new SqlParameter($"@arg{x}", args[x]));
				}
				return Execute(sqlString, parameters.ToArray());
			}
			else
			{
				var parameters = new List<SqliteParameter>();
				var args = sql.GetArguments();

				for (int x = 0; x < args.Count(); x++)
				{
					sqlString = sqlString.Replace("{" + x + "}", "@arg" + x);
					parameters.Add(new SqliteParameter($"@arg{x}", args[x]));
				}
				return Execute(sqlString, parameters.ToArray(), UseSqlite);
			}
		}
		public static DataTable Execute(string sql, DbParameter[]? parameters, bool UseSqlite = false)
		{
			var dt = new DataTable();

			string cs = Resource.SqlConnectionStringDev;
			if (Data.UsingDB == Data.UseDB.Live)
				cs = Resource.SqlConnectionStringStagingLive;
			
			if(
				(Data.UsingDB == UseDB.Dev || Data.UsingDB == UseDB.Live)
				&& !UseSqlite)
			{ 
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

			}
			else
			{
				using (var conn = new SqliteConnection(Resource.SqliteConnectionString))
				{
					conn.Open();
					var cmd = new SqliteCommand(sql, conn);

					if (parameters != null)
						cmd.Parameters.AddRange(parameters);

					var reader = cmd.ExecuteReader();
					dt.Load(reader);
					conn.Close();
				}
			}
			return dt;
		}
	}
}
