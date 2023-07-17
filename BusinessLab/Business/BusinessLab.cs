namespace BusinessLab
{
    public class Business
    {
        public static void GetAreas(ref Result result)
        {
            string sql = "SELECT * FROM Areas";
            Data.Execute(sql, null, ref result);
        }
    }
}
