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
        {
            result.Data = Data.ExecuteCSSqlite(@"
                SELECT DISTINCT Apps.AppID, Apps.AppName, Workflows.AreaID FROM Apps
                INNER JOIN Apps_Steps ON Apps_Steps.AppID = Apps.AppID
                INNER JOIN Steps ON Steps.StepID = Apps_Steps.StepID
                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
            ", null);
            result.Success = true;
        }
        public  static void GetAllApps(ref Result result)
        {
            result.Data = Data.ExecuteCSSqlite(@"
                SELECT * FROM Apps", null);
            result.Success = true;

        }
        public static void GetAllAppLogs(ref Result result)
        {
            if (result.ParamExists("AppID"))
            {
                var sqliteParams = new List<SqliteParameter>();
                sqliteParams.Add(new SqliteParameter() { ParameterName = "@AppID", Value = result.GetParam("AppID") });
                result.Data = Data.ExecuteCSSqlite(@"
		            SELECT
					(
                        SELECT COUNT(*) FROM Logs l 
                        INNER JOIN Apps_Steps ON Apps_Steps.StepID = l.StepID 
                        WHERE Apps_Steps.AppID = @AppID AND l.LogSeverity = 1
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

                ", sqliteParams.ToArray());
                result.Success = true;
            }
        }
        public static void GetAppSteps(ref Result result)
        {
            if (result.ParamExists("AppID"))
            {
                var sqliteParams = new List<SqliteParameter>();
                sqliteParams.Add(new SqliteParameter() { ParameterName = "@AppID", Value = result.GetParam("AppID") });
                result.Data = Data.ExecuteCSSqlite(@"
		            SELECT s.StepID, s.StepName, s.WorkflowID,  w.WorkflowName FROM Apps a
                    INNER JOIN Apps_Steps ss ON a.AppID = ss.AppID
                    INNER JOIN Steps s ON s.StepID = ss.StepID
                    INNER JOIN Workflows w ON w.WorkflowID = s.WorkflowID
                    WHERE a.AppID = @AppID

                ", sqliteParams.ToArray());
                result.Success = true;
            }
        }
        public static void AddStepToApp(ref Result result)
        {
            var sqliteParams = new List<SqliteParameter>();

            sqliteParams.Add(new SqliteParameter() { ParameterName = "@AppID", Value = result.GetParam("AppID") });
            sqliteParams.Add(new SqliteParameter() { ParameterName = "@StepID", Value = result.GetParam("StepID") });

            RemoveStepFromApp(ref result);

            //Data.ExecuteCSSqlite(@"DELETE FROM Apps_Steps WHERE AppID = @AppID AND StepID = @StepID", sqliteParams.ToArray());
            Data.ExecuteCSSqlite(@"INSERT INTO Apps_Steps (AppID, StepID) VALUES (@AppID, @StepID)", sqliteParams.ToArray());

            result.Success = true;
        }
        public static void RemoveStepFromApp(ref Result result)
        {
            var sqliteParams = new List<SqliteParameter>();

            sqliteParams.Add(new SqliteParameter() { ParameterName = "@AppID", Value = result.GetParam("AppID") });
            sqliteParams.Add(new SqliteParameter() { ParameterName = "@StepID", Value = result.GetParam("StepID") });

            Data.ExecuteCSSqlite(@"DELETE FROM Apps_Steps WHERE AppID = @AppID AND StepID = @StepID", sqliteParams.ToArray());

            result.Success = true;
        }
    }
}
