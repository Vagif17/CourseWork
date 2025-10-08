using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TcpListener;

var listener = new HttpListener();
listener.Prefixes.Add("http://localhost:21007/");
listener.Start();

MyDbContext dbContext = new MyDbContext();

while (true)
{
    var context = listener.GetContext();
    
    var request = context.Request;
    var response = context.Response;
    

    response.AddHeader("Content-Type", "text/plain");
    
    StreamWriter writer = new StreamWriter(response.OutputStream);
    
    
    switch (request.HttpMethod)
    {
        case Command.post:
        {
            using var reader = new StreamReader(request.InputStream, request.ContentEncoding);
            var car = JsonSerializer.Deserialize<Car>(await reader.ReadToEndAsync());
            
            dbContext.Cars.Add(car);
            dbContext.SaveChanges();
            Console.WriteLine($"{DateTime.Now.Date.ToShortDateString()}: Car added ");
            break;
        }

        case Command.get:
        {
            var cars = dbContext.Cars.ToList();
            
            writer.Write(JsonSerializer.Serialize(cars));
            
            break;
        }

        case Command.put:
        {
            using var reader = new StreamReader(request.InputStream, request.ContentEncoding);
            var param = JsonSerializer.Deserialize<Command>(await reader.ReadToEndAsync());

            var car = param.Car;
            var carToUpdate = dbContext.Cars.FirstOrDefault(c => c.Id == int.Parse(param.Param));
            
            dbContext.Cars.Entry(carToUpdate).CurrentValues.SetValues(car);
            dbContext.SaveChanges();
            
            Console.WriteLine($"{DateTime.Now.Date.ToShortDateString()}: Car updated ");
            break;
        }
    }
    
    writer.Close();
}
