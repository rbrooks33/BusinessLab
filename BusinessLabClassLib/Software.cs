namespace BusinessLabClassLib
{
	public class Software
	{
		public static void Add(ref Result result)
		{
			result.Success = false; //reset
			string sql = "INSERT INTO Software (SoftwareName, SoftwareDescription) VALUES ('[new software name]', '[new software description]'); select last_insert_rowid();";
			var dt = Data.ExecuteCSSqlite(sql, null);
            if (dt.Rows.Count == 1)
            {
				result.Data = dt.Rows[0][0].ToString();
				result.Success = true;
            }
		}
		public static void AddBPLServer(ref Result result)
		{
			//Create a software record
			Add(ref result);
			if (result.Success)
			{
				string newSoftwareId = result.Data.ToString();
				Config.GetValue("SoftwareRootFolder", ref result);

				if (result.Success)
				{
					string rootPath = result.Data.ToString();
					string softwarePath = rootPath + "\\" + newSoftwareId;

					if (!Directory.Exists(softwarePath))
					{
					System.IO.Directory.CreateDirectory(softwarePath);

					  result.SuccessMessages.Add("Created all folders.");

						//Create solution
						Command.Exec("dotnet", "new sln", new Dictionary<string, string>
						{
							{"-o", softwarePath }

						}, softwarePath, ref result);

						result.SuccessMessages.Add("Created solution.");

						//Create software
						Command.Exec("dotnet", "new", new Dictionary<string, string> {
								{"", "webapi" },
								{"-o", "\"" + softwarePath + "\\Software" + newSoftwareId + "\"" },
								{"-n", "Software" + newSoftwareId }
							}, softwarePath, ref result);

						result.SuccessMessages.Add("Created app.");

						//Add project to solution
						string projectPath = "Software" + newSoftwareId + "\\" + "Software" + newSoftwareId + ".csproj";

						Command.Exec("dotnet", "sln", new Dictionary<string, string>
						{
							{"add", projectPath }

						}, softwarePath, ref result);

						result.SuccessMessages.Add("Added project to solution.");

						Command.Exec("git", "init", new Dictionary<string, string>() { { "", "" } }, softwarePath, ref result);

						string buildProjectPath = softwarePath + "\\Software" + newSoftwareId; // + "\\Software" + newSoftwareId + ".csproj";
						Command.Exec("dotnet", "build", new Dictionary<string, string>() { { "", "" } }, buildProjectPath, ref result);

						Command.Exec("C:\\Program Files\\IIS\\Microsoft Web Deploy V3\\msdeploy.exe", "", new Dictionary<string, string>() { { "", "" } }, buildProjectPath, ref result);
						
						result.Success = true;

					}
					else
						result.FailMessages.Add("Directory exists.");
				}
				else
					result.FailMessages.Add("Problem getting the software root folder");
			}
		}
		public static void GetSoftware(ref Result result)
		{
			result.Data = Data.Execute("SELECT * FROM Software", null);
			result.Success = true;
		}
		public static void UpdateSoftware(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("SoftwareID", Result.ParamType.Int))
			{
				result.AddSqliteParam("@SoftwareID", (string)result.DynamicData.SoftwareID);
				result.AddSqliteParam("@SoftwareName", (string)result.DynamicData.SoftwareName);
				result.AddSqliteParam("@SoftwareDescription", (string)result.DynamicData.SoftwareDescription);
				result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

				Data.Execute($@"
                        UPDATE Software 
                        SET SoftwareName = @SoftwareName, 
                        SoftwareDescription = @SoftwareDescription,
                        Archived = @Archived
                        WHERE SoftwareID = @SoftwareID
                    ", result.GetSqliteParamArray());

				result.Success = true;
			}
		}
		public static void DeleteSoftware(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("SoftwareID", Result.ParamType.Int))
			{
				result.SqliteParams.Clear();
				result.AddSqliteParam("@SoftwareID", (string)result.DynamicData.SoftwareID);
				Data.Execute("UPDATE Software SET Archived = 1 WHERE SoftwareID = @SoftwareID", null);
				result.Success = true;
			}
		}
		//Software Versions
		public static void GetSoftwareVersions(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("SoftwareID", Result.ParamType.Int))
			{
				result.SqliteParams.Clear();
				result.AddSqliteParam("@SoftwareID", (string)result.DynamicData.SoftwareID);

				result.Data = Data.Execute("SELECT * FROM SoftwareVersions WHERE SoftwareID = @SoftwareID", null);
				result.Success = true;
			}
		}
		public static void AddSoftwareVersion(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("SoftwareID", Result.ParamType.Int))
			{
				result.SqliteParams.Clear();
				result.AddSqliteParam("@SoftwareID", (string)result.DynamicData.SoftwareID);
				Data.Execute("INSERT INTO SoftwareVersions (SoftwareID, SoftwareVersionName, SoftwareVersionDescription) VALUES (@SoftwareID, '[New Software]', '[Software Description]')", null);
				result.Success = true;
			}
		}
		public static void UpdateSoftwareVersion(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("SoftwareVersionID", Result.ParamType.Int))
			{
				result.AddSqliteParam("@SoftwareVersionID", (string)result.DynamicData.SoftwareVersionID);
				result.AddSqliteParam("@SoftwareVersionName", (string)result.DynamicData.SoftwareVersionName);
				result.AddSqliteParam("@SoftwareVersionDescription", (string)result.DynamicData.SoftwareVersionDescription);
				result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

				Data.Execute($@"
                        UPDATE SoftwareVersions 
                        SET SoftwareVersionName = @SoftwareVersionName, 
                        SoftwareVersionDescription = @SoftwareVersionDescription,
                        Archived = @Archived
                        WHERE SoftwareVersionID = @SoftwareVersionID
                    ", result.GetSqliteParamArray());

				result.Success = true;
			}
		}
		public static void DeleteSoftwareVersion(ref Result result)
		{
			result.ValidateData();
			result.SqliteParams.Clear();

			if (result.ParamExists("SoftwareVersionID", Result.ParamType.Int))
			{
				result.SqliteParams.Clear();
				result.AddSqliteParam("@SoftwareVersionID", (string)result.DynamicData.SoftwareID);
				Data.Execute("UPDATE SoftwareVersions SET Archived = 1 WHERE SoftwareVersionID = @SoftwareVersionID", null);
				result.Success = true;
			}
		}

		public static void GetSoftwareFolder(ref Result result)
		{
			if (result.ParamExists("SoftwareID", Result.ParamType.String))
			{
				Config.GetValue("SoftwareRootFolder", ref result);

				if (result.Success)
				{
					string rootPath = result.Data.ToString();
					string softwarePath = rootPath + "\\" + result.GetParam("SoftwareID");

					if (Directory.Exists(softwarePath))
					{
						result.Data = softwarePath;
						result.Success = true;
					}
					else
						result.FailMessages.Add("Path '" + result.GetParam("Path") + "' does not appear to exist.");
				}
				else
					result.FailMessages.Add("Did not get software root folder.");
			}
		}


		public static void OpenFolder(ref Result result)
		{
			GetSoftwareFolder(ref result);
			if(result.Success)
			{
				//got string and folder exists
				Command.Exec("explorer.exe", result.Data.ToString(), new Dictionary<string, string>(), "", ref result);
			}
			//if (result.ParamExists("SoftwareID", Result.ParamType.String))
			//{
			//	Config.GetValue("SoftwareRootFolder", ref result);

			//	if (result.Success)
			//	{
			//		string rootPath = result.Data.ToString();
			//		string softwarePath = rootPath + "\\" + result.GetParam("SoftwareID");

			//		if (Directory.Exists(softwarePath))
			//		{
			//			Command.Exec("explorer.exe", softwarePath, new Dictionary<string, string>(), "", ref result);
			//			result.Success = true;
			//		}
			//		else
			//			result.FailMessages.Add("Path '" + result.GetParam("Path") + "' does not appear to exist.");
			//	}
			//	else
			//		result.FailMessages.Add("Did not get software root folder.");
			//}
		}
	}
}
