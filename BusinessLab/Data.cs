using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data;

namespace BusinessLab
{
    public class Data
    {
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
					result.Success = true;
				}
			}
		}
	}
}
