using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
    public class Areas
    {
        public static void GetAreas(ref Result result)
        {
            result.Data = Data.ExecuteCSSqlite("SELECT * FROM Areas", null);
            result.Success = true;
        }
        public static void UpsertArea(ref Result result)
        {
            result.ValidateData();
            result.SqliteParams.Clear();

            if (result.ParamExists("AreaID", Result.ParamType.Int))
            {
                result.AddSqliteParam("@AreaID", (string)result.DynamicData.AreaID);

                var databases = Data.Execute($@" 
                    SELECT * FROM Areas 
                    WHERE AreaID = @AreaID
                ", result.GetSqliteParamArray());

                if (databases.Rows.Count == 1)
                {
                    //Update
                    result.SqliteParams.Clear();
                    result.AddSqliteParam("@AreaName", (string)result.DynamicData.AreaName);
                    result.AddSqliteParam("@AreaID", (string)result.DynamicData.AreaID);

                    Data.Execute($@"
                        UPDATE Areas 
                        SET AreaName = @AreaName
                        WHERE AreaID = @AreaID
                    ", result.GetSqliteParamArray());

                    result.Success = true;
                }
                else
                {
                    //Insert
                    result.SqliteParams.Clear();
                    result.AddSqliteParam("@AreaName", "[New Area]");

                    Data.Execute($@"
                        INSERT INTO Areas 
                            (AreaName) 
                        VALUES 
                            (@AreaName)
                    ", result.GetSqliteParamArray());

                    result.Success = true;
                }
            }
        }
        public static void GetAllAreaLogs(ref Result result)
        {
            if (result.ParamExists("AreaID", Result.ParamType.Int))
            {
                result.AddSqliteParam("AreaID", result.GetParam("AreaID"));

                string sql = @"
                SELECT
                (
                    SELECT count(*) from Logs 
	                LEFT JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID
	                LEFT JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID
	                INNER JOIN Steps ON Steps.StepID = Logs.StepID
	                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.AreaID = @AreaID AND Logs.LogSeverity = 1

                ) AS InfoCount,
                (
                    SELECT count(*) from Logs 
	                LEFT JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID 
	                LEFT JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID 
	                INNER JOIN Steps ON Steps.StepID = Logs.StepID
	                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.AreaID = @AreaID AND Logs.LogSeverity = 2
                ) AS GoodCount,
                (
                    SELECT count(*) from Logs 
	                LEFT JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID 
	                LEFT JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID 
	                INNER JOIN Steps ON Steps.StepID = Logs.StepID
	                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.AreaID = @AreaID AND Logs.LogSeverity = 3
                ) AS UglyCount,
                (
                    SELECT count(*) from Logs 
	                LEFT JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID 
	                LEFT JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID 
	                INNER JOIN Steps ON Steps.StepID = Logs.StepID
	                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.AreaID = @AreaID AND Logs.LogSeverity = 4
                ) AS BadCount,
                (
                    SELECT 
	                julianday('now') - julianday(Logs.Created)
                    FROM Logs 
	                LEFT JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID 
	                LEFT JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID 
	                INNER JOIN Steps ON Steps.StepID = Logs.StepID
	                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.AreaID = @AreaID AND Logs.LogSeverity = 4
                    ORDER BY Logs.Created DESC LIMIT 1
                ) AS BadAge,

                0 AS IssueCount

            ";
                result.Data = Data.ExecuteCSSqlite(sql, result.SqliteParams.ToArray());
                result.Success = true;
            }
        }
        public static void GetAreaLogDetail(ref Result result)
        {
            if (result.ParamExists("AreaID", Result.ParamType.Int)
                && result.ParamExists("SeverityID", Result.ParamType.Int))
            {
                result.AddSqliteParam("AreaID", result.GetParam("AreaID"));
                result.AddSqliteParam("SeverityID", result.GetParam("SeverityID"));

                string sql = @"

                    SELECT Logs.* from Logs 
	                LEFT JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID
                    LEFT JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID
	                INNER JOIN Steps ON Steps.StepID = Logs.StepID
	                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.AreaID = @AreaID AND Logs.LogSeverity = @SeverityID
                  
            ";
                var dt = Data.ExecuteCSSqlite(sql, result.SqliteParams.ToArray());
                foreach(DataRow dr in dt.Rows)
                {
                    if (dr["LogSeverity"].ToString() == "4")
                    {
                        dr["Description"] = System.Text.Encodings.Web.JavaScriptEncoder.Default.Encode(dr["Description"].ToString());
					}
                }
                result.Data = dt;
                result.Success = true;

            }
        }
    }
}
