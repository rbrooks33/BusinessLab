using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLabClassLib
{
    public class Steps
    {
        public static void GetSteps(ref Result result)
        {
            result.Data = Data.Execute(Data.CreateParams($"SELECT * FROM Steps ORDER BY StepOrder", $"SELECT * FROM Steps ORDER BY StepOrder",result.Params));
            result.Success = true;
        }

        public static void AddStep(ref Result result)
        {
            var workflowId = result.Params.Where(p => p.Name == "WorkflowID").SingleOrDefault();

            if (workflowId != null)
            {
                string sql = $"INSERT INTO Steps (StepName, WorkflowID) VALUES ('new step', {workflowId.Value})";
                result.Data = Data.Execute(Data.CreateParams(sql, sql, result.Params));
                result.Success = true;
            }
            else
                result.FailMessages.Add("No workflow id provided.");
        }
        public static void SaveStep(ref Result result)
        {
            result.ValidateData();
            result.SqliteParams.Clear();
            result.SqlParams.Clear();

            if (result.ParamExists("StepID", Result.ParamType.Int))
            {
                result.AddSqliteParam("@StepID", (string)result.DynamicData.StepID);
                result.AddSqliteParam("@StepName", (string)result.DynamicData.StepName);
                result.AddSqliteParam("@StepDescription", (string)result.DynamicData.StepDescription);
                result.AddSqliteParam("@FunctionalSpecs", (string)result.DynamicData.FunctionalSpecs);
                result.AddSqliteParam("@StepOrder", (string)result.DynamicData.StepOrder);
                result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

                string sqlite = $@"
                        UPDATE Steps 
                        SET StepName = @StepName, 
                        StepDescription = @StepDescription,
                        FunctionalSpecs = @FunctionalSpecs,
                        StepOrder = @StepOrder,
                        Archived = @Archived
                        WHERE StepID = @StepID
                    ";

				result.AddSqlParam("@StepID", (string)result.DynamicData.StepID);
				result.AddSqlParam("@StepName", (string)result.DynamicData.StepName);
				result.AddSqlParam("@StepDescription", (string)result.DynamicData.StepDescription);
				result.AddSqlParam("@FunctionalSpecs", (string)result.DynamicData.FunctionalSpecs);
				result.AddSqlParam("@StepOrder", (string)result.DynamicData.StepOrder);
				result.AddSqlParam("@Archived", (string)result.DynamicData.Archived);

				//string sql = $@"
    //                    UPDATE Steps 
    //                    SET StepName = @StepName, 
    //                    StepDescription = @StepDescription,
    //                    FunctionalSpecs = @FunctionalSpecs,
    //                    StepOrder = @StepOrder,
    //                    Archived = @Archived
    //                    WHERE StepID = @StepID
    //                ";

                var ps = new Data.ParamSet(sqlite, sqlite);
                ps.SqliteParams = result.SqliteParams;
                ps.SqlParams = result.SqlParams;

                result.Data = Data.Execute(ps);
				result.Success = true;
            }
        }

    }
}
