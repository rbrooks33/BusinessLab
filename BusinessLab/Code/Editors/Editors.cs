namespace BusinessLab
{
	public class Editors
	{
		public static void GetContent(ref Result result)
		{
			if (result.ParamExists("FolderPath")
				&& result.ParamExists("ComponentName"))
			{
				if (System.IO.Directory.Exists(result.GetParam("FolderPath")))
				{
					string jsFileName = result.GetParam("FolderPath") + "\\" + result.GetParam("ComponentName") + ".js";
					result.AddParam("JSContent", System.IO.File.ReadAllText(jsFileName));


					string htmlFileName = result.GetParam("FolderPath") + "\\" + result.GetParam("ComponentName") + ".html";
					result.AddParam("HTMLContent", System.IO.File.ReadAllText(htmlFileName));


					string cssFileName = result.GetParam("FolderPath") + "\\" + result.GetParam("ComponentName") + ".css";
					result.AddParam("CSSContent", System.IO.File.ReadAllText(cssFileName));

					result.Success = true;
				}
				else
				{
					result.FailMessages.Add("Folder not found.");
				}
			}
		}
	}
}
