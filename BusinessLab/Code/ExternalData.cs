using Microsoft.ApplicationInsights.AspNetCore;
using Microsoft.Data.SqlClient;
using System.Data;

namespace IT_Admin.Code
{
	public class ExternalData
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
		internal static DataTable Execute(string sql, ConnectionType ctype, SqlParameter[]? parameters = null)
		{
			var dt = new DataTable();

			string cs = "";

			switch (ctype)
			{
				case ConnectionType.DevAtecApi: cs = Resource1.DevAtecApiConnectionString; break;
				case ConnectionType.DevAtecApiData: cs = Resource1.DevAtecApiDataConnectionString; break;
				case ConnectionType.LiveAtecApi: cs = Resource1.LiveAtecApiConnectionString;break;
				case ConnectionType.LiveAtecApiData: cs = Resource1.LiveAtecApiDataConnectionString; break;
				case ConnectionType.DevKentico: cs = Resource1.DevKentico; break;
				case ConnectionType.StagingKentico: cs = Resource1.StagingKentico;break;
				case ConnectionType.LiveKentico: cs = Resource1.LiveKentico; break;
			}
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

	}
}
