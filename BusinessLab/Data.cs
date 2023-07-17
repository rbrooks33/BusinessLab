using Microsoft.Data.Sqlite;
using System.Data;

namespace BusinessLab
{
    public class Data
    {
        public static void Execute(string sql, SqliteParameter[]? parameters, ref Result result)
        {
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
                    result.Success = true;
                    result.Data = dt;
                }
            }

        }
    }
}
