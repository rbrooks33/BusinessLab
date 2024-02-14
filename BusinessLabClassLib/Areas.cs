using System;
using System.Collections.Generic;
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

    }
}
