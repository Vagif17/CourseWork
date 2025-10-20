using System.Net;
using NP_06._HttpListener_With_HTML;

var listener = new HttpListener();
listener.Prefixes.Add(@"http://localhost:27001/");
listener.Start();
MyDbContext db = new MyDbContext();

while (true)
{
    var context = listener.GetContext();
    var request = context.Request;
    var response = context.Response;
    var login = request.QueryString["login"];
    var password = request.QueryString["password"];
    
    using var reader = new StreamReader(request.InputStream, request.ContentEncoding);
    string body = reader.ReadToEnd(); 
    var parsed = System.Web.HttpUtility.ParseQueryString(body);
    var email = parsed["email"];
    var registerPassword = parsed["registerpassword"];
    var registerConfirmPassword = parsed["registerconfirmpassword"];
    
    StreamWriter streamWriter = new(response.OutputStream);
    Console.WriteLine(HttpMethod.Get.Method);

    if (request.HttpMethod == HttpMethod.Get.Method)
    {
        foreach (var user in db.Users)
        {
            if (user.Email == login && user.Password == password)
            {
                streamWriter.Write($"<h1 style='color:blue;'>Welcome {login}</h1>");
            }
            else
            {
                streamWriter.Write($"<h1 style='color:red;'>Incorrect login or password</h1>");
            }
        }
    }

    if (request.HttpMethod == HttpMethod.Post.Method)
    {

        if (registerPassword == registerConfirmPassword)
        {
            db.Users.Add(new User() { Email = email, Password = registerPassword });
            db.SaveChanges();
        }

        Console.WriteLine("This is post method");
    }




    streamWriter.Close();
}


