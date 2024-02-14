using BusinessLabClassLib;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net.Mail;
using System.Runtime.CompilerServices;

namespace BusinessLab
{
	public class Passwordless
	{
		public static bool ValidatePasswordlessToken(ref Result result)
		{
			result.Success = false;
			if (result.ParamExists("Token"))
			{
				var tokenParam = result.Params.Where(p => p.Name == "Token").SingleOrDefault();

				var sql = FormattableStringFactory.Create($@"SELECT * FROM Users WHERE PasswordlessToken = '{result.GetParam("Token")}' AND DATEDIFF(MI, TokenUpdated, getdate()) < 60");

				var tokenRows = Data.Execute(sql);
				if(tokenRows.Rows.Count == 1)
				{
					result.Codes.Add(new Result.Code { ID = 1, Description = "Token validated." });
					result.Success = true;
				}
				else
				{
					result.Codes.Add(new Result.Code { ID = 2, Description = "Token not validated." });
				}

				if (result.Success)
				{
					//extend token expiration
					var extendSql = FormattableStringFactory.Create($@"UPDATE Users SET TokenUpdated = getdate() WHERE PasswordlessToken = '{result.GetParam("Token")}'");
					Data.Execute(extendSql);
				}
			}
			return result.Success;
		}

		public static void GetPasswordlessTokenUser(ref Result result)
		{
			if (result.ParamExists("Token"))
			{
				var sql = FormattableStringFactory.Create($@"SELECT * FROM Users WHERE PasswordlessToken = '{result.GetParam("Token")}'");
				var dt = Data.Execute(sql);
				if (dt != null)
				{
					if (dt.Rows.Count == 1)
					{
						ValidatePasswordlessToken(ref result);

						if (result.Success)
						{
							//user exists, signed in
							result.Data = dt; //Client checks existing data to decide true/false TODO: be more explicit

							var sqlUpdate = FormattableStringFactory.Create($@"
                                UPDATE Users SET 
                                    PasswordlessToken = '{result.GetParam("Token")}', 
                                    TokenUpdated = getdate() 
                                WHERE 
                                    Email = '{dt.Rows[0]["Email"].ToString()}'
                            ");

							Data.Execute(sqlUpdate);
						}
					}
					//else
					//    result.SuccessMessages.Add("dt count is not one. Token not valid.");
					result.Success = true;

				}
				else
					result.FailMessages.Add("dt is null.");
			}

		}
		public static void PasswordlessSignIn(ref Result result)
		{
			if (result.ParamExists("Email"))
			{
				string newPasscode = GetPasscode(6);

				var apiKey = "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"; // Environment.GetEnvironmentVariable("NAME_OF_THE_ENVIRONMENT_VARIABLE_FOR_YOUR_SENDGRID_KEY");
				var client = new SendGridClient(apiKey);
				var from = new EmailAddress("assistance90@live.com", "My Mini Apps");
				var subject = "Verification Passcode: " + newPasscode;
				var to = new EmailAddress(result.GetParam("Email"), "My Mini Apps User");
				var plainTextContent = "Passcode is " + newPasscode; // and easy to do anywhere, even with C#";
				var htmlContent = "<strong>Passcode is " + newPasscode + "</strong>";
				var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
				var response = client.SendEmailAsync(msg).Result;

				if (response.IsSuccessStatusCode)
				{
					//Email success
					var sql = FormattableStringFactory.Create($@"SELECT * FROM Users WHERE Email = '{result.GetParam("Email")}'");
					var dt = Data.Execute(sql);
					if (dt.Rows.Count > 0)
					{
						if (dt.Rows.Count == 1)
						{
							//One account exists for that email
							int userId = Convert.ToInt32(dt.Rows[0]["UserID"]);

							var sqlUpdate = FormattableStringFactory.Create($@"

                                    UPDATE 
                                        Users 
                                    SET 
                                        Passcode = '{newPasscode}', 
                                        TokenUpdated = '{DateTime.Now.ToString()}' 
                                    WHERE 
                                        UserID = {userId}
                                ");

							Data.Execute(sqlUpdate);

							//result.SuccessMessages.Add("Token updated for user " + userId.ToString());
							//result.Data = token;
							result.Codes.Add(
								new Result.Code()
								{
									Description = "Existing user token produced.",
									ID = 1
								});

							result.Success = true;
						}
						else
						{
							//More than one user for that email: a problem :)
							result.FailMessages.Add("More than one account for email " + result.GetParam("Email"));
						}
					}
					else
					{
						//No existing user for that email, create one and return
						result.FailMessages.Add("No account for that email " + result.GetParam("Email") + ". Creating.");


						var sqlUpdate = FormattableStringFactory.Create($@"
                                INSERT INTO Users 
                                    (Email, Passcode, CMSUserID, Firstname, Lastname, TokenUpdated) 
                                VALUES 
                                    ('{result.GetParam("Email")}', '{newPasscode}', 0, 'passcodeuser', 'passcodeuser', getdate())
                            ");

						Data.Execute(sqlUpdate);

						//result.Data = token;
						result.Codes.Add(
							new Result.Code()
							{
								Description = "New user. Token produced.",
								ID = 2
							});

						result.Success = true;
					}
				}
				else
					result.FailMessages.Add("email response failed: " + Newtonsoft.Json.JsonConvert.SerializeObject(result));
			}

		}
		private static string GetPasscode(int length)
		{
			var random = new Random();
			const string chars = "0123456789"; // "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			string passcode = new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
			return passcode;
		}
		public static void VerifyPasscode(ref Result result)
		{
			string token = Guid.NewGuid().ToString();

			if (result.ParamExists("Email") &&
				result.ParamExists("Passcode"))
			{
				var sql = FormattableStringFactory.Create($@"
                SELECT 
                    * 
                FROM 
                    Users 
                WHERE 
                    Email = '{result.GetParam("Email")}' 
                AND 
                    Passcode = '{result.GetParam("Passcode")}'
            ");
				var dt = Data.Execute(sql);
				if (dt != null)
				{
					if (dt.Rows.Count == 1)
					{
						result.Data = token; //Send back token to begin in authenticated state

						//Update with token
						var sqlToken = FormattableStringFactory.Create($@"

                        UPDATE
                            Users
                        SET
                            PasswordlessToken = '{token}'
                        WHERE
                            UserID = {dt.Rows[0]["UserID"]}
                    ");
						Data.Execute(sqlToken);
						result.Success = true;
					}
				}
				else
					result.FailMessages.Add("dt is null.");
			}
		}

	}
}
