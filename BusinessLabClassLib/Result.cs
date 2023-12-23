using System.Dynamic;

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
			DataPropertyValidations = new List<DataPropertyValidation>();
		}
		public enum ParamType
		{
			Int = 1,
			Bool = 2,
			DateTime = 3,
			String = 4,
			Decimal = 5,
			Long = 6
		}
		public string Message { get; set; }
		public bool Success { get; set; }
		public List<string> SuccessMessages { get; set; }
		public List<string> FailMessages { get; set; }
		public List<Code> Codes { get; set; }
		public List<Param> Params { get; set; }
		public List<DataPropertyValidation> DataPropertyValidations { get; set; }
		public object Data { get; set; }
		public ExpandoObject ExpandoData { get; set; }
		public dynamic DynamicData { get; set; }
		public void AddParam(string name, string value)
		{
			Params.Add(new Param { Name = name, Value = value });
		}
		public bool ParamExists(string paramName)
		{
			bool exists = Params.Exists(p => p.Name == paramName);
			if (!exists)
			{
				FailMessages.Add("Param " + paramName + " does not exist.");
			}
			return exists;
		}
		public bool ParamExists(string paramName, ParamType paramType)
		{
			bool exists = ParamExists(paramName);
			bool isType = false;

			if (exists)
			{

				//Check type
				switch (paramType)
				{
					case ParamType.Int: isType = int.TryParse(GetParam(paramName), out int intParam); break;
					case ParamType.Bool: isType = bool.TryParse(GetParam(paramName), out bool boolParam); break;
					case ParamType.DateTime: isType = DateTime.TryParse(GetParam(paramName), out DateTime dtParam); break;
					case ParamType.Decimal: isType = decimal.TryParse(GetParam(paramName), out Decimal decParam); break;
					case ParamType.Long: isType = long.TryParse(GetParam(paramName), out long lParam); break;
					case ParamType.String: isType = !string.IsNullOrEmpty(GetParam(paramName)); break;
				}
				//FailMessages.Add("Param " + paramName + " not provided.");
			}
			return isType;
		}
		public string GetParam(string paramName)
		{
			string ret = "";
			var param = Params.Where(p => p.Name == paramName).SingleOrDefault();
			if (param != null && !string.IsNullOrEmpty(param.Value))
				ret = param.Value;
			else
				FailMessages.Add("No param for " + paramName + " found.");
			return ret;
		}
		//public bool ValidateParams(string[] selectedParams)
		//      {
		//          bool allGood = true;
		//          foreach (string param in selectedParams)
		//          {
		//              if(!ParamExists(param)) { 
		//               allGood = false;
		//                  FailMessages.Add(param + " not there");
		//              }
		//          }
		//          return allGood;
		//      }
		public bool ValidateData()
		{
			FailMessages.Clear();
			SuccessMessages.Clear();

			this.ExpandoData = Newtonsoft.Json.JsonConvert.DeserializeObject<ExpandoObject>(Data.ToString());
			this.DynamicData = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(Data.ToString());

			var k = this.ExpandoData as IDictionary<string, dynamic>;

			var myresult = new Result();

			ValidateDataProp(k, ref myresult);

			//Look for property validations where the prop is missing
			//Creating any validation for a property implies that it is required
			foreach (var key in DataPropertyValidations)
			{
				var val = SuccessMessages.Where(m => m == key.PropertyName).FirstOrDefault();
				if (val == null)
					FailMessages.Add("Data property " + key.PropertyName + " is missing from data object.");
			}

			//Look for existing props in Data that are NOT in
			return FailMessages.Count == 0;
		}

		private void ValidateDataProp(IDictionary<string, dynamic> dict, ref Result myresult)
		{
			if (dict != null)
			{
				foreach (string key in dict.Keys)
				{
					//validate
					SuccessMessages.Add(key); //Using SuccessMessages to hold list of keys

					var val = DataPropertyValidations.Where(v => v.PropertyName == key).FirstOrDefault();
					if (val != null)
					{
						if (this.DynamicData[key] != null)
						{

							//var data = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(this.Data.ToString());
							Type t = this.DynamicData[key].GetType();
							if (t.Name != "JArray")
							{
								try
								{
									if (!val.Validate(Convert.ToString(this.DynamicData[key].Value)))
									{
										FailMessages.Add(key + " Failed validation");
									}
								}
								catch (Exception ex)
								{

								}
							}
							else
								myresult.SuccessMessages.Add("Property " + key + " is there, it is an array");
						}
						else
							FailMessages.Add(key + " is null. Not found in Data object.");
					}

					var k2 = dict[key] as IDictionary<string, dynamic>;

					if (k2 != null)
					{

						foreach (string key2 in k2.Keys)
						{
							////validate
							//var val2 = DataPropertyValidations.Where(v => v.PropertyName == key2).FirstOrDefault();
							//                  if (val2 != null)
							//                  {
							//                      if (!val2.Validate())
							//                      {
							//                          FailMessages.Add(key2 + " Failed validation");
							//                      }
							//                  }

							var k3 = k2[key2] as IDictionary<string, dynamic>;

							if (k2[key2] is List<object>)
							{
								foreach (var key3 in k2[key2])
								{
									myresult.SuccessMessages.Add(key3);
									ValidateDataProp(key3, ref myresult);
								}

							}
							else
							{
								SuccessMessages.Add(key + '.' + key2);

								//validate
								var val3 = DataPropertyValidations.Where(v => v.PropertyName == key + '.' + key2).FirstOrDefault();
								if (val3 != null)
								{
									//var data = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(this.Data.ToString());
									if (this.DynamicData[key][key2] != null)
									{
										Type t = this.DynamicData[key].GetType();
										if (t.Name != "JArray")
										{
											try
											{
												if (!val3.Validate(Convert.ToString(this.DynamicData[key][key2].Value)))
												{
													FailMessages.Add(key + '.' + key2 + " Failed validation");
												}
											}
											catch (Exception ex)
											{

											}
										}
										else
											myresult.SuccessMessages.Add("Property " + key + '.' + key2 + " is there, it is an array");
									}
									else
										FailMessages.Add(key + '.' + key2 + " is null. Not found in Data object.");
								}
								ValidateDataProp(k3, ref myresult);
							}
						}
					}
				}
			}
		}
		public void AddPropertyDataValidation(string propertyName, ParamType propertyType, Func<string, bool> propertyValidator = null)
		{
			DataPropertyValidations.Add(new DataPropertyValidation { PropertyName = propertyName, PropertyType = propertyType, Validator = propertyValidator });
		}

		public class DataPropertyValidation
		{
			public string PropertyName { get; set; }
			public string PropertyValue { get; set; }
			public ParamType PropertyType { get; set; }
			public Func<string, bool> Validator { get; set; }
			public bool Validate(dynamic propVal)
			{
				bool ret = true;

				//If using a validator and string, we assume null is not acceptable at minimum TODO: Discuss other types?

				if (this.PropertyType == ParamType.String && propVal == null)
					ret = false;
				else
				{
					if (Validator != null)
					{
						ret = Validator(propVal);
					}
				}
				return ret;
			}
		}

		public class Code
		{
			public int ID { get; set; }
			public string Description { get; set; }
		}
		public class Param
		{
			public string Name { get; set; }
			public string Value { get; set; }
			public static bool IsStringNotNullOrEmpty(string propVal)
			{
				if (string.IsNullOrEmpty(propVal)) { return false; } else return true;
			}
			public static bool IsIntGreaterThanZero(string val)
			{
				bool ret = false;

				if (int.TryParse(val, out int intval))
				{
					if (intval > 0)
					{
						ret = true;
					}
				}
				return ret;
			}
		}
	}

}
