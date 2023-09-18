using Microsoft.Data.SqlClient;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data;

namespace BusinessLab
{
    public class Data
    {
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

			var actions = Data.Execute<List<Actions.Action>>($"SELECT * FROM Actions WHERE ActionID = {actionId}", ref result);
			if (actions.Count() > 0)
				resultAction = actions[0];

			return resultAction;
		}

		public static T Execute<T>(string sql, ref Result result, SqliteParameter[]? parameters = null)
        {
            result.Success = false;
            T returnObj = default(T);

            using (var db = new SqliteConnection(Resource.SqliteConnectionString))
            {
                db.Open();
                var command = db.CreateCommand();
                command.CommandText = sql;

                if(parameters != null)
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
		public static DataTable Execute(FormattableString sql)
		{
			string sqlString = sql.Format;

			var parameters = new List<SqliteParameter>();
			var args = sql.GetArguments();

			for (int x = 0; x < args.Count(); x++)
			{
				sqlString = sqlString.Replace($"{{{x}}}", $"@arg{x}");
				parameters.Add(new SqliteParameter($"@arg{x}", args[x]));
			}

			return Execute(sqlString, parameters.ToArray());
		}
		private static DataTable Execute(string sql, SqliteParameter[]? parameters)
		{
			var dt = new DataTable();
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

			return dt;
		}
	}
}
