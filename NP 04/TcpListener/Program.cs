using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TcpListener;

var Listener = new System.Net.Sockets.TcpListener(IPAddress.Parse("127.0.0.1"),27001 );
MyDbContext dbContext = new MyDbContext();

Listener.Start();

var client = Listener.AcceptTcpClient();
var stream = client.GetStream();

var bw = new BinaryWriter(stream);
var br = new BinaryReader(stream);

while (true)
{
    dbContext = new MyDbContext();

    while (true)
    {
        var data =  br.ReadString();
        switch (data)
        {
            case Command.post:
            {
                var car = JsonSerializer.Deserialize<Car>(br.ReadString());
                dbContext.Cars.Add(car);
                dbContext.SaveChanges();
                Console.WriteLine($"{DateTime.Now.Date.ToShortDateString()}: Car added ");
                break;
            }

            case Command.get:
            {
                var cars = dbContext.Cars.ToList(); 
                bw.Write(JsonSerializer.Serialize<List<Car>>(cars));            
                break;
            }

            case Command.put:
            {
                
                var param = JsonSerializer.Deserialize<Command>(br.ReadString());
                // dbContext.Cars.ExecuteUpdate(c => c.SetProperty(a => a,param.Car));
                var carToUpdate = dbContext.Cars.Select(a => a).First(i => i.Id == int.Parse(param.Param));
                
                dbContext.Entry(carToUpdate).CurrentValues.SetValues(param.Car);
                dbContext.SaveChanges();
                
                Console.WriteLine($"{DateTime.Now.Date.ToShortDateString()}: Car updated ");
                break;
            }
        }
    }
}

