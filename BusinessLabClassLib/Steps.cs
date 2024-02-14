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
            result.Data = Data.Execute($"SELECT * FROM Steps ORDER BY StepOrder");
            result.Success = true;
        }

        public static void AddStep(ref Result result)
        {
            var workflowId = result.Params.Where(p => p.Name == "WorkflowID").SingleOrDefault();

            if (workflowId != null)
            {
                FormattableString sql = $"INSERT INTO Steps (StepName, WorkflowID) VALUES ('new step', {workflowId.Value})";
                result.Data = Data.Execute(sql);
                result.Success = true;
            }
            else
                result.FailMessages.Add("No workflow id provided.");
        }
        public static void SaveStep(ref Result result)
        {
            result.ValidateData();
            result.SqliteParams.Clear();

            if (result.ParamExists("StepID", Result.ParamType.Int))
            {
                result.AddSqliteParam("@StepID", (string)result.DynamicData.StepID);
                result.AddSqliteParam("@StepName", (string)result.DynamicData.StepName);
                result.AddSqliteParam("@StepDescription", (string)result.DynamicData.StepDescription);
                result.AddSqliteParam("@FunctionalSpecs", (string)result.DynamicData.FunctionalSpecs);
                result.AddSqliteParam("@StepOrder", (string)result.DynamicData.StepOrder);
                result.AddSqliteParam("@Archived", (string)result.DynamicData.Archived);

                Data.Execute($@"
                        UPDATE Steps 
                        SET StepName = @StepName, 
                        StepDescription = @StepDescription,
                        FunctionalSpecs = @FunctionalSpecs,
                        StepOrder = @StepOrder,
                        Archived = @Archived
                        WHERE StepID = @StepID
                    ", result.GetSqliteParamArray());

                result.Success = true;
            }
        }

    }
}
