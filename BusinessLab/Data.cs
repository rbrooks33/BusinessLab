using Microsoft.Data.Sqlite;
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

            using (var db = new SqliteConnection("Data Source=businesslab.db"))
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
		public static void Execute(string sql, ref Result result, SqliteParameter[]? parameters = null)
		{
			result.Success = false;

			using (var db = new SqliteConnection("Data Source=businesslab.db"))
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

					result.Data = dt;
					//result.Success = true;
				}
			}
		}
	}
}
