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
    }
}
