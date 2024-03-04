﻿using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
    public class Workflows
    {
        public static void GetWorkflows(ref Result result)
        {
            result.Data = Data.Execute(@$"
                SELECT 
                    *,
                    (SELECT COUNT(*) FROM Steps s WHERE s.WorkflowID = w.WorkflowID) AS StepCount
                FROM 
                    Workflows w", null);
            result.Success = true;
        }
        public static void GetAllWorkflows(ref Result result)
        {
            result.Data = Data.ExecuteCSSqlite(@"
                SELECT * FROM Workflows", null);
            result.Success = true;

        }
        public static void GetAllWorkflowLogs(ref Result result)
        {
            if (result.ParamExists("WorkflowID"))
            {
                var sqliteParams = new List<SqliteParameter>();
                sqliteParams.Add(new SqliteParameter() { ParameterName = "@WorkflowID", Value = result.GetParam("WorkflowID") });
                result.Data = Data.ExecuteCSSqlite(@"
                    SELECT 
                    (
                        SELECT count(*) 
                        FROM 
                            Logs 
                        INNER JOIN 
                            Steps ON Steps.StepID = Logs.StepID 
                        WHERE Steps.WorkflowID = @WorkflowID AND Logs.LogSeverity = 1
                    ) AS InfoCount,
                    (SELECT count(*) from Logs INNER JOIN Steps ON Steps.StepID = Logs.StepID WHERE Steps.WorkflowID = @WorkflowID AND Logs.LogSeverity = 2) AS GoodCount,
                    (SELECT count(*) from Logs INNER JOIN Steps ON Steps.StepID = Logs.StepID WHERE Steps.WorkflowID = @WorkflowID AND Logs.LogSeverity = 3) AS UglyCount,
                    (
                        SELECT count(*) from Logs 
                        INNER JOIN Steps ON Steps.StepID = Logs.StepID 
                        WHERE Steps.WorkflowID = @WorkflowID AND Logs.LogSeverity = 4
                    ) 
                    AS BadCount,
                    (
                        SELECT 
	                    julianday('now') - julianday(Logs.Created)
                        FROM Logs 
                        INNER JOIN Steps ON Steps.StepID = Logs.StepID 
                        WHERE Steps.WorkflowID = @WorkflowID AND Logs.LogSeverity = 4
                        ORDER BY Logs.Created DESC LIMIT 1
                    ) AS BadAge,

                    0 AS IssueCount

                ", sqliteParams.ToArray());
                result.Success = true;
            }
        }
		public static void GetWorkflowLogDetail(ref Result result)
		{
			if (result.ParamExists("WorkflowID", Result.ParamType.Int)
				&& result.ParamExists("SeverityID", Result.ParamType.Int))
			{
				result.AddSqliteParam("WorkflowID", result.GetParam("WorkflowID"));
				result.AddSqliteParam("SeverityID", result.GetParam("SeverityID"));

				string sql = @"

                    SELECT Logs.* from Logs 
	                INNER JOIN Actions_Steps ON Actions_Steps.StepID = Logs.StepID
	                LEFT JOIN Steps ON Steps.StepID = Logs.StepID
	                LEFT JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.WorkflowID = @WorkflowID AND Logs.LogSeverity = @SeverityID
                    UNION
                    SELECT Logs.* from Logs 
	                LEFT JOIN Apps_Steps ON Apps_Steps.StepID = Logs.StepID
	                LEFT JOIN Steps ON Steps.StepID = Logs.StepID
	                INNER JOIN Workflows ON Workflows.WorkflowID = Steps.WorkflowID
	                WHERE Workflows.WorkflowID = @WorkflowID AND Logs.LogSeverity = @SeverityID
            ";
				result.Data = Data.ExecuteCSSqlite(sql, result.SqliteParams.ToArray());
				result.Success = true;

			}
		}
		public static void SaveWorkflow(ref Result result)
        {
            result.ValidateData();
            result.SqliteParams.Clear();

            var workflow = JsonConvert.DeserializeObject<dynamic>(result.Data.ToString());

            FormattableString sql = @$"
                
                UPDATE Workflows SET 
                    WorkflowName = {workflow.WorkflowName.Value},
                    WorkflowDescription = {workflow.WorkflowDescription.Value}
                WHERE 
                    WorkflowID = {workflow.WorkflowID.Value}";

            result.Data = Data.Execute(sql);
            result.Success = true;
        }
        public static void AddWorkflow(ref Result result)
        {
            var areaIdParam = result.Params.Where(p => p.Name == "AreaID").SingleOrDefault();

            if (areaIdParam != null)
            {
                FormattableString sql = $"INSERT INTO Workflows (WorkflowName, WorkflowDescription, AreaID) VALUES ('new workflow', '@nbsp;@nbsp;@nbsp;', {areaIdParam.Value})";
                result.Data = Data.Execute(sql);
                result.Success = true;
            }
            else
                result.FailMessages.Add("AreaID was not included in parasm.");
        }

    }
}
