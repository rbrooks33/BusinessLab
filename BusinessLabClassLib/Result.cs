namespace BusinessLab
{
    public class Result
    {
        public Result()
        {
            SuccessMessages = new List<string>();
            FailMessages = new List<string>();
            Codes = new List<Code>();
            Params = new List<Param>();
        }
        public bool Success { get; set; }
        public List<string> SuccessMessages { get; set; }
        public List<string> FailMessages { get; set; }
        public List<Code> Codes { get; set; }
        public List<Param> Params { get; set; }
        public object? Data { get; set; }
        public string? Message { get; set; }
        public void AddParam(string name, string value)
        {
            Params.Add(new Param { Name = name, Value = value });
        }
        public bool ParamExists(string paramName)
        {
            return Params.Exists(p => p.Name == paramName);
        }
        /// <summary>
        /// Call this only after ParamExists
        /// </summary>
        /// <param name="paramName"></param>
        /// <returns></returns>
        public string GetParam(string paramName)
        {
            string ret = "";
            var param = Params.Where(p => p.Name == paramName).FirstOrDefault();
            if (param != null && param.Value != null)
            {

                ret = param.Value;
            }
            return ret;
        }

    }
	public class Code
    {
        public Code()
        {
            Description = "";
        }
        public int ID { get; set; }
        public string Description { get; set; }
    }
    public class Param
    {
        public string? Value { get; set; }
        public string? Name { get; set; }
    }
}

