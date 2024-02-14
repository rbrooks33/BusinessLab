using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
    public static class Command
    {
        public static void Exec(string fileName, string command, Dictionary<string, string> args, string workingDirectory, ref Result outResult)
        {
            ////commit
            //AppsDesktop.Command.Exec("git", "add", new Dictionary<string, string>() { { "-A", "" } }, workingFolder, ref result);

            //SaveMessages("add", result, ref allerrormessages, ref allsuccessmessages);

            //AppsDesktop.Command.Exec("git", "commit", new Dictionary<string, string>() { { "-m", "\"" + message + "\"" } }, workingFolder, ref result);

            //SaveMessages("commit", result, ref allerrormessages, ref allsuccessmessages);

            //AppsDesktop.Command.Exec("git", "push", new Dictionary<string, string>() { { "origin", "HEAD:main" } }, workingFolder, ref result);


            var result = new Result(); // AppsClient.AppsResult();

            try
            {
                var arguments = string.Join(" ", args.Select((k) => string.Format("{0} {1}", k.Key, " " + k.Value + " ")));

                //var projectPath = @"D:\Work\Brooksoft\AppsJS\AppsJSDev\AppsJSDev\AppsJSDev\appsjsdev.csproj"; // @"C:\Users\xyz\Documents\Visual Studio 2017\myConsole\bin\Debug\netcoreapp2.1\myConsole.dll";
                var procStartInfo = new System.Diagnostics.ProcessStartInfo();
                procStartInfo.FileName = fileName;
                procStartInfo.Arguments = @$" {command} {arguments}";
                procStartInfo.UseShellExecute = false;
                procStartInfo.CreateNoWindow = false;
                procStartInfo.RedirectStandardOutput = true;
                procStartInfo.RedirectStandardError = true;
                procStartInfo.WorkingDirectory = workingDirectory;

                var sb = new System.Text.StringBuilder();
                var pr = new System.Diagnostics.Process();
                pr.StartInfo = procStartInfo;

                //pr.OutputDataReceived += (s, ev) =>
                //{
                //    if (!string.IsNullOrWhiteSpace(ev.Data))
                //    {
                //        result.SuccessMessages.Add(ev.Data.ToString());
                //    }
                //    else
                //    {
                //        result.SuccessMessages.Add("[blank string]");
                //    }

                //    //string[] split = ev.Data.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);


                //};

                //pr.ErrorDataReceived += (s, err) =>
                //{
                //    if (err.Data != null)
                //        result.FailMessages.Add("err: " + err.Data);
                //    else
                //        result.FailMessages.Add("Error but data is null.");
                //};

                //pr.EnableRaisingEvents = true;

                //result.SuccessMessages.Add("files: " + pr.StartInfo.FileName + ", args: " + pr.StartInfo.Arguments);

                

                pr.Start();

                var outputReader = pr.StandardOutput;
                string output = outputReader.ReadToEnd();

                var errorReader = pr.StandardError;
                string errors = errorReader.ReadToEnd();

                if(errors.Length > 0)
                    result.FailMessages.Add(errors);
                if(output.Length > 0) 
                    result.SuccessMessages.Add(output);

                //pr.StandardOutput.Read();
                //pr.StandardError.Read();
                //pr.BeginErrorReadLine();
                //pr.BeginOutputReadLine();

                pr.WaitForExit();

                result.Success = true;

                outResult = result;
            }
            catch(System.Exception ex)
            {
                outResult.FailMessages.Add("Exception: " + ex.ToString());
                //new AppFlows.Helpers.AppsSystem.Exception(ex, ref outResult);
            }
        }
		public static void ExecuteCommand(string command, ref Result result)
		{
			var processStartInfo = new ProcessStartInfo();
			processStartInfo.FileName = "powershell.exe";
			processStartInfo.Arguments = $"-Command \"{command}\"";
			processStartInfo.UseShellExecute = false;
			processStartInfo.RedirectStandardOutput = true;
            //processStartInfo.RedirectStandardError = true;

			using var process = new Process();
			process.StartInfo = processStartInfo;
			process.Start();
			result.SuccessMessages.Add(process.StandardOutput.ReadToEnd());
            //result.FailMessages.Add(process.StandardError.ReadToEnd());
			//Console.Writeline(output);
		}
	}
}
