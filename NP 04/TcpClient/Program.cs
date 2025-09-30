using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using NP_04_TcpClient;
using TcpListener;

var client = new TcpClient();
client.Connect("127.0.0.1", 27001);

var stream = client.GetStream();
var bw = new BinaryWriter(stream);
var br = new BinaryReader(stream);

var message = string.Empty;


while (true)
{
    Console.WriteLine("Write 'POST','GET' or 'PUT'" );
    var command = Console.ReadLine().ToLower();

    switch (command)
    {
        case Command.get:
        {
            bw.Write(command.ToUpper());
            var data = br.ReadString();
            Console.WriteLine($"{data}\nPrees any key to continue");
            Console.ReadKey();
            break;
        }

        case Command.post:
        {
            var car = CreateCar();
            
            Console.WriteLine("DataBase Update...");
            bw.Write(JsonSerializer.Serialize(car));
    
            Thread.Sleep(2000);
            Console.Clear();
            
            break;
        }
        
        case Command.put:
        {
            
            Console.WriteLine("Write Id : ");
            var car = CreateCar();
            
            break;
        }
    }
}



Car CreateCar()
{
    Console.WriteLine("Mark : ");
    string Mark = Console.ReadLine();
    Console.Clear();
            
    Console.WriteLine("Model: ");
    string Model = Console.ReadLine();
    Console.Clear();
            
    Console.WriteLine("Year: ");
    int Year = int.Parse(Console.ReadLine());
    Console.Clear();
            
    Console.WriteLine("Color: ");
    string Color = Console.ReadLine();
    Console.Clear();
    
    return  new Car(){Model = Model, Year = Year, Color = Color, Mark = Mark};
    
}