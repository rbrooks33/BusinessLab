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

