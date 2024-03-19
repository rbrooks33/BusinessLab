using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
    public class Apps
    {
        public static void GetWorkflowApps(ref Result result)
        { string sql = @"
                SELECT DISTINCT Apps.AppID, Apps.AppName, Workflows.AreaID FROM Apps
                INNER JOIN Apps_Steps ON Apps_Steps.AppID = Apps.AppID
                INNER JOIN Steps ON Steps.StepID = Apps_Steps.StepID
                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
            ";
            result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
            result.Success = true;
        }
        public  static void GetAllApps(ref Result result)
        {
            result.Data = Data.Execute(Data.CreateParams("SELECT * FROM Apps", "SELECT * FROM Apps", result.Params));
            result.Success = true;
        }
        public static void GetAllAppLogs(ref Result result)
        {
            if (result.ParamExists("AppID"))
            {
                string sqlite = @"
		            SELECT
					(
                        SELECT COUNT(*) 
                        FROM Logs l 
                        WHERE AppUniqueID = (SELECT UniqueID FROM Apps WHERE AppID = @AppID)
                        OR l.AppID = @AppID
                        OR l.StepID IN (SELECT StepID FROM Apps_Steps WHERE AppID = @AppID)
                    ) as InfoCount,
					(
                        SELECT COUNT(*) FROM Logs l 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = l.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND l.LogSeverity = 2
                    ) as GoodCount,
					(
                        SELECT COUNT(*) FROM Logs l 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = l.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND l.LogSeverity = 3
                    ) as UglyCount,
					(
                        SELECT COUNT(*) FROM Logs l 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = l.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND l.LogSeverity = 4
                    ) 
                    as BadCount,                    (
                        SELECT 
	                    julianday('now') - julianday(Logs.Created)
                        FROM Logs 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND Logs.LogSeverity = 4
                        ORDER BY Logs.Created DESC LIMIT 1
                    ) AS BadAge,

					0 As IssueCount

                ";

				string sql = @"
		            SELECT
					(
                        SELECT COUNT(*) 
                        FROM Logs l 
                        WHERE AppUniqueID = (SELECT UniqueID FROM Apps WHERE AppID = @AppID)
                        OR l.AppID = @AppID
                        OR l.StepID IN (SELECT StepID FROM Apps_Steps WHERE AppID = @AppID)
                    ) as InfoCount,
					(
                        SELECT COUNT(*) FROM Logs l 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = l.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND l.LogSeverity = 2
                    ) as GoodCount,
					(
                        SELECT COUNT(*) FROM Logs l 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = l.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND l.LogSeverity = 3
                    ) as UglyCount,
					(
                        SELECT COUNT(*) FROM Logs l 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = l.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND l.LogSeverity = 4
                    ) 
                    as BadCount,                    (
                        SELECT TOP 1
	                    Datediff(d,convert(datetime, Logs.Created) , getdate())
                        FROM Logs 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND Logs.LogSeverity = 4
                        ORDER BY Logs.Created DESC
                    ) AS BadAge,

					0 As IssueCount

                ";
                result.Data = Data.Execute(Data.CreateParams(sqlite, sql, result.Params));
                result.Success = true;
            }
        }
        public static void GetAppSteps(ref Result result)
        {
            if (result.ParamExists("AppID"))
            { 
                string sql = @"
		            SELECT s.StepID, s.StepName, s.WorkflowID,  w.WorkflowName FROM Apps a
                    INNER JOIN Apps_Steps ss ON a.AppID = ss.AppID
                    INNER JOIN Steps s ON s.StepID = ss.StepID
                    INNER JOIN Workflows w ON w.WorkflowID = s.WorkflowID
                    WHERE a.AppID = @AppID

                ";
                result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
                result.Success = true;
            }
        }
        public static void AddStepToApp(ref Result result)
        { 
            string sql = @"INSERT INTO Apps_Steps (AppID, StepID) VALUES (@AppID, @StepID)";

            RemoveStepFromApp(ref result);

            Data.Execute(Data.CreateParams(sql, sql, result.Params));

            result.Success = true;
        }
        public static void RemoveStepFromApp(ref Result result)
        { 
            string sql = @"DELETE FROM Apps_Steps WHERE AppID = @AppID AND StepID = @StepID";

            Data.Execute(Data.CreateParams(sql, sql, result.Params));

            result.Success = true;
        }
    }
}
