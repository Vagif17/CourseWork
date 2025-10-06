using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using NP_04_TcpClient;
using TcpListener;
using Command = NP_04_TcpClient.Command;

var client = new TcpClient();
client.Connect("127.0.0.1", 27001);

var stream = client.GetStream();
var bw = new BinaryWriter(stream);
var br = new BinaryReader(stream);

var message = string.Empty;


while (true)
{
    
    Console.WriteLine("Write 'POST','GET' or 'PUT'" );
    var command = Console.ReadLine().ToUpper();

    switch (command)
    {
        case Command.post:
        {
            bw.Write(command);
            var car = CreateCar();
            
            Console.WriteLine("DataBase Update...");
            bw.Write(JsonSerializer.Serialize(car));
    
            Thread.Sleep(2000);
            break;
        }
        
        case Command.get:
        {
            bw.Write(command);
            Console.Clear();
            GetCars();
            
            Console.WriteLine($"Prees any key to continue");
            Console.ReadKey();
            Console.Clear();
            break;
        }


        case Command.put:
        {
            Console.Clear();
            bw.Write("GET");
            var cars = GetCars();


            Console.Write("Write id: ");
            int id = int.Parse(Console.ReadLine());

            if (cars.Last().Id < id)
            {
                Console.Clear();
                Console.WriteLine("There is no car with this Id \nPress any key to continue");
                Console.ReadKey();
                Console.Clear();
                break;
            }
            
            Console.Clear();
            var car = CreateCar();
            car.Id = id;
            
            var param = new Command(){Car = car,Param = id.ToString()};
          
            bw.Write(command);
            bw.Write(JsonSerializer.Serialize(param));

            Console.WriteLine($"Prees any key to continue");
            Console.ReadKey();
            Console.Clear();
            break;
    }
        
    }
}



Car CreateCar()
{
    Console.Clear();
    
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

List<Car> GetCars()
{
    var cars = JsonSerializer.Deserialize<List<Car>>(br.ReadString());
    if (cars.Count > 0)
    {
        cars.ForEach(Console.WriteLine);
        return cars;
    }
    else
    {
        Console.WriteLine("No Cars Found");
        return null;    
    }
}