using BusinessLab;
using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseHttpsRedirection();
app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "index.html" } });
app.UseStaticFiles();

app.Urls.Add("https://localhost:54322/");

//app.MapGet("/", () => "Hello World!");

app.MapPost("/api", (Result result) =>
{
    try
    {
        Business.GetAreas(ref result);
    }
    catch (System.Exception ex)
    {
        
    }

    return result;

});

app.Run();
