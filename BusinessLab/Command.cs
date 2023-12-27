using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLab
{
    public static class Command
    {
        public static void Exec(string fileName, string command, Dictionary<string, string> args, string workingDirectory, ref Result outResult)
        {
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

                result.FailMessages.Add(errors);
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
    }
}
