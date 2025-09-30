using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using NP_04_TcpClient;
using TcpListener;

var Listener = new System.Net.Sockets.TcpListener(IPAddress.Loopback,27001 );
MyDbContext dbContext = new MyDbContext();

Listener.Start();

while (true)
{
    var client = Listener.AcceptTcpClient();
    var stream = client.GetStream();

    var bw = new BinaryWriter(stream);
    var br = new BinaryReader(stream);

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
                break;
            }

            case Command.get:
            {
                bw.Write(dbContext.Cars.ToList().ToString());
                break;
            }
        }
    }
}